import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { T, Button } from '@/components/ui';
import { Evu } from '@/components/art';
import { useTheme } from '@/theme/useTheme';
import { space } from '@/theme/tokens';

export default function Welcome() {
  const { c } = useTheme();
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.brand }}>
      <View style={{ flex: 1, padding: space(6), justifyContent: 'space-between', maxWidth: 560, width: '100%', alignSelf: 'center' }}>
        <View style={{ marginTop: space(10), gap: space(5) }}>
          <Evu mood="hi" size={112} />
          <T v="hero" accessibilityRole="header" style={{ color: c.onBrand }}>
            O sistema de saúde que se adapta a você.
          </T>
          <T v="h3" weight="med" style={{ color: c.onBrand, opacity: 0.86 }}>
            Um minuto por dia de registro. Em 7 dias, o que pesa no seu caso e por quê.
          </T>
        </View>
        <View style={{ gap: space(3) }}>
          <Button label="Começar" kind="secondary" onPress={() => router.push('/entrar')} />
          <Button label="Já fiz o quiz, quero meu plano" kind="onBrand" onPress={() => router.push('/entrar')} hint="Entre com o mesmo e-mail que você usou no quiz" />
          <T v="micro" center style={{ color: c.onBrand, opacity: 0.8 }}>
            Para maiores de 18 anos. O Evura informa; não substitui médicos e nutricionistas.
          </T>
        </View>
      </View>
    </SafeAreaView>
  );
}
