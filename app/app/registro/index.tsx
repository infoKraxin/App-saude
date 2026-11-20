import React from 'react';
import { Image, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, T, tap } from '@/components/ui';
import { Enter, Pressy } from '@/components/motion';
import { ILLUS, KIND_ICON } from '@/components/illus';
import { useApp } from '@/data/store';
import type { LogKind } from '@/data/types';
import { useTheme } from '@/theme/useTheme';
import { radius, space } from '@/theme/tokens';

export default function RegistroHub() {
  const { c } = useTheme();
  const router = useRouter();
  const p = useApp((s) => s.profile);
  const items: { k: LogKind; label: string }[] = [
    { k: 'meal', label: 'Refeição' },
    { k: 'water', label: 'Água' },
    { k: 'sleep', label: 'Sono' },
    { k: 'feel', label: 'Como me sinto' },
    { k: 'move', label: 'Movimento' },
    { k: 'symptom', label: 'Sintomas' },
    { k: 'evening', label: 'Minha noite' },
    { k: 'measure', label: 'Medidas' },
    ...(p?.usesPen ? [{ k: 'med' as LogKind, label: 'Aplicação' }] : []),
    ...(p?.cycleTracking ? [{ k: 'cycle' as LogKind, label: 'Ciclo' }] : []),
  ];
  return (
    <Screen back title="Registrar">
      <Enter><T v="h1" center>O que você quer registrar?</T></Enter>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -space(1.5) }}>
        {items.map(({ k, label }, i) => {
          const it = ILLUS[KIND_ICON[k]];
          return (
            <Enter key={k} i={i + 1} style={{ width: '50%', padding: space(1.5) }}>
              <Pressy accessibilityRole="button" accessibilityLabel={`Registrar ${label.toLowerCase()}`} onPress={() => { tap(); router.replace(`/registro/${k}`); }}
                style={{ backgroundColor: c.card, borderRadius: radius.card, borderWidth: 1, borderColor: c.line, overflow: 'hidden' }}>
                <View style={{ backgroundColor: it.bg, aspectRatio: 1.35, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <Image source={it.src} style={{ width: '88%', height: '118%' }} resizeMode="contain" />
                </View>
                <View style={{ padding: space(3) }}>
                  <T weight="semi">{label}</T>
                </View>
              </Pressy>
            </Enter>
          );
        })}
      </View>
    </Screen>
  );
}
