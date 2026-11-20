// Padrões de tela inspirados em apps editoriais: faixa colorida com ilustração e uma folha
// branca que sobe por cima, miniaturas redondas, cartões de dica e listas com check.
import React, { useEffect, useState, type ReactNode } from 'react';
import { Image, Pressable, ScrollView, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { Check, ChevronLeft, X } from 'lucide-react-native';
import { ILLUS, type IllusName } from './illus';
import { T, tap } from './ui';
import { Enter, EASE } from './motion';
import { useReduceMotion, useTheme } from '../theme/useTheme';
import { hit, radius, space } from '../theme/tokens';

export function Illus({ name, width, style }: { name: IllusName; width?: number | `${number}%`; style?: StyleProp<ViewStyle> }) {
  const it = ILLUS[name];
  return (
    <View style={[{ width: width ?? '100%', aspectRatio: it.ratio }, style]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Image source={it.src} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
    </View>
  );
}

// Miniatura redonda, como os pratos da lista de refeições.
export function Thumb({ name, size = 52 }: { name: IllusName; size?: number }) {
  const it = ILLUS[name];
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: it.bg, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Image source={it.src} style={{ width: size * 1.18, height: size * 1.18 }} resizeMode="cover" />
    </View>
  );
}

const RoundBtn = ({ onPress, label, icon }: { onPress: () => void; label: string; icon: ReactNode }) => (
  <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={() => { tap(); onPress(); }} hitSlop={6}
    style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.85)', alignItems: 'center', justifyContent: 'center' }}>
    {icon}
  </Pressable>
);

// Tela com faixa ilustrada no topo e conteúdo numa folha arredondada por cima.
export function HeroScreen({
  img, title, subtitle, back, close, children, footer, tall,
}: { img: IllusName; title: string; subtitle?: string; back?: boolean; close?: boolean; children: ReactNode; footer?: ReactNode; tall?: boolean }) {
  const { c } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const it = ILLUS[img];
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));
  return (
    <View style={{ flex: 1, backgroundColor: it.bg }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={{ paddingTop: insets.top, backgroundColor: it.bg }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: space(4), minHeight: 52, alignItems: 'center' }}>
            {back ? <RoundBtn label="Voltar" onPress={goBack} icon={<ChevronLeft color="#0E1517" size={24} />} /> : <View />}
            {close ? <RoundBtn label="Fechar" onPress={goBack} icon={<X color="#0E1517" size={22} />} /> : null}
          </View>
          <View style={{ alignItems: 'center', paddingHorizontal: tall ? 0 : space(6), marginTop: -space(2) }}>
            <Illus name={img} width={tall ? '100%' : '92%'} style={{ maxWidth: 560 }} />
          </View>
        </View>
        <View style={{ flex: 1, backgroundColor: c.bg, borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet, marginTop: -space(7), paddingTop: space(6) }}>
          <View style={{ paddingHorizontal: space(5), paddingBottom: space(10), gap: space(4), maxWidth: 560, width: '100%', alignSelf: 'center' }}>
            <Enter i={0}>
              <T v="h1" accessibilityRole="header" center>{title}</T>
              {subtitle ? <T tone="mut" center style={{ marginTop: space(2) }}>{subtitle}</T> : null}
            </Enter>
            {children}
          </View>
        </View>
      </ScrollView>
      {footer ? (
        <View style={{ padding: space(5), paddingTop: space(3), paddingBottom: space(5) + insets.bottom * 0.5, backgroundColor: c.bg }}>
          <View style={{ maxWidth: 560, width: '100%', alignSelf: 'center' }}>{footer}</View>
        </View>
      ) : null}
    </View>
  );
}

// Cabeçalho colorido de registro (miniatura + título + fechar), como uma ficha.
export function SheetHeader({ img, title, subtitle }: { img: IllusName; title: string; subtitle?: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const it = ILLUS[img];
  return (
    <View style={{ backgroundColor: it.bg, paddingTop: insets.top + space(2), paddingBottom: space(5), paddingHorizontal: space(5) }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space(3), maxWidth: 560, width: '100%', alignSelf: 'center' }}>
        <Thumb name={img} size={64} />
        <View style={{ flex: 1 }}>
          <T v="h2" accessibilityRole="header" style={{ color: '#0E1517' }}>{title}</T>
          {subtitle ? <T v="small" style={{ color: '#3D4A48' }}>{subtitle}</T> : null}
        </View>
        <RoundBtn label="Fechar" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} icon={<X color="#0E1517" size={22} />} />
      </View>
    </View>
  );
}

