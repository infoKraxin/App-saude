import React, { useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Screen, T, Group, Button, Card } from '@/components/ui';
import { removeLog, restoreLog, useLiveLogs } from '@/data/store';
import { fmtDay, fmtWeekday } from '@/data/dates';
import type { Log } from '@/data/types';
import { space } from '@/theme/tokens';
import { Illus } from '@/components/premium';

const L3 = ['', 'baixa', 'média', 'alta'];

export function describe(l: Log): { title: string; detail: string } {
  switch (l.kind) {
    case 'water': return { title: 'Água', detail: `${l.ml} ml` };
    case 'meal': return { title: { cafe: 'Café da manhã', almoco: 'Almoço', lanche: 'Lanche', jantar: 'Jantar', ceia: 'Ceia' }[l.slot], detail: l.text };
    case 'sleep': return { title: 'Sono', detail: `${l.bed} às ${l.wake}, nota ${l.quality} de 5` };
    case 'evening': return { title: 'Minha noite', detail: `${l.caffeineLate ? 'Cafeína à tarde' : 'Sem cafeína à tarde'}; ${l.screenLate ? 'tela até dormir' : 'sem tela até dormir'}` };
    case 'feel': return { title: 'Como me sinto', detail: `Energia ${L3[l.energy]}, fome ${L3[l.hunger]}, estresse ${L3[l.stress]}` };
    case 'symptom': return { title: 'Sintomas', detail: `${l.items.length} marcado${l.items.length > 1 ? 's' : ''}` };
    case 'measure': return { title: 'Medidas', detail: [l.weightKg != null ? `${l.weightKg} kg` : '', l.waistCm != null ? `cintura ${l.waistCm} cm` : ''].filter(Boolean).join(', ') };
    case 'move': return { title: 'Movimento', detail: ['Nada', 'Leve', 'Moderado', 'Intenso'][l.level] + (l.minutes ? `, ${l.minutes} min` : '') };
    case 'med': return { title: 'Aplicação', detail: `${l.name}${l.doseText ? `, ${l.doseText}` : ''}` };
    case 'cycle': return { title: 'Ciclo', detail: l.phase.replace('_', ' ') };
  }
}

export default function Dia() {
  const { day } = useLocalSearchParams<{ day: string }>();
  const logs = useLiveLogs().filter((l) => l.day === day).sort((a, b) => a.at.localeCompare(b.at));
  const [undo, setUndo] = useState<string | null>(null);
  if (!day) return null;
  return (
    <Screen back title={`${fmtWeekday(day)}, ${fmtDay(day)}`}>
      {undo && (
        <Card tone="sunk">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space(3) }}>
            <T style={{ flex: 1 }} accessibilityLiveRegion="polite">Registro apagado.</T>
            <Button small kind="secondary" label="Desfazer" onPress={() => { restoreLog(undo); setUndo(null); }} />
          </View>
        </Card>
      )}
      {logs.length === 0 ? (
        <View style={{ alignItems: 'center', gap: space(3) }}>
          <Illus name="tela-vazio" width="80%" />
          <T tone="mut" center>Nenhum registro neste dia. Tudo bem: o que conta é o conjunto.</T>
        </View>
      ) : (
        <Group>
          {logs.map((l) => {
            const d = describe(l);
            const time = new Date(l.at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            return (
              <View key={l.id} style={{ flexDirection: 'row', alignItems: 'center', padding: space(4), gap: space(3) }}>
                <View style={{ flex: 1 }}>
                  <T weight="semi">{d.title}</T>
                  <T v="small" tone="mut">{time}, {d.detail}</T>
                </View>
                <Button small kind="ghost" label="Apagar" hint={`Apaga o registro de ${d.title.toLowerCase()}`} onPress={() => { removeLog(l.id); setUndo(l.id); }} />
              </View>
            );
          })}
        </Group>
      )}
    </Screen>
  );
}
