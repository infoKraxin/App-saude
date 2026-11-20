import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Accessibility, Bell, CircleHelp, CreditCard, Info, Link2, Lock, User } from 'lucide-react-native';
import { Screen, T, Group, Row } from '@/components/ui';
import { useApp } from '@/data/store';
import { areaById } from '@/data/areas';
import { diffDays, dayKey } from '@/data/dates';
import { useTheme } from '@/theme/useTheme';
import { Illus } from '@/components/premium';
import { ILLUS, AREA_ILLUS } from '@/components/illus';
import { space } from '@/theme/tokens';

export default function Perfil() {
  const { c } = useTheme();
  const router = useRouter();
  const p = useApp((s) => s.profile);
  const trialLeft = p?.trialStart ? 7 - diffDays(p.trialStart, dayKey()) : null;
  const ic = (I: typeof User) => <I color={c.ink} size={20} />;
  return (
    <Screen back title="Perfil">
      <View style={{ borderRadius: 24, overflow: 'hidden', backgroundColor: ILLUS[AREA_ILLUS[p?.area ?? 'emag']].bg }}>
        <Illus name={AREA_ILLUS[p?.area ?? 'emag']} width="80%" style={{ alignSelf: 'center' }} />
        <View style={{ backgroundColor: c.card, padding: space(5), gap: space(1) }}>
          <T v="h1">{p?.name || 'Você'}</T>
          <T tone="mut">{areaById(p?.area).name}{p?.email ? `, ${p.email}` : ''}</T>
        </View>
      </View>
      <Group>
        <Row icon={ic(User)} label="Meu perfil" desc="Nome, foco, motivo, evento, corpo e rotina" onPress={() => router.push('/perfil/meu-perfil')} />
        <Row icon={ic(CreditCard)} label="Plano e assinatura" value={trialLeft != null && trialLeft > 0 ? `Teste: ${trialLeft} ${trialLeft === 1 ? 'dia' : 'dias'}` : undefined} onPress={() => router.push('/perfil/assinatura')} />
      </Group>
      <Group title="Preferências">
        <Row icon={ic(Bell)} label="Notificações" onPress={() => router.push('/perfil/notificacoes')} />
        <Row icon={ic(Accessibility)} label="Acessibilidade e aparência" desc="Texto, tema, movimento, números sensíveis" onPress={() => router.push('/perfil/acessibilidade')} />
        <Row icon={ic(Link2)} label="Conexões" desc="Health Connect" onPress={() => router.push('/perfil/conexoes')} />
      </Group>
      <Group title="Dados">
        <Row icon={ic(Lock)} label="Privacidade e dados" desc="Consentimentos, exportar, excluir conta" onPress={() => router.push('/perfil/privacidade')} />
      </Group>
      <Group title="Suporte">
        <Row icon={ic(CircleHelp)} label="Ajuda e contato" onPress={() => router.push('/perfil/ajuda')} />
        <Row icon={ic(Info)} label="Sobre o Evura" onPress={() => router.push('/perfil/sobre')} />
      </Group>
    </Screen>
  );
}
