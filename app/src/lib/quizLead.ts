import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Endereço do quiz (o mesmo do site). No app nativo ele abre numa WebView.
export const QUIZ_URL = process.env.EXPO_PUBLIC_QUIZ_URL ?? 'https://appaurasaude.vercel.app/?from=app';

// Resultado do quiz guardado no aparelho: na web o quiz grava em localStorage (mesmo domínio);
// no app nativo a WebView envia por mensagem e o app guarda aqui.
export async function readLocalQuiz(): Promise<{ email?: string; area?: string; answers?: Record<string, unknown>; hypotheses?: string[] } | null> {
  try {
    const raw = Platform.OS === 'web' ? globalThis.localStorage?.getItem('evura_quiz') : await AsyncStorage.getItem('evura_quiz');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
export const saveLocalQuiz = (p: unknown) => AsyncStorage.setItem('evura_quiz', JSON.stringify(p)).catch(() => {});

// Converte o lead do quiz (tabela quiz_leads) no perfil do app.
import type { Profile } from '../data/types';
import { areaById, type AreaId } from '../data/areas';

const EVENTS = ['Férias', 'Casamento', 'Festa ou encontro', 'Aniversário', 'Viagem'];

export function emptyProfile(email?: string): Profile {
  return {
    name: '', email, area: 'emag', extraAreas: [], motive: '', safety: { pregnant: false, breastfeeding: false, eatingDisorder: false },
    hypotheses: [], onboarded: false, consents: {}, cycleTracking: false, usesPen: false,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function leadToProfile(lead: any, email: string): Profile {
  const p = emptyProfile(email);
  if (!lead) return p;
  const a = lead.answers ?? {};
  const area = (lead.area ?? 'emag') as AreaId;
  const cond: string[] = Array.isArray(a.cond) ? a.cond.map(String) : [];
  const has = (re: RegExp) => cond.some((x) => re.test(x.toLowerCase()));
  return {
    ...p,
    fromQuiz: true,
    name: String(a.name ?? '').slice(0, 40),
    area,
    sex: a.sex === 'Homem' ? 'm' : a.sex === 'Mulher' ? 'f' : undefined,
    birthYear: typeof a.age === 'number' ? new Date().getFullYear() - a.age : undefined,
    heightCm: typeof a.h === 'number' ? a.h : undefined,
    startWeightKg: typeof a.w === 'number' ? a.w : undefined,
    goalWeightKg: typeof a.wg === 'number' ? a.wg : undefined,
    motive: Array.isArray(a.motiv) && a.motiv.length ? String(a.motiv[0]) : '',
    eventName: EVENTS.includes(a.event) ? a.event : undefined,
    eventDate: typeof a.edate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(a.edate) ? a.edate : undefined,
    safety: { pregnant: has(/gravidez/), breastfeeding: false, eatingDisorder: has(/alimentar/) },
    hypotheses: Array.isArray(lead.hypotheses) && lead.hypotheses.length ? lead.hypotheses : areaById(area).defaultHypotheses,
    usesPen: area === 'cane',
  };
}
