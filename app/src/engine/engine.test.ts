import { describe, expect, it, vi } from 'vitest';

vi.mock('@react-native-async-storage/async-storage', () => ({ default: {} }));

import type { Log, Profile } from '../data/types';
import { addDays } from '../data/dates';
import { summarize } from './summary';
import { testHypothesis, analyze } from './analyze';
import { hypothesisById } from './hypotheses';
import { safety } from './safety';
import { buildDays, buildReport, aiPackage } from './report';

const START = '2026-10-01';
let n = 0;
const base = (day: string) => ({ id: `t${n++}`, day, at: `${day}T12:00:00Z`, updatedAt: `${day}T12:00:00Z`, source: 'manual' as const });
// sono simples: deita às 23 e acorda 23+h
const sleepH = (day: string, h: number, q: 1 | 2 | 3 | 4 | 5 = 3): Log => ({
  ...base(day), kind: 'sleep', bed: '23:00', wake: `${String((23 + h) % 24).padStart(2, '0')}:00`, quality: q,
});
const feel = (day: string, hunger: 1 | 2 | 3, energy: 1 | 2 | 3 = 2, stress: 1 | 2 | 3 = 1): Log => ({ ...base(day), kind: 'feel', energy, hunger, mood: 2, stress });

const profile = (p: Partial<Profile> = {}): Profile => ({
  name: 'Teste', area: 'emag', extraAreas: [], motive: 'x', safety: { pregnant: false, breastfeeding: false, eatingDisorder: false },
  hypotheses: ['sono_curto_fome', 'proteina_baixa_fome', 'estresse_fome'], trialStart: START, onboarded: true, consents: {}, cycleTracking: false, usesPen: false, ...p,
});

describe('resumo do dia', () => {
  it('calcula horas de sono atravessando a meia-noite', () => {
    const s = summarize(START, [sleepH(START, 7)]);
    expect(s.sleepH).toBe(7);
    expect(s.logged).toBe(true);
  });
  it('ignora registros apagados', () => {
    const l = { ...feel(START, 3), deleted: true };
    expect(summarize(START, [l]).logged).toBe(false);
  });
});

describe('motor', () => {
  it('acha sinal consistente quando dormir pouco anda com mais fome', () => {
    const logs: Log[] = [];
    for (let i = 0; i < 24; i++) {
      const d = addDays(START, i);
      const short = i % 2 === 0;
      logs.push(sleepH(d, short ? 5 : 8));
      logs.push(feel(d, short ? (i % 4 === 0 ? 3 : 2) : 1));
    }
    const r = testHypothesis(hypothesisById('sono_curto_fome')!, buildDays(logs, START, addDays(START, 23)));
    expect(r.nWith).toBe(12);
    expect(r.confidence).toBe('sinal_consistente');
    expect(r.diff!).toBeGreaterThan(0);
  });

  it('não acha sinal quando não há relação', () => {
    const logs: Log[] = [];
    for (let i = 0; i < 20; i++) {
      const d = addDays(START, i);
      logs.push(sleepH(d, i % 2 ? 5 : 8));
      logs.push(feel(d, ([1, 2, 2, 1] as const)[Math.floor(i / 2) % 4]));
    }
    const r = testHypothesis(hypothesisById('sono_curto_fome')!, buildDays(logs, START, addDays(START, 19)));
    expect(['sem_sinal']).toContain(r.confidence);
  });

  it('diz pouco dado com menos de 5 dias de cada lado', () => {
    const logs = [sleepH(START, 5), feel(START, 3), sleepH(addDays(START, 1), 8), feel(addDays(START, 1), 1)];
    const r = testHypothesis(hypothesisById('sono_curto_fome')!, buildDays(logs, START, addDays(START, 1)));
    expect(r.confidence).toBe('pouco_dado');
    expect(r.missing).toBe(8);
  });

  it('rebaixa quando outra exposição anda junto (confusão)', () => {
    const logs: Log[] = [];
    for (let i = 0; i < 24; i++) {
      const d = addDays(START, i);
      const bad = i % 2 === 0;
      logs.push(sleepH(d, bad ? 5 : 8));
      logs.push(feel(d, bad ? 3 : 1, 2, bad ? 3 : 1)); // estresse alto nos mesmos dias
    }
    const r = testHypothesis(hypothesisById('sono_curto_fome')!, buildDays(logs, START, addDays(START, 23)));
    expect(r.confidence).toBe('sinal_fraco');
    expect(r.confounder).toBeTruthy();
  });

  it('respeita o atraso de 1 dia (cafeína hoje, sono amanhã)', () => {
    const logs: Log[] = [];
    for (let i = 0; i < 24; i++) {
      const d = addDays(START, i);
      const caf = i % 2 === 0;
      logs.push({ ...base(d), kind: 'evening', caffeineLate: caf, screenLate: false });
      // o sono registrado no dia seguinte reflete a cafeína de hoje
      logs.push(sleepH(addDays(d, 1), 7, caf ? 2 : 4));
    }
    const r = testHypothesis(hypothesisById('cafeina_tarde_sono')!, buildDays(logs, START, addDays(START, 24)));
    expect(r.confidence).toBe('sinal_consistente');
    expect(r.diff!).toBeLessThan(0);
  });

  it('é determinístico', () => {
    const logs = [sleepH(START, 5), feel(START, 3)];
    const days = buildDays(logs, START, START);
    expect(JSON.stringify(analyze(days, ['sono_curto_fome']))).toBe(JSON.stringify(analyze(days, ['sono_curto_fome'])));
  });
});

