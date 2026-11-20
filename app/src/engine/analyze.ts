// Motor de cruzamento v0. Determinístico: mesmos dados, mesmo resultado.
// Compara os dias com e sem a exposição, mede a diferença em desvios-padrão (d de Cohen)
// e só sobe o nível de confiança com dados suficientes e sem outra mudança grande junto.

import type { Hypothesis } from './hypotheses';
import { HYPOTHESES } from './hypotheses';
import type { DaySummary } from './summary';
import { addDays } from '../data/dates';

export type Confidence = 'sem_dado' | 'pouco_dado' | 'sem_sinal' | 'sinal_fraco' | 'sinal_consistente';

export const PARAMS = {
  minPouco: 1, // a partir de 1 dia de cada lado já é "pouco dado"
  minFraco: 5, // dias de cada lado para "sinal fraco"
  minConsistente: 10, // dias de cada lado para "sinal consistente"
  minEffect: 0.5, // d de Cohen mínimo
  confounderGap: 0.4, // diferença de frequência de outra exposição entre os grupos
};

export type Result = {
  hypothesis: Hypothesis;
  nWith: number;
  nWithout: number;
  meanWith: number | null;
  meanWithout: number | null;
  diff: number | null; // com - sem
  effect: number | null; // d
  confidence: Confidence;
  confounder?: string; // rótulo da outra exposição que andou junto
  missing: number; // dias que ainda faltam de cada lado para "sinal fraco"
};

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
const sd = (xs: number[]) => {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  return Math.sqrt(xs.reduce((a, x) => a + (x - m) ** 2, 0) / (xs.length - 1));
};

type Pair = { day: string; exp: boolean; out: number };

function pairs(h: Hypothesis, byDay: Map<string, DaySummary>): Pair[] {
  const out: Pair[] = [];
  byDay.forEach((d, day) => {
    const e = h.exposure(d);
    if (e == null) return;
    const target = h.lag ? byDay.get(addDays(day, h.lag)) : d;
    if (!target) return;
    const o = h.outcome(target);
    if (o == null) return;
    out.push({ day, exp: e, out: o });
  });
  return out;
}

export function testHypothesis(h: Hypothesis, days: DaySummary[]): Result {
  const byDay = new Map(days.map((d) => [d.day, d]));
  const P = pairs(h, byDay);
  const W = P.filter((p) => p.exp).map((p) => p.out);
  const O = P.filter((p) => !p.exp).map((p) => p.out);
  const nW = W.length;
  const nO = O.length;
  const base = { hypothesis: h, nWith: nW, nWithout: nO };
  const missing = Math.max(0, PARAMS.minFraco - nW) + Math.max(0, PARAMS.minFraco - nO);
  if (nW === 0 && nO === 0) return { ...base, meanWith: null, meanWithout: null, diff: null, effect: null, confidence: 'sem_dado', missing };
  if (nW < PARAMS.minPouco || nO < PARAMS.minPouco || Math.min(nW, nO) < PARAMS.minFraco) {
    const mW = nW ? mean(W) : null;
    const mO = nO ? mean(O) : null;
    return { ...base, meanWith: mW, meanWithout: mO, diff: mW != null && mO != null ? mW - mO : null, effect: null, confidence: 'pouco_dado', missing };
  }
  const mW = mean(W);
  const mO = mean(O);
  const pooled = Math.sqrt(((nW - 1) * sd(W) ** 2 + (nO - 1) * sd(O) ** 2) / (nW + nO - 2));
  const diff = mW - mO;
  // sem variação nenhuma: diferença conta como efeito máximo se existir
  const effect = pooled > 0 ? diff / pooled : diff === 0 ? 0 : Math.sign(diff) * 2;
  const rightWay = h.expect === 'up' ? effect >= PARAMS.minEffect : effect <= -PARAMS.minEffect;
  let confidence: Confidence = rightWay ? 'sinal_fraco' : 'sem_sinal';
  let confounder: string | undefined;
  if (rightWay) {
    confounder = findConfounder(h, P, byDay);
    if (!confounder && Math.min(nW, nO) >= PARAMS.minConsistente) confidence = 'sinal_consistente';
  }
  return { ...base, meanWith: mW, meanWithout: mO, diff, effect, confidence, confounder, missing: 0 };
}

// Outra exposição que aparece muito mais nos dias "com" do que nos dias "sem" pode explicar
// a diferença. Nesse caso o achado não sobe para "consistente" e o texto avisa.
function findConfounder(h: Hypothesis, P: Pair[], byDay: Map<string, DaySummary>): string | undefined {
  for (const other of HYPOTHESES) {
    if (other.id === h.id || other.exposureLabel === h.exposureLabel) continue;
    const rate = (exp: boolean) => {
      const vals = P.filter((p) => p.exp === exp)
        .map((p) => other.exposure(byDay.get(p.day)!))
        .filter((v): v is boolean => v != null);
      return vals.length ? vals.filter(Boolean).length / vals.length : null;
    };
    const a = rate(true);
    const b = rate(false);
    if (a != null && b != null && a - b >= PARAMS.confounderGap) return other.exposureLabel;
  }
  return undefined;
}

const rank: Record<Confidence, number> = { sinal_consistente: 4, sinal_fraco: 3, sem_sinal: 1, pouco_dado: 2, sem_dado: 0 };

export function analyze(days: DaySummary[], ids: string[]) {
  return ids
    .map((id) => HYPOTHESES.find((h) => h.id === id))
    .filter((h): h is Hypothesis => !!h)
    .map((h) => testHypothesis(h, days))
    .sort((a, b) => rank[b.confidence] - rank[a.confidence] || Math.abs(b.effect ?? 0) - Math.abs(a.effect ?? 0));
}

export const CONF_LABEL: Record<Confidence, string> = {
  sem_dado: 'Sem dados ainda',
  pouco_dado: 'Pouco dado',
  sem_sinal: 'Sem sinal até agora',
  sinal_fraco: 'Sinal fraco',
  sinal_consistente: 'Sinal consistente',
};
