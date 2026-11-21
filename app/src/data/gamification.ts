// Motor de gamificação gentil do Evura (inspirado nas mecânicas do Foodvisor 7.8.1,
// adaptado ao foco de saúde e longevidade — sem pressão nem dark patterns).
import type { AreaId } from './areas';
import type { Log, LogKind, StreakGoal, StreakState } from './types';
import { addDays, dayKey } from './dates';

export type DayStatus = 'done' | 'freeze' | 'missed' | 'today';

export type StreakSummary = {
  current: number;
  best: number;
  activeToday: boolean;
  goalDays: StreakGoal;
  goalLabel: string;
  progressPct: number;
  freezes: number;
  totalDaysLogged: number;
  week: { day: string; label: string; status: DayStatus }[];
  canProtectYesterday: boolean;
  yesterdayKey: string;
};

export const STREAK_GOALS: { days: StreakGoal; label: string; desc: string }[] = [
  { days: 7, label: 'Bom', desc: '1 semana de constância' },
  { days: 14, label: 'Ótimo', desc: '2 semanas firmando o ritmo' },
  { days: 30, label: 'Incrível', desc: '1 mês de hábito consolidado' },
  { days: 50, label: 'Imparável', desc: 'Constância de longevidade' },
];

const WEEK_LETTERS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export function computeStreak(logs: Log[], streakState: StreakState, today = dayKey()): StreakSummary {
  const live = logs.filter((l) => !l.deleted);
  const daysSet = new Set(live.map((l) => l.day));
  const freezeSet = new Set(streakState.usedFreezeDays);
  const activeToday = daysSet.has(today);

  // Conta sequência retroativa a partir de hoje (ou ontem se hoje ainda não registrou)
  let current = 0;
  let cursor = activeToday ? today : addDays(today, -1);
  for (let i = 0; i < 365; i++) {
    if (daysSet.has(cursor) || freezeSet.has(cursor)) {
      current++;
      cursor = addDays(cursor, -1);
    } else {
      break;
    }
  }

  const best = Math.max(streakState.bestStreak, current);
  const goalObj = STREAK_GOALS.find((g) => g.days === streakState.goalDays) ?? STREAK_GOALS[0];

  // Calendário linear dos últimos 7 dias
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(today, i - 6);
    const dt = new Date(`${d}T12:00:00`);
    const label = WEEK_LETTERS[dt.getDay()];
    let status: DayStatus = 'missed';
    if (daysSet.has(d)) status = 'done';
    else if (freezeSet.has(d)) status = 'freeze';
    else if (d === today) status = 'today';
    return { day: d, label, status };
  });

  const yesterdayKey = addDays(today, -1);
  const twoDaysAgo = addDays(today, -2);
  const canProtectYesterday =
    streakState.freezes > 0 &&
    !daysSet.has(yesterdayKey) &&
    !freezeSet.has(yesterdayKey) &&
    daysSet.has(twoDaysAgo);

  return {
    current,
    best,
    activeToday,
    goalDays: streakState.goalDays,
    goalLabel: goalObj.label,
    progressPct: Math.min(1, current / streakState.goalDays),
    freezes: streakState.freezes,
    totalDaysLogged: daysSet.size,
    week,
    canProtectYesterday,
    yesterdayKey,
  };
}

// ---------- Evolução do mascote Evu (baseado na constância real) ----------

export type EvuStage = {
  level: number;
  title: string;
  subtitle: string;
  minDays: number;
  nextDays: number | null;
  progressPct: number;
  mood: 'hi' | 'calm' | 'think' | 'cheer';
};

const STAGES: Omit<EvuStage, 'nextDays' | 'progressPct'>[] = [
  { level: 1, title: 'Semente curiosa', subtitle: 'Seus primeiros registros despertam o Evu.', minDays: 0, mood: 'hi' },
  { level: 2, title: 'Broto de constância', subtitle: 'Os primeiros padrões começam a aparecer.', minDays: 3, mood: 'calm' },
  { level: 3, title: 'Folha firme', subtitle: 'Sua rotina de 7 dias já alimenta descobertas.', minDays: 7, mood: 'cheer' },
  { level: 4, title: 'Raiz forte', subtitle: 'Hábitos sustentáveis que protegem sua energia.', minDays: 14, mood: 'cheer' },
  { level: 5, title: 'Guardião da longevidade', subtitle: 'Constância madura e escolhas conscientes.', minDays: 30, mood: 'cheer' },
];

export function evuStage(totalDaysLogged: number): EvuStage {
  let idx = 0;
  for (let i = STAGES.length - 1; i >= 0; i--) {
    if (totalDaysLogged >= STAGES[i].minDays) {
      idx = i;
      break;
    }
  }
  const cur = STAGES[idx];
  const next = STAGES[idx + 1] ?? null;
  const progressPct = next
    ? Math.min(1, Math.max(0, (totalDaysLogged - cur.minDays) / Math.max(1, next.minDays - cur.minDays)))
    : 1;
  return { ...cur, nextDays: next ? next.minDays : null, progressPct };
}

// ---------- Missões diárias ligadas ao foco e às hipóteses ----------

export type DailyMission = {
  id: string;
  title: string;
  desc: string;
  done: boolean;
  kind?: LogKind;
  route?: string;
};

export function dailyMissions(
  area: AreaId | undefined,
  todayLogs: Log[],
  completedLessons: string[],
  manualDoneIds: string[],
): DailyMission[] {
  const has = (k: LogKind) => todayLogs.some((l) => l.kind === k);
  const waterMl = todayLogs.filter((l) => l.kind === 'water').reduce((a, l) => a + (l.kind === 'water' ? l.ml : 0), 0);

  const focusMission: DailyMission = (() => {
    switch (area) {
      case 'long':
        return {
          id: 'm_focus_long',
          title: 'Registrar movimento ou sono de hoje',
          desc: 'Base para acompanhar seus pilares de longevidade.',
          done: has('move') || has('sleep'),
          kind: 'move',
          route: '/registro/move',
        };
      case 'sono':
        return {
          id: 'm_focus_sono',
          title: 'Avaliar sua noite de sono',
          desc: 'Ajuda o motor a cruzar cafeína, telas e descanso.',
          done: has('sleep'),
          kind: 'sleep',
          route: '/registro/sleep',
        };
      case 'intes':
        return {
          id: 'm_focus_intes',
          title: 'Anotar refeição e fibras de hoje',
          desc: 'Cruza alimentação com sinais de inchaço.',
          done: has('meal'),
          kind: 'meal',
          route: '/registro/meal',
        };
      default:
        return {
          id: 'm_focus_meal',
          title: 'Registrar sua refeição mais recente',
          desc: 'Leva menos de 1 minuto e ativa sua sequência.',
          done: has('meal'),
          kind: 'meal',
          route: '/registro/meal',
        };
    }
  })();

  return [
    focusMission,
    {
      id: 'm_water',
      title: 'Beber pelo menos 1 L de água',
      desc: waterMl > 0 ? `Você já registrou ${(waterMl / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} L hoje.` : 'Comece com um copo de 250 ml.',
      done: waterMl >= 1000 || manualDoneIds.includes('m_water'),
      kind: 'water',
      route: '/registro/water',
    },
    {
      id: 'm_lesson',
      title: 'Ler 1 aula curta em Descobertas',
      desc: 'Leitura de 2 minutos sobre ciência do hábito e saúde.',
      done: completedLessons.length > 0 || manualDoneIds.includes('m_lesson'),
      route: '/descobertas',
    },
  ];
}
