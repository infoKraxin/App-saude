import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Activity, Droplets, HeartPulse, Moon, Ruler, Smile, Sunset, Syringe, Utensils, CalendarHeart } from 'lucide-react-native';
import { Screen, T, Card } from '@/components/ui';
import { useApp } from '@/data/store';
import { useTheme } from '@/theme/useTheme';
import { space } from '@/theme/tokens';

export default function RegistroHub() {
  const { c } = useTheme();
  const router = useRouter();
  const p = useApp((s) => s.profile);
  const items = [
    { k: 'meal', label: 'Refeição', Icon: Utensils },
    { k: 'water', label: 'Água', Icon: Droplets },
    { k: 'sleep', label: 'Sono', Icon: Moon },
    { k: 'feel', label: 'Como me sinto', Icon: Smile },
    { k: 'move', label: 'Movimento', Icon: Activity },
    { k: 'symptom', label: 'Sintomas', Icon: HeartPulse },
    { k: 'evening', label: 'Minha noite', Icon: Sunset },
    { k: 'measure', label: 'Medidas', Icon: Ruler },
    ...(p?.usesPen ? [{ k: 'med', label: 'Aplicação', Icon: Syringe }] : []),
    ...(p?.cycleTracking ? [{ k: 'cycle', label: 'Ciclo', Icon: CalendarHeart }] : []),
  ];
  return (
    <Screen back title="Registrar">
      <T tone="mut">O que você quer registrar?</T>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -space(1) }}>
        {items.map(({ k, label, Icon }) => (
          <View key={k} style={{ width: '50%', padding: space(1) }}>
            <Card onPress={() => router.replace(`/registro/${k}`)} label={`Registrar ${label.toLowerCase()}`} style={{ minHeight: 104, justifyContent: 'space-between' }}>
              <Icon color={c.brand} size={28} />
              <T weight="semi">{label}</T>
            </Card>
          </View>
        ))}
      </View>
    </Screen>
  );
}
