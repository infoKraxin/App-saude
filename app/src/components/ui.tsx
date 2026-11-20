// Componentes base. Todos respeitam: tema claro/escuro, escala de texto do app e do sistema,
// alvo de toque >= 48, rótulos para leitor de tela e foco visível no teclado.
import React, { type ReactNode } from 'react';
import {
  Platform, Pressable, ScrollView, Switch, Text, TextInput, View,
  type PressableProps, type StyleProp, type TextInputProps, type TextStyle, type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { font, hit, radius, space, type as ts, type Palette } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { getState } from '../data/store';

type Variant = keyof typeof ts | 'label';
type Tone = keyof Palette;

export function T({
  v = 'body', tone = 'ink', weight, style, children, center, ...rest
}: { v?: Variant; tone?: Tone; weight?: 'reg' | 'med' | 'semi' | 'display'; style?: StyleProp<TextStyle>; children: ReactNode; center?: boolean } & Omit<React.ComponentProps<typeof Text>, 'style'>) {
  const { c, scale } = useTheme();
  const size = (v === 'label' ? ts.small : ts[v]) * scale;
  const isSerif = (v === 'hero' || v === 'h1' || v === 'h2') && weight !== 'display';
  const isDisplay = isSerif || weight === 'display';
  const family = isSerif ? font.serif : weight === 'display' ? font.display : weight === 'semi' || v === 'h3' || v === 'label' ? font.bodySemi : weight === 'med' ? font.bodyMed : font.body;
  return (
    <Text
      maxFontSizeMultiplier={2}
      style={[{ color: c[tone], fontSize: size, lineHeight: Math.round(size * (isDisplay ? 1.12 : 1.45)), fontFamily: family, letterSpacing: isSerif ? -0.3 : isDisplay ? -0.6 : 0 }, center && { textAlign: 'center' }, style]}
      {...rest}
    >
      {children}
    </Text>
  );
}

type PS = { pressed: boolean; focused?: boolean };

export const tap = () => {
  if (Platform.OS !== 'web' && getState().prefs.haptics) Haptics.selectionAsync().catch(() => {});
};

export function Screen({
  title, back, children, scroll = true, footer, pad = true, right, onBack, header,
}: { title?: string; back?: boolean; onBack?: () => void; header?: ReactNode; children: ReactNode; scroll?: boolean; footer?: ReactNode; pad?: boolean; right?: ReactNode }) {
  const { c } = useTheme();
  const router = useRouter();
  const body = <View style={{ padding: pad ? space(5) : 0, paddingBottom: space(10), gap: space(4), maxWidth: 560, width: '100%', alignSelf: 'center' }}>{children}</View>;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={header ? ['left', 'right'] : ['top', 'left', 'right']}>
      {header}
      {!header && (title || back) && (
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: space(2), minHeight: 56, gap: space(1) }}>
          {back ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => (onBack ? onBack() : router.canGoBack() ? router.back() : router.replace('/'))} hitSlop={8} style={{ width: hit, height: hit, alignItems: 'center', justifyContent: 'center', borderRadius: 24 }}>
              <ChevronLeft color={c.ink} size={26} />
            </Pressable>
          ) : <View style={{ width: space(3) }} />}
          {title ? <T v="h3" accessibilityRole="header" style={{ flex: 1 }} numberOfLines={1}>{title}</T> : <View style={{ flex: 1 }} />}
          {right}
        </View>
      )}
      {scroll ? <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">{body}</ScrollView> : <View style={{ flex: 1 }}>{body}</View>}
      {footer && <View style={{ padding: space(5), paddingTop: space(3), borderTopWidth: 1, borderTopColor: c.line, backgroundColor: c.bg }}><View style={{ maxWidth: 560, width: '100%', alignSelf: 'center' }}>{footer}</View></View>}
    </SafeAreaView>
  );
}

