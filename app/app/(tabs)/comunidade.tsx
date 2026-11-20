import React from 'react';
import { View } from 'react-native';
import { ShieldCheck, Users } from 'lucide-react-native';
import { Screen, T, Card, Group, Row, ToggleRow } from '@/components/ui';
import { Evu } from '@/components/art';
import { setPrefs, useApp } from '@/data/store';
import { areaById } from '@/data/areas';
import { useTheme } from '@/theme/useTheme';
import { space } from '@/theme/tokens';

const RULES = [
  'Respeito sempre. Sem ataques, sem julgar o corpo de ninguém.',
  'Sem números de peso, sem fotos de corpo e sem antes e depois.',
  'Sem venda, propaganda ou indicação de onde comprar remédio.',
  'Dose e troca de remédio, só com quem prescreveu.',
  'Sem dicas de dieta extrema ou de passar fome.',
];

export default function Comunidade() {
  const { c } = useTheme();
  const area = useApp((s) => areaById(s.profile?.area));
  const notify = useApp((s) => s.prefs.notif.community);
  return (
    <Screen>
      <T v="h1" accessibilityRole="header">Comunidade</T>
      <Card>
        <View style={{ flexDirection: 'row', gap: space(3), alignItems: 'center' }}>
          <Evu mood="calm" size={56} />
          <View style={{ flex: 1, gap: space(1) }}>
            <T weight="semi">Grupos pequenos, por foco, com moderação.</T>
            <T v="small" tone="mut">A comunidade abre primeiro para convidados do beta. Ela existe para você não desistir, não para comparar.</T>
          </View>
        </View>
      </Card>

      <Group title="Seus grupos">
        <Row label="Boas-vindas" desc="Para quem está começando" value="Em breve" icon={<Users color={c.ink} size={20} />} />
        <Row label={area.name} desc={area.short} value="Em breve" icon={<Users color={c.ink} size={20} />} />
      </Group>

      <Group>
        <ToggleRow label="Avisar quando abrir" desc="Uma notificação quando o seu grupo estiver disponível." value={notify} onChange={(v) => setPrefs({ notif: { community: v } })} />
      </Group>

      <Card tone="sunk">
        <View style={{ flexDirection: 'row', gap: space(2), alignItems: 'center' }}>
          <ShieldCheck color={c.ink} size={20} />
          <T weight="semi">Regras da comunidade</T>
        </View>
        {RULES.map((r, i) => <T key={i} v="small">{`${i + 1}. ${r}`}</T>)}
        <T v="small" tone="mut">Todo post e comentário pode ser denunciado em dois toques, e qualquer pessoa pode ser bloqueada ou silenciada. Denúncias são revistas em até 24 horas.</T>
      </Card>
    </Screen>
  );
}

