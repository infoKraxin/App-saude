import { useMemo } from 'react';
import { useApp, useLiveLogs } from '../data/store';
import { dayKey, diffDays } from '../data/dates';
import { summarize } from '../engine/summary';
import { buildReport } from '../engine/report';
import type { LogKind } from '../data/types';

export type Task = { kind: LogKind; label: string; done: boolean; detail: string };

export function useToday(day = dayKey()) {
  const logs = useLiveLogs();
  const profile = useApp((s) => s.profile);
  const prefs = useApp((s) => s.prefs);
  return useMemo(() => {
    const sum = summarize(day, logs);
    const water = sum.waterMl ?? 0;
    const tasks: Task[] = [
      { kind: 'water', label: 'Água', done: water >= prefs.waterGoalMl, detail: `${(water / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} de ${(prefs.waterGoalMl / 1000).toLocaleString('pt-BR')} L` },
      { kind: 'meal', label: 'Refeições', done: sum.meals >= 2, detail: sum.meals ? `${sum.meals} registrada${sum.meals > 1 ? 's' : ''}` : 'Nenhuma ainda' },
      { kind: 'sleep', label: 'Sono', done: sum.sleepH != null, detail: sum.sleepH != null ? `${sum.sleepH.toLocaleString('pt-BR')} h, nota ${sum.sleepQ}` : 'Como foi a noite?' },
      { kind: 'feel', label: 'Como me sinto', done: sum.energy != null, detail: sum.energy != null ? 'Registrado' : 'Energia, fome, humor' },
      { kind: 'move', label: 'Movimento', done: sum.move != null, detail: sum.move == null ? 'Ainda não' : ['Nada hoje', 'Leve', 'Moderado', 'Intenso'][sum.move] ?? '' },
    ];
    const report = profile ? buildReport(profile, logs, day) : null;
    const trialDay = profile?.trialStart ? diffDays(profile.trialStart, day) + 1 : 1;
    const eventDays = profile?.eventDate ? diffDays(day, profile.eventDate) : null;
    return { sum, tasks, report, trialDay, eventDays, water };
  }, [day, logs, profile, prefs.waterGoalMl]);
}
