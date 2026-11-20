import React from 'react';
import { View } from 'react-native';
import { Screen, T, Field, Chip, Group, ToggleRow } from '@/components/ui';
import { setProfile, useApp } from '@/data/store';
import { AREAS, areaById, type AreaId } from '@/data/areas';
import { space } from '@/theme/tokens';

export default function MeuPerfil() {
  const p = useApp((s) => s.profile);
  if (!p) return null;
  const numOrUndef = (t: string) => {
    const n = Number(t.replace(',', '.'));
    return t && !Number.isNaN(n) ? n : undefined;
  };
  return (
    <Screen back title="Meu perfil">
      <Field label="Nome ou apelido" value={p.name} onChangeText={(t) => setProfile({ name: t.slice(0, 40) })} />
      <View style={{ gap: space(2) }}>
        <T v="label">Foco principal</T>
        <T v="small" tone="mut">Trocar o foco troca as hipóteses que o app testa.</T>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space(2) }}>
          {AREAS.map((a) => (
            <Chip key={a.id} label={a.name} selected={p.area === a.id} onPress={() => setProfile({ area: a.id as AreaId, hypotheses: areaById(a.id).defaultHypotheses, extraAreas: p.extraAreas.filter((x) => x !== a.id) })} />
          ))}
        </View>
      </View>
      <Field label="O que te move" value={p.motive} onChangeText={(t) => setProfile({ motive: t.slice(0, 80) })} />
      <View style={{ flexDirection: 'row', gap: space(3) }}>
        <View style={{ flex: 1 }}><Field label="Altura (cm)" value={p.heightCm ? String(p.heightCm) : ''} onChangeText={(t) => setProfile({ heightCm: numOrUndef(t) })} keyboardType="decimal-pad" /></View>
        <View style={{ flex: 1 }}><Field label="Ano de nascimento" value={p.birthYear ? String(p.birthYear) : ''} onChangeText={(t) => setProfile({ birthYear: numOrUndef(t) })} keyboardType="number-pad" /></View>
      </View>
      <Group title="Segurança" note="Mudar estas respostas muda o que o app mostra: com qualquer uma ligada, metas e projeções de peso somem.">
        <ToggleRow label="Estou grávida" value={p.safety.pregnant} onChange={(v) => setProfile({ safety: { ...p.safety, pregnant: v } })} />
        <ToggleRow label="Estou amamentando" value={p.safety.breastfeeding} onChange={(v) => setProfile({ safety: { ...p.safety, breastfeeding: v } })} />
        <ToggleRow label="Tenho ou já tive transtorno alimentar" value={p.safety.eatingDisorder} onChange={(v) => setProfile({ safety: { ...p.safety, eatingDisorder: v } })} />
      </Group>
      <Group title="Registros extras">
        <ToggleRow label="Uso caneta para controle de peso" desc="Mostra o registro de aplicação." value={p.usesPen} onChange={(v) => setProfile({ usesPen: v })} />
        <ToggleRow label="Acompanhar meu ciclo" value={p.cycleTracking} onChange={(v) => setProfile({ cycleTracking: v })} />
      </Group>
    </Screen>
  );
}
