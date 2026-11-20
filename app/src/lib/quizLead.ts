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
