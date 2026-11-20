import React from 'react';
import { Screen, T, Group, ToggleRow, Segmented, Field } from '@/components/ui';
import { setPrefs, useApp } from '@/data/store';
import { addDays, dayKey } from '@/data/dates';
import { HeroScreen } from '@/components/premium';

const hhmm = (t: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t);

export default function Notificacoes() {
  const n = useApp((s) => s.prefs.notif);
  const paused = !!n.pausedUntil && n.pausedUntil >= dayKey();
  return (
    <HeroScreen img="tela-notificacoes" back title="Notificações" subtitle="Poucos avisos, no horário que você escolher, e nunca para cobrar. Nada de dados de saúde na tela bloqueada.">
      <Group title="Avisos">
        <ToggleRow label="Lembrete de registro" desc="Um por dia." value={n.logs} onChange={(v) => setPrefs({ notif: { logs: v } })} />
        <ToggleRow label="Água" value={n.water} onChange={(v) => setPrefs({ notif: { water: v } })} />
        <ToggleRow label="Relatório pronto" value={n.report} onChange={(v) => setPrefs({ notif: { report: v } })} />
        <ToggleRow label="Aplicação da caneta" value={n.med} onChange={(v) => setPrefs({ notif: { med: v } })} />
        <ToggleRow label="Comunidade" value={n.community} onChange={(v) => setPrefs({ notif: { community: v } })} />
        <ToggleRow label="Novidades do Evura" value={n.marketing} onChange={(v) => setPrefs({ notif: { marketing: v } })} />
      </Group>
      <Field label="Horário do lembrete (HH:MM)" defaultValue={n.reminderTime} onEndEditing={(e) => hhmm(e.nativeEvent.text) && setPrefs({ notif: { reminderTime: e.nativeEvent.text } })} keyboardType="numbers-and-punctuation" />
      <Segmented label="Máximo de avisos por dia" value={n.maxPerDay} onChange={(v) => setPrefs({ notif: { maxPerDay: v } })} options={[{ v: 1, label: '1' }, { v: 3, label: '3' }, { v: 5, label: '5' }]} />
      <Segmented<string> label={paused ? `Pausado até ${n.pausedUntil}` : 'Pausar tudo'} value={paused ? 'p' : 'n'} onChange={(v) => setPrefs({ notif: { pausedUntil: v === 'n' ? undefined : v === '1' ? addDays(dayKey(), 1) : v === '7' ? addDays(dayKey(), 7) : '9999-12-31' } })}
        options={[{ v: 'n', label: 'Ativo' }, { v: '1', label: '1 dia' }, { v: '7', label: '1 semana' }, { v: 'x', label: 'Até eu voltar' }]} />
      <T v="small" tone="mut">Sem avisos entre {n.quietFrom} e {n.quietTo}.</T>
    </HeroScreen>
  );
}