export function Card({ children, style, tone = 'card', onPress, label }: { children: ReactNode; style?: StyleProp<ViewStyle>; tone?: 'card' | 'sunk' | 'brand'; onPress?: () => void; label?: string }) {
  const { c } = useTheme();
  const s: ViewStyle = { backgroundColor: c[tone], borderRadius: radius.card, padding: space(5), borderWidth: tone === 'card' ? 1 : 0, borderColor: c.line, gap: space(2) };
  if (!onPress) return <View style={[s, style]}>{children}</View>;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={() => { tap(); onPress(); }} style={(st: PS) => [s, style, st.pressed && { opacity: 0.85 }, st.focused && { borderColor: c.focus, borderWidth: 2 }]}>
      {children}
    </Pressable>
  );
}

export function Button({
  label, onPress, kind = 'primary', disabled, icon, hint, small,
}: { label: string; onPress: () => void; kind?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'onBrand'; disabled?: boolean; icon?: ReactNode; hint?: string; small?: boolean }) {
  const { c } = useTheme();
  const bg = kind === 'primary' ? c.brand : kind === 'secondary' ? c.sunk : 'transparent';
  const fg = kind === 'primary' || kind === 'onBrand' ? c.onBrand : kind === 'danger' ? c.crit : c.ink;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={() => { tap(); onPress(); }}
      style={(st: PS) => [{
        minHeight: small ? 44 : 54, paddingHorizontal: space(5), borderRadius: radius.chip, backgroundColor: bg,
        alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: space(2),
        opacity: disabled ? 0.45 : st.pressed ? 0.85 : 1, borderWidth: kind === 'danger' || kind === 'onBrand' ? 1 : 0, borderColor: kind === 'onBrand' ? c.onBrand : c.crit,
      }, st.focused && { outlineColor: c.focus, outlineWidth: 2, outlineStyle: 'solid' } as ViewStyle]}
    >
      {icon}
      <T v="body" weight="semi" style={{ color: fg }}>{label}</T>
    </Pressable>
  );
}

export function Chip({ label, selected, onPress, icon }: { label: string; selected?: boolean; onPress: () => void; icon?: ReactNode }) {
  const { c } = useTheme();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: !!selected }}
      accessibilityLabel={label}
      onPress={() => { tap(); onPress(); }}
      style={(st: PS) => [{
        minHeight: hit, paddingHorizontal: space(4), borderRadius: radius.chip, flexDirection: 'row', alignItems: 'center', gap: space(2),
        backgroundColor: selected ? c.brand : c.card, borderWidth: 1, borderColor: selected ? c.brand : c.line,
      }, st.focused && { borderColor: c.focus, borderWidth: 2 }]}
    >
      {icon}
      <T v="small" weight="semi" style={{ color: selected ? c.onBrand : c.ink }}>{label}</T>
    </Pressable>
  );
}

