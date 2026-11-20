// Resumo de um dia a partir dos registros. Tudo que o motor compara sai daqui.
import type { Log } from '../data/types';
import { hoursBetween } from '../data/dates';

export type DaySummary = {
  day: string;
  logged: boolean;
  waterMl: number | null;
  meals: number;
  proteinMeals: number | null;
  fiberMeals: number | null;
  ultraMeals: number | null;
  alcohol: boolean | null;
  sleepH: number | null; // noite que terminou neste dia
  sleepQ: number | null;
  caffeineLate: boolean | null; // na tarde/noite deste dia
  screenLate: boolean | null;
  energy: number | null;
  hunger: number | null;
  mood: number | null;
  stress: number | null;
  move: number | null;
  symptoms: Record<string, number>; // id -> maior nível do dia
  symptomLogged: boolean;
  weightKg: number | null;
  waistCm: number | null;
  med: boolean;
  cycle: string | null;
};

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

export function summarize(day: string, logs: Log[]): DaySummary {
  const L = logs.filter((l) => l.day === day && !l.deleted);
  const water = L.filter((l) => l.kind === 'water');
  const meals = L.filter((l) => l.kind === 'meal');
  const sleep = L.filter((l) => l.kind === 'sleep').at(-1);
  const evening = L.filter((l) => l.kind === 'evening').at(-1);
  const feels = L.filter((l) => l.kind === 'feel');
  const moves = L.filter((l) => l.kind === 'move');
  const sym = L.filter((l) => l.kind === 'symptom');
  const meas = L.filter((l) => l.kind === 'measure');
  const cyc = L.filter((l) => l.kind === 'cycle').at(-1);
  const symptoms: Record<string, number> = {};
  sym.forEach((s) => s.kind === 'symptom' && s.items.forEach((i) => (symptoms[i.id] = Math.max(symptoms[i.id] ?? 0, i.level))));
  const lastW = [...meas].reverse().find((m) => m.kind === 'measure' && m.weightKg != null);
  const lastC = [...meas].reverse().find((m) => m.kind === 'measure' && m.waistCm != null);
  const m = meals.filter((x) => x.kind === 'meal');
  const f = (k: 'energy' | 'hunger' | 'mood' | 'stress') => avg(feels.map((x) => (x.kind === 'feel' ? x[k] : 0)));
  return {
    day,
    logged: L.length > 0,
    waterMl: water.length ? water.reduce((a, w) => a + (w.kind === 'water' ? w.ml : 0), 0) : null,
    meals: m.length,
    proteinMeals: m.length ? m.filter((x) => x.protein).length : null,
    fiberMeals: m.length ? m.filter((x) => x.fiber).length : null,
    ultraMeals: m.length ? m.filter((x) => x.ultra).length : null,
    alcohol: m.length ? m.some((x) => x.alcohol) : null,
    sleepH: sleep && sleep.kind === 'sleep' ? hoursBetween(sleep.bed, sleep.wake) : null,
    sleepQ: sleep && sleep.kind === 'sleep' ? sleep.quality : null,
    caffeineLate: evening && evening.kind === 'evening' ? evening.caffeineLate : null,
    screenLate: evening && evening.kind === 'evening' ? evening.screenLate : null,
    energy: f('energy'),
    hunger: f('hunger'),
    mood: f('mood'),
    stress: f('stress'),
    move: moves.length ? Math.max(...moves.map((x) => (x.kind === 'move' ? x.level : 0))) : null,
    symptoms,
    symptomLogged: sym.length > 0,
    weightKg: lastW && lastW.kind === 'measure' ? lastW.weightKg ?? null : null,
    waistCm: lastC && lastC.kind === 'measure' ? lastC.waistCm ?? null : null,
    med: L.some((l) => l.kind === 'med'),
    cycle: cyc && cyc.kind === 'cycle' ? cyc.phase : null,
  };
}