// Cartão de dica, com etiqueta curta (ex.: "Dia 3").
export function TipCard({ tag, title, text, img }: { tag?: string; title?: string; text: string; img?: IllusName }) {
  const { c } = useTheme();
  return (
    <View style={{ backgroundColor: c.peach, borderRadius: radius.card, padding: space(4), flexDirection: 'row', gap: space(3), alignItems: 'center' }}>
      {img ? <View style={{ width: 72, height: 72, borderRadius: 16, backgroundColor: '#FFFFFF', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}><Image source={ILLUS[img].src} style={{ width: 80, height: 80 }} resizeMode="cover" /></View> : null}
      <View style={{ flex: 1, gap: space(1) }}>
        {tag ? <View style={{ alignSelf: 'flex-start', backgroundColor: c.peachTag, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}><T v="micro" weight="semi" style={{ color: '#FFFFFF' }}>{tag}</T></View> : null}
        {title ? <T weight="semi">{title}</T> : null}
        <T v="small">{text}</T>
      </View>
    </View>
  );
}

export function Checks({ items }: { items: string[] }) {
  const { c } = useTheme();
  return (
    <View style={{ gap: space(3) }}>
      {items.map((t, i) => (
        <Enter key={i} i={i + 1} style={{ flexDirection: 'row', gap: space(3), alignItems: 'flex-start' }}>
          <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: c.good, alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
            <Check color="#FFFFFF" size={15} strokeWidth={3} />
          </View>
          <T style={{ flex: 1 }}>{t}</T>
        </Enter>
      ))}
    </View>
  );
}

// ---------- aviso rápido (toast) com desfazer ----------
type ToastMsg = { id: number; text: string; undo?: () => void };
let current: ToastMsg | null = null;
const subs = new Set<(t: ToastMsg | null) => void>();
let timer: ReturnType<typeof setTimeout> | null = null;
export function toast(text: string, undo?: () => void) {
  current = { id: Date.now(), text, undo };
  subs.forEach((f) => f(current));
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => { current = null; subs.forEach((f) => f(null)); }, 4200);
}

export function ToastHost() {
  const { c } = useTheme();
  const reduce = useReduceMotion();
  const insets = useSafeAreaInsets();
  const [t, setT] = useState<ToastMsg | null>(null);
  useEffect(() => { subs.add(setT); return () => { subs.delete(setT); }; }, []);
  if (!t) return null;
  return (
    <Animated.View key={t.id} entering={reduce ? undefined : FadeInUp.duration(320).easing(EASE)} exiting={reduce ? undefined : FadeOutDown.duration(200)}
      accessibilityLiveRegion="polite"
      style={{ position: 'absolute', left: space(4), right: space(4), bottom: insets.bottom + 84, alignItems: 'center' }} pointerEvents="box-none">
      <View style={{ maxWidth: 520, width: '100%', backgroundColor: c.ink, borderRadius: radius.field, paddingVertical: space(3), paddingLeft: space(4), paddingRight: space(2), flexDirection: 'row', alignItems: 'center', gap: space(2) }}>
        <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: c.amber, alignItems: 'center', justifyContent: 'center' }}><Check color="#0E1517" size={14} strokeWidth={3} /></View>
        <T v="small" weight="semi" style={{ flex: 1, color: c.bg }}>{t.text}</T>
        {t.undo ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Desfazer" onPress={() => { t.undo?.(); current = null; setT(null); }} style={{ minHeight: hit - 8, paddingHorizontal: space(3), justifyContent: 'center' }}>
            <T v="small" weight="semi" style={{ color: c.amber }}>Desfazer</T>
          </Pressable>
        ) : null}
      </View>
    </Animated.View>
  );
}

export { SafeAreaView };
