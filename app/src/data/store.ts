// Estado local do app. O aparelho é a fonte de verdade do dia a dia: tudo é gravado aqui
// primeiro (funciona offline) e depois sobe para o Supabase pela fila de sincronização
// (src/lib/sync.ts). Um único objeto serializado; troca para SQLite quando o volume pedir.

import { useMemo, useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppState, Log, Prefs, Profile } from './types';
import { dayKey } from './dates';

const KEY = 'evura:v1';

export const defaultPrefs: Prefs = {
  theme: 'light',
  textScale: 1,
  reduceMotion: 'system',
  hideWeight: false,
  hideCalories: true,
  hideProjection: false,
  mascot: true,
  simpleLanguage: false,
  haptics: true,
  units: 'metric',
  waterGoalMl: 2000,
  notif: {
    logs: true,
    water: true,
    report: true,
    med: true,
    community: false,
    marketing: false,
    reminderTime: '20:00',
    quietFrom: '22:00',
    quietTo: '07:00',
    maxPerDay: 3,
  },
  lockApp: false,
};

const initial: AppState = { version: 1, profile: null, prefs: defaultPrefs, logs: [], favorites: [], feedback: [] };

let state: AppState = initial;
let loaded = false;
const listeners = new Set<() => void>();
let saveTimer: ReturnType<typeof setTimeout> | null = null;

const emit = () => listeners.forEach((l) => l());

const persist = () => {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  }, 250);
};

export const setState = (fn: (s: AppState) => AppState) => {
  state = fn(state);
  emit();
  persist();
};

export const getState = () => state;

export async function loadState() {
  if (loaded) return state;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      state = { ...initial, ...parsed, prefs: { ...defaultPrefs, ...parsed.prefs, notif: { ...defaultPrefs.notif, ...parsed.prefs?.notif } } };
      // v2: tema claro por padrão; quem estava em "do sistema" sem ter escolhido volta para o claro.
      if (!(parsed as { themeV2?: boolean }).themeV2) { state = { ...state, prefs: { ...state.prefs, theme: state.prefs.theme === 'dark' ? 'dark' : 'light' } }; }
      (state as { themeV2?: boolean }).themeV2 = true;
    }
  } catch {
    // arquivo corrompido: começa limpo, sem travar o app
  }
  loaded = true;
  emit();
  return state;
}

export const isLoaded = () => loaded;

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useApp<T>(sel: (s: AppState) => T): T {
  return useSyncExternalStore(subscribe, () => sel(state), () => sel(state));
}

// ---------- ações ----------

const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

type DistOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
type NewLog = DistOmit<Log, 'id' | 'at' | 'updatedAt' | 'day' | 'source'> & { day?: string; source?: Log['source'] };

export function addLog(entry: NewLog): Log {
  const now = new Date().toISOString();
  const log = { id: uid(), at: now, updatedAt: now, day: dayKey(), source: 'manual', ...entry } as Log;
  setState((s) => ({ ...s, logs: [...s.logs, log] }));
  return log;
}

export function updateLog(id: string, patch: Partial<Log>) {
  const now = new Date().toISOString();
  setState((s) => ({
    ...s,
    logs: s.logs.map((l) => (l.id === id ? ({ ...l, ...patch, updatedAt: now, synced: false } as Log) : l)),
  }));
}

// Apagar é lógico: some da tela, mas sobe para o servidor como apagado (apagar vence editar).
export const removeLog = (id: string) => updateLog(id, { deleted: true });
export const restoreLog = (id: string) => updateLog(id, { deleted: false });

export function setProfile(patch: Partial<Profile>) {
  setState((s) => ({ ...s, profile: { ...(s.profile as Profile), ...patch } }));
}

export function setPrefs(patch: Partial<Omit<Prefs, 'notif'>> & { notif?: Partial<Prefs['notif']> }) {
  setState((s) => ({ ...s, prefs: { ...s.prefs, ...patch, notif: { ...s.prefs.notif, ...(patch.notif ?? {}) } } }));
}

export function saveFavorite(f: AppState['favorites'][number]) {
  setState((s) => ({ ...s, favorites: [f, ...s.favorites.filter((x) => x.text !== f.text)].slice(0, 30) }));
}

export function giveFeedback(findingId: string, useful: boolean) {
  setState((s) => ({ ...s, feedback: [...s.feedback, { findingId, day: dayKey(), useful }] }));
}

export const exportData = () => JSON.stringify({ exportadoEm: new Date().toISOString(), ...state }, null, 2);

export async function wipeAll() {
  state = initial;
  await AsyncStorage.removeItem(KEY);
  emit();
}

// Seletores. `useApp` precisa receber seletores que devolvem referências já existentes
// (s.logs, s.profile); derivados são calculados com useMemo para não recriar a cada leitura.
export const liveLogs = (logs: Log[]) => logs.filter((l) => !l.deleted);

export function useLiveLogs() {
  const logs = useApp((s) => s.logs);
  return useMemo(() => liveLogs(logs), [logs]);
}
