import React, { useEffect } from 'react';
import Animated, { useAnimatedProps, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';
import { EASE } from './motion';
import { View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop, Text as SvgText } from 'react-native-svg';
import { useReduceMotion, useTheme } from '../theme/useTheme';
import { useApp } from '../data/store';
import { T } from './ui';

// Evu: o mesmo mascote do quiz (SVG original), em 4 humores.
export function Evu({ mood = 'hi', size = 96 }: { mood?: 'hi' | 'calm' | 'think' | 'cheer'; size?: number }) {
  const on = useApp((s) => s.prefs.mascot);
  if (!on) return null;
  const ink = '#0F4244';
  const think = mood === 'think';
  return (
    <View accessible accessibilityRole="image" accessibilityLabel="Evu, mascote do Evura" style={{ width: size * 0.92, height: size }}>
      <Svg viewBox="0 0 120 130" width="100%" height="100%">
        <Defs>
          <LinearGradient id="mgd" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#5BF0D2" />
            <Stop offset="1" stopColor="#1FC3A8" />
          </LinearGradient>
        </Defs>
        <Ellipse cx="60" cy="125" rx="30" ry="4.5" fill="#0E1517" opacity={0.12} />
        <Path d={mood === 'cheer' ? 'M24 88Q8 80 8 60' : 'M23 92Q11 96 9 108'} fill="none" stroke="#17B79E" strokeWidth={10} strokeLinecap="round" />
        <Path d={mood === 'cheer' ? 'M96 88Q112 80 112 60' : mood === 'hi' ? 'M96 88Q113 82 113 62' : 'M97 92Q109 96 111 108'} fill="none" stroke="#17B79E" strokeWidth={10} strokeLinecap="round" />
        <Path d="M60 18C84 18 101 44 101 82 101 108 83 122 60 122 37 122 19 108 19 82 19 44 36 18 60 18z" fill="url(#mgd)" />
        <Path d="M30 60C32 44 42 30 54 25" fill="none" stroke="#fff" strokeOpacity={0.45} strokeWidth={5} strokeLinecap="round" />
        <Path d="M60 21C55 8 43 5 36 10 40 21 51 25 60 21z" fill="#FFB547" />
        <Path d="M60 21C65 6 79 2 87 8 83 21 71 25 60 21z" fill="#FF9A1F" />
        <Circle cx="36" cy="86" r="6" fill="#FF8FA3" opacity={0.35} />
        <Circle cx="84" cy="86" r="6" fill="#FF8FA3" opacity={0.35} />
        {mood === 'calm' ? (
          <Path d="M39 70q8-8 16 0M65 70q8-8 16 0" fill="none" stroke={ink} strokeWidth={3.4} strokeLinecap="round" />
        ) : (
          <G>
            <Ellipse cx="47" cy="70" rx="8.5" ry="10.5" fill="#fff" />
            <Ellipse cx="73" cy="70" rx="8.5" ry="10.5" fill="#fff" />
            <Circle cx={think ? 50 : 48} cy={think ? 66 : 72} r="5" fill={ink} />
            <Circle cx={think ? 76 : 74} cy={think ? 66 : 72} r="5" fill={ink} />
          </G>
        )}
        {mood === 'cheer' ? (
          <Path d="M47 87q13 18 26 0z" fill={ink} />
        ) : think ? (
          <Path d="M54 91h12" stroke={ink} strokeWidth={3.2} strokeLinecap="round" />
        ) : (
          <Path d="M48 86q12 14 24 0" fill="none" stroke={ink} strokeWidth={3.4} strokeLinecap="round" />
        )}
        {think && (
          <G>
            <Circle cx="96" cy="22" r="11" fill="#fff" stroke="#17B79E" strokeWidth={2.5} />
            <SvgText x="96" y="27" textAnchor="middle" fontSize="15" fontWeight="700" fill={ink}>?</SvgText>
          </G>
        )}
      </Svg>
    </View>
  );
}

// Anel do dia: um arco por tarefa; ao concluir, o arco se desenha em âmbar.
const APath = Animated.createAnimatedComponent(Path);
const ARect = Animated.createAnimatedComponent(Rect);

function Arc({ d, len, on, color, delay }: { d: string; len: number; on: boolean; color: string; delay: number }) {
  const reduce = useReduceMotion();
  const p = useSharedValue(on ? 1 : 0);
  useEffect(() => {
    p.value = reduce ? (on ? 1 : 0) : withDelay(delay, withTiming(on ? 1 : 0, { duration: 700, easing: EASE }));
  }, [on, reduce, delay, p]);
  const props = useAnimatedProps(() => ({ strokeDashoffset: len * (1 - p.value) }));
  return <APath d={d} stroke={color} strokeWidth={14} strokeLinecap="round" fill="none" strokeDasharray={`${len} ${len}`} animatedProps={props} />;
}

export function DayRing({ done, total, size = 168, children }: { done: boolean[]; total?: number; size?: number; children?: React.ReactNode }) {
  const { c } = useTheme();
  const n = total ?? done.length;
  const r = 70;
  const gap = 0.16;
  const seg = (Math.PI * 2) / n;
  const arc = (i: number) => {
    const a0 = -Math.PI / 2 + i * seg + gap / 2;
    const a1 = a0 + seg - gap;
    const p = (a: number) => `${80 + r * Math.cos(a)} ${80 + r * Math.sin(a)}`;
    return `M${p(a0)} A${r} ${r} 0 ${seg - gap > Math.PI ? 1 : 0} 1 ${p(a1)}`;
  };
  const len = r * (seg - gap);
  const count = done.filter(Boolean).length;
  return (
    <View accessible accessibilityRole="progressbar" accessibilityLabel={`Seu dia: ${count} de ${n} registros feitos`} accessibilityValue={{ min: 0, max: n, now: count }} style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg viewBox="0 0 160 160" width={size} height={size} style={{ position: 'absolute' }}>
        {Array.from({ length: n }, (_, i) => <Path key={`t${i}`} d={arc(i)} stroke={c.sunk} strokeWidth={14} strokeLinecap="round" fill="none" />)}
        {Array.from({ length: n }, (_, i) => <Arc key={`a${i}`} d={arc(i)} len={len} on={!!done[i]} color={c.amber} delay={i * 90} />)}
      </Svg>
      {children ?? (
        <View style={{ alignItems: 'center' }}>
          <T v="hero" weight="display">{count}<T v="h3" tone="mut">/{n}</T></T>
          <T v="micro" tone="mut">registros hoje</T>
        </View>
      )}
    </View>
  );
}

// Copo de água: o líquido sobe com uma mola suave a cada registro.
export function WaterGlass({ pct, size = 64 }: { pct: number; size?: number }) {
  const { c } = useTheme();
  const reduce = useReduceMotion();
  const target = Math.max(0, Math.min(1, pct));
  const p = useSharedValue(target);
  useEffect(() => { p.value = reduce ? target : withSpring(target, { damping: 16, stiffness: 120 }); }, [target, reduce, p]);
  const props = useAnimatedProps(() => ({ y: 8 + (1 - p.value) * 53, height: 53 * p.value + 1 }));
  return (
    <Svg viewBox="0 0 48 64" width={size * 0.75} height={size} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Defs>
        <ClipPath id="glass"><Path d="M6 5H42L36.5 60H11.5Z" /></ClipPath>
      </Defs>
      <ARect x={0} width={48} fill={c.water} opacity={0.85} clipPath="url(#glass)" animatedProps={props} />
      <Path d="M5 4H43L37 61H11Z" fill="none" stroke={c.water} strokeWidth={2.5} strokeLinejoin="round" />
    </Svg>
  );
}