// Escolha de 1 a N com rótulos em texto (a cor nunca carrega sozinha o significado).
export function Segmented<V extends string | number>({ label, options, value, onChange }: { label: string; options: { v: V; label: string }[]; value: V | null | undefined; onChange: (v: V) => void }) {
  const { c } = useTheme();
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} style={{ gap: space(2) }}>
      <T v="label">{label}</T>
      <View style={{ flexDirection: 'row', backgroundColor: c.sunk, borderRadius: radius.field, padding: 4, gap: 4 }}>
        {options.map((o) => {
          const on = o.v === value;
          return (
            <Pressable key={String(o.v)} accessibilityRole="radio" accessibilityState={{ checked: on }} accessibilityLabel={`${label}: ${o.label}`}
              onPress={() => { tap(); onChange(o.v); }}
              style={(st: PS) => [{ flex: 1, minHeight: hit, borderRadius: radius.field - 4, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? c.card : 'transparent', paddingHorizontal: 4 }, on && { borderWidth: 1, borderColor: c.line }, st.focused && { borderWidth: 2, borderColor: c.focus }]}>
              <T v="small" weight={on ? 'semi' : 'med'} tone={on ? 'ink' : 'mut'} center>{o.label}</T>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function Row({ label, value, onPress, icon, danger, desc }: { label: string; value?: string; onPress?: () => void; icon?: ReactNode; danger?: boolean; desc?: string }) {
  const { c } = useTheme();
  return (
    <Pressable accessibilityRole={onPress ? 'button' : 'text'} accessibilityLabel={value ? `${label}, ${value}` : label} onPress={onPress ? () => { tap(); onPress(); } : undefined}
      style={(st: PS) => [{ minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: space(3), paddingVertical: space(3), paddingHorizontal: space(4) }, st.pressed && { backgroundColor: c.sunk }, st.focused && { backgroundColor: c.sunk }]}>
      {icon}
      <View style={{ flex: 1 }}>
        <T weight="med" tone={danger ? 'crit' : 'ink'}>{label}</T>
        {desc ? <T v="small" tone="mut">{desc}</T> : null}
      </View>
      {value ? <T v="small" tone="mut" style={{ maxWidth: '45%', textAlign: 'right' }} numberOfLines={2}>{value}</T> : null}
      {onPress ? <ChevronRight color={c.mut} size={20} /> : null}
    </Pressable>
  );
}

export function ToggleRow({ label, desc, value, onChange }: { label: string; desc?: string; value: boolean; onChange: (v: boolean) => void }) {
  const { c } = useTheme();
  return (
    <Pressable accessibilityRole="switch" accessibilityState={{ checked: value }} accessibilityLabel={label} accessibilityHint={desc}
      onPress={() => { tap(); onChange(!value); }}
      style={{ minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: space(3), paddingVertical: space(3), paddingHorizontal: space(4) }}>
      <View style={{ flex: 1 }}>
        <T weight="med">{label}</T>
        {desc ? <T v="small" tone="mut">{desc}</T> : null}
      </View>
      <Switch value={value} onValueChange={(v) => { tap(); onChange(v); }} trackColor={{ true: c.brand, false: c.line }} thumbColor={Platform.OS === 'android' ? c.card : undefined} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden />
    </Pressable>
  );
}

export function Group({ title, children, note }: { title?: string; children: ReactNode; note?: string }) {
  const { c } = useTheme();
  const items = React.Children.toArray(children).filter(Boolean);
  return (
    <View style={{ gap: space(2) }}>
      {title ? <T v="label" tone="mut" accessibilityRole="header" style={{ paddingHorizontal: space(1) }}>{title}</T> : null}
      <View style={{ backgroundColor: c.card, borderRadius: radius.card, borderWidth: 1, borderColor: c.line, overflow: 'hidden' }}>
        {items.map((ch, i) => (
          <View key={i} style={i ? { borderTopWidth: 1, borderTopColor: c.line } : undefined}>{ch}</View>
        ))}
      </View>
      {note ? <T v="small" tone="mut" style={{ paddingHorizontal: space(1) }}>{note}</T> : null}
    </View>
  );
}

export function Field({ label, error, ...p }: { label: string; error?: string } & TextInputProps) {
  const { c, scale } = useTheme();
  return (
    <View style={{ gap: space(2) }}>
      <T v="label">{label}</T>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={c.mut}
        {...p}
        style={[{ minHeight: 54, borderRadius: radius.field, backgroundColor: c.card, borderWidth: error ? 2 : 1, borderColor: error ? c.crit : c.line, paddingHorizontal: space(4), color: c.ink, fontSize: 16 * scale, fontFamily: font.body }, p.multiline && { minHeight: 96, paddingTop: space(3), textAlignVertical: 'top' }, p.style]}
      />
      {error ? <T v="small" tone="crit" accessibilityLiveRegion="polite">{error}</T> : null}
    </View>
  );
}

export function Pill({ label, tone = 'mut' }: { label: string; tone?: Tone }) {
  const { c } = useTheme();
  return (
    <View style={{ alignSelf: 'flex-start', borderRadius: radius.chip, borderWidth: 1, borderColor: c.line, paddingHorizontal: space(3), paddingVertical: 4 }}>
      <T v="micro" weight="semi" tone={tone}>{label}</T>
    </View>
  );
}

export const Gap = ({ h = 4 }: { h?: number }) => <View style={{ height: space(h) }} />;
