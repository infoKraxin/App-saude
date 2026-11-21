import React, { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Circle, Path } from 'react-native-svg';
import { Screen, T, Card, Button, tap } from '@/components/ui';
import { useApp, useLiveLogs } from '@/data/store';
import { addDays, dayKey, fmtShort, parseDay } from '@/data/dates';
import { useToday } from '@/lib/useDay';
import { useTheme } from '@/theme/useTheme';
import { HeroScreen } from '@/components/premium';
import { space } from '@/theme/tokens';

export default function Progresso() {
  const { c } = useTheme();
  const router = useRouter();
  const logs = useLiveLogs();
  const prefs = useApp((s) => s.prefs);
  const { report } = useToday();
  const today = dayKey();
  const hideNumbers = prefs.hideWeight || !!report?.safety.hideNumbers;

  const weights = useMemo(
    () => logs.filter((l) => l.kind === 'measure' && l.weightKg != null).sort((a, b) => a.at.localeCompare(b.at)).map((l) => ({ day: l.day, kg: (l as { weightKg: number }).weightKg })),
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
  const streakDays = [...perDay.keys()].filter((d) => d >= addDays(today, -6)).length;

  const trend = weights.length >= 2 ? weights[weights.length - 1].kg - weights[0].kg : null;
  const trendWord = trend == null ? null : Math.abs(trend) < 0.3 ? 'estável' : trend < 0 ? 'em queda' : 'em alta';

  return (
    <HeroScreen img="cena-dezembro" tall title="Seu progresso" subtitle="Pequenos registros, somados, viram descobertas.">

      <Card>
        <T v="label" tone="mut">Últimos 7 dias</T>
        <T v="h2">{streakDays} de 7 dias com registro</T>
        <T v="small" tone="mut">Dia sem registro não zera nada. Volte quando puder.</T>
      </Card>

      <Card>
        <T v="label" tone="mut">Peso</T>
        {weights.length === 0 ? (
          <>
            <T>Nenhuma medida ainda. Uma por semana basta para ver a tendência.</T>
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
            {trendWord && <T v="small" tone="mut">Tendência {trendWord} desde {fmtShort(weights[0].day)} ({trend! > 0 ? '+' : ''}{trend!.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg).</T>}
            <WeightLine points={weights.map((w) => w.kg)} color={c.brand} grid={c.line} />
            <T v="micro" tone="mut">Gráfico das {weights.length} medidas registradas. O peso varia de um dia para outro; olhe a tendência.</T>
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
            return (
              <View key={d} style={{ width: `${100 / 7}%`, padding: 3 }}>
                <Pressable disabled={future} accessibilityRole="button" accessibilityLabel={`${fmtShort(d)}: ${n ? `${n} registros` : 'sem registro'}`}
                  onPress={() => { tap(); router.push(`/dia/${d}`); }}
                  style={{ aspectRatio: 1, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: n ? c.amber : c.sunk, opacity: future ? 0.35 : n ? Math.min(1, 0.45 + n * 0.08) : 1, borderWidth: d === today ? 2 : 0, borderColor: c.ink }}>
                  <T v="micro" weight="semi" style={{ color: n ? '#0E1517' : c.mut }}>{parseDay(d).getDate()}</T>
                </Pressable>
              </View>
            );
          })}
        </View>
        <T v="micro" tone="mut">Dias em âmbar têm registro; quanto mais forte, mais registros. Toque em um dia para ver e editar.</T>
      </Card>
    </HeroScreen>
  );
}

function WeightLine({ points, color, grid }: { points: number[]; color: string; grid: string }) {
  const W = 300, H = 110, pad = 10;
  const min = Math.min(...points) - 0.5, max = Math.max(...points) + 0.5;
  const x = (i: number) => pad + (points.length === 1 ? (W - 2 * pad) / 2 : (i / (points.length - 1)) * (W - 2 * pad));
  const y = (v: number) => pad + (1 - (v - min) / (max - min)) * (H - 2 * pad);
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${x(i)} ${y(p)}`).join(' ');
  return (
    <Svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Path d={`M${pad} ${H - pad}H${W - pad}`} stroke={grid} strokeWidth={1} />
      <Path d={d} stroke={color} strokeWidth={2.5} fill="none" strokeLinejoin="round" />
      {points.map((p, i) => <Circle key={i} cx={x(i)} cy={y(p)} r={3.5} fill={color} />)}
    </Svg>
  );
}
