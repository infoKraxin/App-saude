import React, { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { T, Card, Button, tap } from '@/components/ui';
import { setStreakGoal, useApp, useFreezeOnDay, useLiveLogs } from '@/data/store';
import { addDays, dayKey, fmtShort, parseDay } from '@/data/dates';
import { computeStreak } from '@/data/gamification';
import { useToday } from '@/lib/useDay';
import { useTheme } from '@/theme/useTheme';
import { HeroScreen, toast } from '@/components/premium';
import { StreakCard, UncertaintyChart } from '@/components/foodvisor';
import { families, space } from '@/theme/tokens';

export default function Progresso() {
  const { c } = useTheme();
  const router = useRouter();
  const logs = useLiveLogs();
  const prefs = useApp((s) => s.prefs);
  const streakState = useApp((s) => s.streak);
  const { report } = useToday();
  const today = dayKey();
  const hideNumbers = prefs.hideWeight || !!report?.safety.hideNumbers;

  const streak = useMemo(() => computeStreak(logs, streakState, today), [logs, streakState, today]);

  const weights = useMemo(
    () =>
      logs
        .filter((l) => l.kind === 'measure' && l.weightKg != null)
        .sort((a, b) => a.at.localeCompare(b.at))
        .map((l) => ({ day: l.day, kg: (l as { weightKg: number }).weightKg })),
    [logs],
  );

  const perDay = useMemo(() => {
    const m = new Map<string, number>();
    logs.forEach((l) => m.set(l.day, (m.get(l.day) ?? 0) + 1));
    return m;
  }, [logs]);

  // 5 semanas (a atual e as 4 anteriores), começando no domingo
  const start = addDays(today, -28 - parseDay(today).getDay());
  const cells = Array.from({ length: 35 }, (_, i) => addDays(start, i));

  const trend = weights.length >= 2 ? weights[weights.length - 1].kg - weights[0].kg : null;
  const trendWord = trend == null ? null : Math.abs(trend) < 0.3 ? 'estável' : trend < 0 ? 'em queda' : 'em alta';

  return (
    <HeroScreen img="cena-dezembro" tall title="Seu progresso" subtitle="Pequenos registros, somados, viram descobertas.">
      {/* Sequência completa estilo Foodvisor: número gigante, gelos, calendário linear e seletor de meta */}
      <StreakCard
        streak={streak}
        onSelectGoal={(g) => {
          setStreakGoal(g);
          toast(`Meta de sequência atualizada para ${g} dias`);
        }}
        onUseFreeze={() => {
          useFreezeOnDay(streak.yesterdayKey);
          toast('Gelo aplicado! Sua sequência está protegida.');
        }}
      />

      <Card>
        <T v="label" tone="mut">Tendência e fases</T>
        {weights.length === 0 ? (
          <>
            <T>Nenhuma medida ainda. Uma por semana basta para ver a curva com faixa de variação.</T>
            <Button kind="secondary" label="Registrar medida" onPress={() => router.push('/registro/measure')} />
          </>
        ) : hideNumbers ? (
          <>
            <T v="h3">Tendência {trendWord ?? 'ainda sem dados suficientes'}</T>
            <T v="small" tone="mut">{report?.safety.hideNumbers ? 'Números escondidos pelo modo cuidadoso.' : 'Você escolheu esconder o número do peso.'}</T>
          </>
        ) : (
          <>
            <T v="h2">{weights[weights.length - 1].kg.toLocaleString('pt-BR')} kg</T>
            {trendWord && (
              <T v="small" tone="mut">
                Tendência {trendWord} desde {fmtShort(weights[0].day)} ({trend! > 0 ? '+' : ''}
                {trend!.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg).
              </T>
            )}
            <UncertaintyChart
              points={weights.map((w) => w.kg)}
              phases={['Preparar', 'Avançar', 'Estabilizar']}
              color={families.seaweed.base}
            />
            <T v="micro" tone="mut">
              Faixa pontilhada indica variação natural do dia a dia ({weights.length} medidas). Olhe a tendência entre fases.
            </T>
          </>
        )}
      </Card>

      <Card>
        <T v="label" tone="mut">Seus dias</T>
        <View style={{ flexDirection: 'row' }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => <T key={i} v="micro" tone="mut" center style={{ flex: 1 }}>{d}</T>)}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {cells.map((d) => {
            const n = perDay.get(d) ?? 0;
            const future = d > today;
            const frozen = streakState.usedFreezeDays.includes(d);
            return (
              <View key={d} style={{ width: `${100 / 7}%`, padding: 3 }}>
                <Pressable
                  disabled={future}
                  accessibilityRole="button"
                  accessibilityLabel={`${fmtShort(d)}: ${n ? `${n} registros` : frozen ? 'protegido com gelo' : 'sem registro'}`}
                  onPress={() => { tap(); router.push(`/dia/${d}`); }}
                  style={{
                    aspectRatio: 1,
                    borderRadius: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: n ? c.amber : frozen ? families.sky.bg : c.sunk,
                    opacity: future ? 0.35 : n ? Math.min(1, 0.45 + n * 0.08) : 1,
                    borderWidth: d === today ? 2 : frozen ? 1 : 0,
                    borderColor: d === today ? c.ink : families.sky.base,
                  }}
                >
                  <T v="micro" weight="semi" style={{ color: n ? '#233345' : c.mut }}>{parseDay(d).getDate()}</T>
                </Pressable>
              </View>
            );
          })}
        </View>
        <T v="micro" tone="mut">Dias em âmbar têm registro; dias em azul foram protegidos com gelo. Toque em um dia para editar.</T>
      </Card>
    </HeroScreen>
  );
}
