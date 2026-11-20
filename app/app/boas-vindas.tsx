import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { T, Button } from '@/components/ui';
import { Evu } from '@/components/art';
import { Enter } from '@/components/motion';
import { Illus } from '@/components/premium';
import { ILLUS } from '@/components/illus';
import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export default function Welcome() {
  const { c } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: ILLUS['cena-dezembro'].bg }}>
      <View style={{ paddingTop: insets.top, alignItems: 'center' }}>
        <Illus name="cena-dezembro" style={{ maxWidth: 620 }} />
      </View>
      <View style={{ flex: 1, backgroundColor: c.bg, borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet, marginTop: -space(8), paddingHorizontal: space(6), paddingTop: space(2), paddingBottom: insets.bottom + space(5), justifyContent: 'space-between' }}>
        <View style={{ maxWidth: 560, width: '100%', alignSelf: 'center', gap: space(3) }}>
          <View style={{ marginTop: -space(12), alignSelf: 'center' }}><Evu mood="hi" size={96} /></View>
          <Enter i={1}><T v="hero" center accessibilityRole="header">O sistema de saúde que se adapta a você</T></Enter>
          <Enter i={2}><T v="h3" weight="med" tone="mut" center>Um minuto por dia de registro. Em 7 dias, o que pesa no seu caso e por quê.</T></Enter>
        </View>
        <Enter i={3} style={{ gap: space(3), maxWidth: 560, width: '100%', alignSelf: 'center', marginTop: space(5) }}>
          <Button label="Começar" onPress={() => router.push('/quiz')} hint="Abre o quiz para montar o seu plano" />
          <Button label="Já fiz o quiz ou já tenho conta" kind="ghost" onPress={() => router.push('/entrar')} hint="Entre com o mesmo e-mail que você usou no quiz" />
          <T v="micro" tone="mut" center>Para maiores de 18 anos. O Evura informa; não substitui médicos e nutricionistas.</T>
        </Enter>
      </View>
    </View>
  );
}
