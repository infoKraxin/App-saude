// Portão de segurança. Roda antes de qualquer relatório. Quando dispara, o app deixa de
// mostrar números de peso, projeção e metas de déficit, e orienta procurar atendimento.

import type { Profile } from '../data/types';
import type { DaySummary } from './summary';
import { ALARM_SYMPTOMS } from '../data/areas';
import { diffDays } from '../data/dates';

export type SafetyState = {
  mode: 'normal' | 'cuidado';
  reasons: string[];
  hideNumbers: boolean; // esconde peso, projeção e calorias
  urgent: boolean; // sintoma de alerta: mensagem de atendimento no topo
};

export function safety(profile: Profile | null, days: DaySummary[], now = new Date()): SafetyState {
  const reasons: string[] = [];
  let hideNumbers = false;
  let urgent = false;
  if (profile) {
    const { pregnant, breastfeeding, eatingDisorder } = profile.safety;
    if (pregnant) reasons.push('gestação');
    if (breastfeeding) reasons.push('amamentação');
    if (eatingDisorder) reasons.push('histórico de transtorno alimentar');
    if (pregnant || breastfeeding || eatingDisorder) hideNumbers = true;
    if (profile.birthYear && now.getFullYear() - profile.birthYear < 18) {
      reasons.push('menor de 18 anos');
      hideNumbers = true;
    }
  }
  // perda rápida: mais de 1,5% do peso por semana, medida em pelo menos 14 dias
  const w = days.filter((d) => d.weightKg != null).sort((a, b) => a.day.localeCompare(b.day));
  if (w.length >= 2) {
    const first = w[0];
    const last = w[w.length - 1];
    const span = diffDays(first.day, last.day);
    if (span >= 14) {
      const perWeek = ((first.weightKg! - last.weightKg!) / first.weightKg!) * (7 / span);
      if (perWeek > 0.015) {
        reasons.push('perda de peso rápida');
        hideNumbers = true;
      }
    }
  }
  // sintoma de alerta nos últimos 3 dias registrados, em nível alto
  const recent = [...days].sort((a, b) => b.day.localeCompare(a.day)).slice(0, 3);
  if (recent.some((d) => Object.entries(d.symptoms).some(([id, lvl]) => ALARM_SYMPTOMS.has(id) && lvl >= 3))) {
    reasons.push('sintoma forte');
    urgent = true;
  }
  return { mode: reasons.length ? 'cuidado' : 'normal', reasons, hideNumbers, urgent };
}
