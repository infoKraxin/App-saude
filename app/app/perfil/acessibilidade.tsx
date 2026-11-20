import React from 'react';
import { Screen, T, Group, ToggleRow, Segmented } from '@/components/ui';
import { setPrefs, useApp } from '@/data/store';

export default function Acessibilidade() {
  const p = useApp((s) => s.prefs);
  return (
    <Screen back title="Acessibilidade e aparência">
      <Segmented label="Tema" value={p.theme} onChange={(v) => setPrefs({ theme: v })} options={[{ v: 'system', label: 'Do sistema' }, { v: 'light', label: 'Claro' }, { v: 'dark', label: 'Escuro' }]} />
      <Segmented label="Tamanho do texto" value={p.textScale} onChange={(v) => setPrefs({ textScale: v })} options={[{ v: 1, label: 'Padrão' }, { v: 1.15, label: 'Maior' }, { v: 1.3, label: 'Bem maior' }]} />
      <T v="small" tone="mut">O app também segue o tamanho de fonte do seu celular.</T>
      <Segmented label="Reduzir movimento" value={p.reduceMotion} onChange={(v) => setPrefs({ reduceMotion: v })} options={[{ v: 'system', label: 'Do sistema' }, { v: 'on', label: 'Ligado' }, { v: 'off', label: 'Desligado' }]} />
      <Group title="Conforto">
        <ToggleRow label="Linguagem mais simples nos relatórios" value={p.simpleLanguage} onChange={(v) => setPrefs({ simpleLanguage: v })} />
        <ToggleRow label="Vibração ao tocar" value={p.haptics} onChange={(v) => setPrefs({ haptics: v })} />
        <ToggleRow label="Mostrar o Evu" value={p.mascot} onChange={(v) => setPrefs({ mascot: v })} />
      </Group>
      <Group title="Números sensíveis" note="Para quem prefere não ver números do corpo. As descobertas continuam funcionando.">
        <ToggleRow label="Esconder o peso" desc="Mostra só a tendência." value={p.hideWeight} onChange={(v) => setPrefs({ hideWeight: v })} />
        <ToggleRow label="Esconder calorias" value={p.hideCalories} onChange={(v) => setPrefs({ hideCalories: v })} />
        <ToggleRow label="Desligar projeções" value={p.hideProjection} onChange={(v) => setPrefs({ hideProjection: v })} />
      </Group>
      <Segmented label="Unidades" value={p.units} onChange={(v) => setPrefs({ units: v })} options={[{ v: 'metric', label: 'kg e cm' }, { v: 'imperial', label: 'lb e pol' }]} />
    </Screen>
  );
}
