import React, { useEffect, useState } from 'react';
import { AppState as RNAppState, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, BricolageGrotesque_600SemiBold, BricolageGrotesque_700Bold } from '@expo-google-fonts/bricolage-grotesque';
import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';
import { HankenGrotesk_400Regular, HankenGrotesk_500Medium, HankenGrotesk_600SemiBold } from '@expo-google-fonts/hanken-grotesk';
import { loadState, useApp } from '@/data/store';
import { useTheme } from '@/theme/useTheme';
import { syncNow } from '@/lib/sync';
import { ToastHost } from '@/components/premium';

SplashScreen.preventAutoHideAsync().catch(() => {});
if (typeof document !== 'undefined') document.documentElement.lang = 'pt-BR';

function Gate() {
  const onboarded = useApp((s) => !!s.profile?.onboarded);
  const segments = useSegments();
  const router = useRouter();
  useEffect(() => {
    const first = segments[0] as string | undefined;
    const inOnboarding = first === 'boas-vindas' || first === 'entrar' || first === 'plano' || first === 'legal' || first === 'quiz';
    if (!onboarded && !inOnboarding) router.replace('/boas-vindas');
    if (onboarded && (first === 'boas-vindas' || first === 'entrar' || first === 'plano')) router.replace('/');
  }, [onboarded, segments, router]);
  return null;
}

export default function Root() {
  const [ready, setReady] = useState(false);
  const [fontsOk] = useFonts({ Fraunces_600SemiBold, BricolageGrotesque_600SemiBold, BricolageGrotesque_700Bold, HankenGrotesk_400Regular, HankenGrotesk_500Medium, HankenGrotesk_600SemiBold });
  const { c, dark } = useTheme();

  useEffect(() => {
    loadState().finally(() => setReady(true));
    // sobe registros pendentes quando o app volta para a frente
    const sub = RNAppState.addEventListener('change', (st) => st === 'active' && syncNow().catch(() => {}));
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (ready && fontsOk) SplashScreen.hideAsync().catch(() => {});
  }, [ready, fontsOk]);

  if (!ready || !fontsOk) return <View style={{ flex: 1, backgroundColor: c.bg }} />;

  return (
    <SafeAreaProvider>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg }, animation: 'slide_from_right' }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="registro/index" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="registro/[tipo]" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      </Stack>
      <Gate />
      <ToastHost />
    </SafeAreaProvider>
  );
}