describe('segurança', () => {
  it('esconde números para gestação, amamentação e transtorno alimentar', () => {
    for (const k of ['pregnant', 'breastfeeding', 'eatingDisorder'] as const) {
      const s = safety(profile({ safety: { pregnant: false, breastfeeding: false, eatingDisorder: false, [k]: true } }), []);
      expect(s.hideNumbers).toBe(true);
      expect(s.mode).toBe('cuidado');
    }
  });
  it('esconde números para menor de 18', () => {
    expect(safety(profile({ birthYear: new Date().getFullYear() - 16 }), []).hideNumbers).toBe(true);
  });
  it('detecta perda de peso rápida', () => {
    const logs: Log[] = [
      { ...base(START), kind: 'measure', weightKg: 90 },
      { ...base(addDays(START, 14)), kind: 'measure', weightKg: 85 },
    ];
    expect(safety(profile(), buildDays(logs, START, addDays(START, 14))).reasons).toContain('perda de peso rápida');
  });
  it('sintoma de alerta forte vira urgente', () => {
    const logs: Log[] = [{ ...base(START), kind: 'symptom', items: [{ id: 'vomito', level: 3 }] }];
    const s = safety(profile({ area: 'cane' }), buildDays(logs, START, START));
    expect(s.urgent).toBe(true);
  });
});

describe('relatório', () => {
  it('relatório do dia 7 sai cheio mesmo sem nenhum registro', () => {
    const r = buildReport(profile(), [], addDays(START, 6));
    expect(r.dayNumber).toBe(7);
    expect(r.findings.length).toBe(3);
    expect(r.quizHypotheses.length).toBe(3);
    expect(r.nextWeek.length).toBeGreaterThan(0);
    r.findings.forEach((f) => expect(f.body.length).toBeGreaterThan(10));
    expect(JSON.stringify(r)).not.toMatch(/undefined|NaN/);
  });
  it('urgente troca a ação por orientação de atendimento', () => {
    const logs: Log[] = [{ ...base(START), kind: 'symptom', items: [{ id: 'vomito', level: 3 }] }];
    const r = buildReport(profile({ area: 'cane' }), logs, START);
    expect(r.action).toMatch(/192/);
  });
  it('o pacote da IA não leva nome nem e-mail', () => {
    const r = buildReport(profile({ name: 'Maria Silva', email: 'maria@x.com' }), [], START);
    const pkg = JSON.stringify(aiPackage(r));
    expect(pkg).not.toMatch(/Maria|maria@/);
  });
  it('nenhum texto usa palavras proibidas', () => {
    const logs: Log[] = [];
    for (let i = 0; i < 24; i++) {
      const d = addDays(START, i);
      logs.push(sleepH(d, i % 2 ? 8 : 5));
      logs.push(feel(d, i % 2 ? 1 : 3));
    }
    const r = buildReport(profile(), logs, addDays(START, 23));
    expect(r.findings[0].body.startsWith('Em ')).toBe(true);
    expect(JSON.stringify(r)).not.toMatch(/Nos noites|Nas dias/);
    const all = JSON.stringify(r).toLowerCase();
    for (const w of ['diagnóstico', 'causa ', 'cura', 'garantido', 'prova']) expect(all).not.toContain(w);
  });
});

