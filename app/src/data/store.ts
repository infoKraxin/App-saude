// Estado local do app. O aparelho é a fonte de verdade do dia a dia: tudo é gravado aqui
// primeiro (funciona offline) e depois sobe para o Supabase pela fila de sincronização
// (src/lib/sync.ts). Um único objeto serializado; troca para SQLite quando o volume pedir.

import { useMemo, useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppState, Log, Prefs, Profile, StreakGoal, StreakState } from './types';
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

export const defaultStreak: StreakState = {
  goalDays: 7,
  freezes: 2,
  usedFreezeDays: [],
  bestStreak: 0,
  lastCelebratedStreak: 0,
};

const initial: AppState = {
  version: 1,
  profile: null,
  prefs: defaultPrefs,
  logs: [],
  favorites: [],
  feedback: [],
  streak: defaultStreak,
  evuName: 'Evu',
  completedLessons: [],
  lessonFeedback: {},
  completedMissions: {},
  tutorialSeen: false,
};

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
      const parsed = JSON.parse(raw) as Partial<AppState>;
      state = {
        ...initial,
        ...parsed,
        prefs: { ...defaultPrefs, ...parsed.prefs, notif: { ...defaultPrefs.notif, ...parsed.prefs?.notif } },
        streak: { ...defaultStreak, ...parsed.streak },
        completedLessons: parsed.completedLessons ?? [],
        lessonFeedback: parsed.lessonFeedback ?? {},
        completedMissions: parsed.completedMissions ?? {},
        evuName: parsed.evuName || 'Evu',
      };
      if (!(parsed as { themeV2?: boolean }).themeV2) {
        state = { ...state, prefs: { ...state.prefs, theme: state.prefs.theme === 'dark' ? 'dark' : 'light' } };
      }
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
  const today = dayKey();
  const log = { id: uid(), at: now, updatedAt: now, day: today, source: 'manual', ...entry } as Log;
  setState((s) => ({ ...s, logs: [...s.logs, log], lastActiveDay: today }));
  return log;
}

export function updateLog(id: string, patch: Partial<Log>) {
  const now = new Date().toISOString();
  setState((s) => ({
    ...s,
    logs: s.logs.map((l) => (l.id === id ? ({ ...l, ...patch, updatedAt: now, synced: false } as Log) : l)),
  }));
}

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

// ---------- gamificação, aulas e reativação ----------

export function setStreakGoal(goalDays: StreakGoal) {
  setState((s) => ({ ...s, streak: { ...s.streak, goalDays } }));
}

export function updateBestStreak(best: number) {
  setState((s) => (best > s.streak.bestStreak ? { ...s, streak: { ...s.streak, bestStreak: best } } : s));
}

export function useFreezeOnDay(day: string) {
  setState((s) => {
    if (s.streak.freezes <= 0 || s.streak.usedFreezeDays.includes(day)) return s;
    return {
      ...s,
      streak: {
        ...s.streak,
        freezes: Math.max(0, s.streak.freezes - 1),
        usedFreezeDays: [...s.streak.usedFreezeDays, day],
      },
    };
  });
}

export function setEvuName(evuName: string) {
  setState((s) => ({ ...s, evuName: evuName.trim().slice(0, 20) || 'Evu' }));
}

export function completeLesson(lessonId: string) {
  setState((s) => ({
    ...s,
    completedLessons: s.completedLessons.includes(lessonId) ? s.completedLessons : [...s.completedLessons, lessonId],
  }));
}

export function rateLesson(lessonId: string, liked: boolean) {
  setState((s) => ({ ...s, lessonFeedback: { ...s.lessonFeedback, [lessonId]: liked } }));
}

export function toggleMission(missionId: string, day = dayKey()) {
  setState((s) => {
    const cur = s.completedMissions[day] ?? [];
    const next = cur.includes(missionId) ? cur.filter((x) => x !== missionId) : [...cur, missionId];
    return { ...s, completedMissions: { ...s.completedMissions, [day]: next } };
  });
}

export function markTutorialSeen() {
  setState((s) => ({ ...s, tutorialSeen: true }));
}

export function saveReactivation(strategies: string[]) {
  setState((s) => ({ ...s, reactivationStrategies: strategies, lastActiveDay: dayKey() }));
}

export const exportData = () => JSON.stringify({ exportadoEm: new Date().toISOString(), ...state }, null, 2);

export async function wipeAll() {
  state = initial;
  await AsyncStorage.removeItem(KEY);
  emit();
}

export const liveLogs = (logs: Log[]) => logs.filter((l) => !l.deleted);

export function useLiveLogs() {
  const logs = useApp((s) => s.logs);
  return useMemo(() => liveLogs(logs), [logs]);
}
