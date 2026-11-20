// Monta o pacote fechado (o que a IA recebe) e o texto-modelo "versão simples",
// que é o que aparece quando a IA não está ligada, não tem consentimento ou foi barrada.

import type { Log, Profile } from '../data/types';
import { addDays, diffDays, dayKey } from '../data/dates';
import { summarize, type DaySummary } from './summary';
import { analyze, CONF_LABEL, type Result } from './analyze';
import { safety, type SafetyState } from './safety';
import { HYPOTHESES } from './hypotheses';

export const ENGINE_VERSION = 'motor-0.1.0';

export type Finding = {
  id: string; // hipótese
  title: string;
  confidence: Result['confidence'];
  confidenceLabel: string;
  body: string;
  evidence: string[];
  tip?: string;
};

export type Report = {
  day: string;
  dayNumber: number; // dia do teste (1 = primeiro dia)
  daysLogged: number;
  safety: SafetyState;
  findings: Finding[];
  quizHypotheses: { id: string; title: string; status: string }[];
  action: string;
  missing: string[];
  nextWeek: string[];
  engine: string;
};

const fmt = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 1 });

function lvlWord(unit: string, v: number, masc = false) {
  if (unit === 'nota') return `com nota ${fmt(v)} de 5`;
  const w = v >= 2.5 ? 'alt' : v >= 1.5 ? 'médi' : 'baix';
  return w + (masc ? 'o' : 'a');
}

const dias = (n: number, label: string) => `${n} ${n === 1 ? label.replace(/^dias/, 'dia').replace(/^noites/, 'noite') : label}`;

const art = (h: { outcomeLabel: string; outcomeMasc?: boolean }) => `${h.outcomeMasc ? 'o' : 'a'} ${h.outcomeLabel}`;

export function findingText(r: Result): string {
  const h = r.hypothesis;
  const evid = h.evidence.length ? '' : ' Ainda não há estudo revisado no app sobre isso; é um padrão observado só nos seus dados.';
  switch (r.confidence) {
    case 'sem_dado':
      return `Para testar, registre ${h.needs}.`;
    case 'pouco_dado':
      return `Até agora: ${dias(r.nWith, h.exposureLabel)} e ${dias(r.nWithout, h.controlLabel)}. Faltam cerca de ${r.missing} dias com registro para um primeiro sinal.`;
    case 'sem_sinal':
      return `Em ${dias(r.nWith, h.exposureLabel)}, ${art(h)} ficou ${lvlWord(h.outcomeUnit, r.meanWith!, h.outcomeMasc)}; em ${dias(r.nWithout, h.controlLabel)}, ${lvlWord(h.outcomeUnit, r.meanWithout!, h.outcomeMasc)}. Por enquanto, isso não parece pesar no seu caso.`;
    default: {
      const conf = r.confounder ? ` Atenção: nesses mesmos dias também houve mais ${r.confounder}, então pode ser isso.` : '';
      return `Em ${dias(r.nWith, h.exposureLabel)}, ${art(h)} ficou ${lvlWord(h.outcomeUnit, r.meanWith!, h.outcomeMasc)}${h.lag ? ' na noite seguinte' : ''}; em ${dias(r.nWithout, h.controlLabel)}, ${lvlWord(h.outcomeUnit, r.meanWithout!, h.outcomeMasc)}.${conf}${evid}`;
    }
  }
}

export function buildDays(logs: Log[], from: string, to: string): DaySummary[] {
  const out: DaySummary[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(summarize(d, logs));
  return out;
}

export function buildReport(profile: Profile, logs: Log[], today = dayKey()): Report {
  const start = profile.trialStart ?? today;
  const first = logs.length ? logs.map((l) => l.day).sort()[0] : today;
  const from = first < start ? first : start;
  const days = buildDays(logs, from, today);
  const logged = days.filter((d) => d.logged);
  const sf = safety(profile, days);
  const ids = Array.from(new Set([...profile.hypotheses, ...HYPOTHESES.map((h) => h.id)]));
  const results = analyze(days, ids);
  const quiz = results.filter((r) => profile.hypotheses.includes(r.hypothesis.id));
  const signals = results.filter((r) => r.confidence === 'sinal_fraco' || r.confidence === 'sinal_consistente');
  const top = [...signals, ...quiz.filter((q) => !signals.includes(q))].slice(0, 3);

  const findings: Finding[] = top.map((r) => ({
    id: r.hypothesis.id,
    title: r.hypothesis.title,
    confidence: r.confidence,
    confidenceLabel: CONF_LABEL[r.confidence],
    body: findingText(r),
    evidence: r.hypothesis.evidence,
    tip: r.confidence === 'sinal_fraco' || r.confidence === 'sinal_consistente' ? r.hypothesis.tip : undefined,
  }));

  const missing = Array.from(new Set(quiz.filter((q) => q.confidence === 'sem_dado' || q.confidence === 'pouco_dado').map((q) => q.hypothesis.needs)));
  const best = signals[0] ?? quiz[0];
  const action = sf.urgent
    ? 'Você marcou um sintoma forte. Procure atendimento médico ou fale com quem acompanha você. Em emergência, ligue 192.'
    : best?.hypothesis.tip ?? 'Registre o seu dia de amanhã completo: é o que mais acelera as descobertas.';

  return {
    day: today,
    dayNumber: diffDays(start, today) + 1,
    daysLogged: logged.length,
    safety: sf,
    findings,
    quizHypotheses: quiz.map((q) => ({ id: q.hypothesis.id, title: q.hypothesis.title, status: CONF_LABEL[q.confidence] })),
    action,
    missing,
    nextWeek: nextWeekPlan(quiz, missing),
    engine: ENGINE_VERSION,
  };
}

function nextWeekPlan(quiz: Result[], missing: string[]) {
  const plan: string[] = [];
  if (missing.length) plan.push(`Registrar ${missing.join(', ')} todos os dias, mesmo que rápido.`);
  quiz
    .filter((q) => q.confidence !== 'sem_sinal')
    .slice(0, 2)
    .forEach((q) => plan.push(`Testar: ${q.hypothesis.tip}`));
  plan.push('Abrir o relatório de cada dia: ele muda conforme você registra.');
  return plan;
}

// Pacote para a IA (seção 9 do plano): sem nome, sem e-mail, só o que o texto pode usar.
export function aiPackage(r: Report) {
  return {
    engine: r.engine,
    dia_do_teste: r.dayNumber,
    dias_registrados: r.daysLogged,
    modo: r.safety.mode,
    esconder_numeros: r.safety.hideNumbers,
    achados: r.findings.map((f) => ({ id: f.id, pergunta: f.title, confianca: f.confidence, texto_base: f.body, fichas: f.evidence })),
    acao: r.action,
    falta_medir: r.missing,
  };
}
