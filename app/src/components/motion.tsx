// Movimento do Evura: poucos momentos, sempre respondendo a algo (entrada da tela, toque,
// conclusão). Tudo some quando a pessoa pede "reduzir movimento" no app ou no sistema.
import React, { useEffect, type ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing, FadeInDown, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming,
} from 'react-native-reanimated';
import { useReduceMotion } from '../theme/useTheme';

export const EASE = Easing.bezier(0.22, 1, 0.36, 1);

// Na web, as entradas usam animação CSS (via react-native-web): começa no primeiro quadro e
// não mexe no layout. No celular, Reanimated.
const css = Platform.OS === 'web' ? StyleSheet.create({
  up: {
    // @ts-expect-error propriedades só do react-native-web
    animationKeyframes: [{ from: { opacity: 0, transform: [{ translateY: 12 }] }, to: { opacity: 1, transform: [{ translateY: 0 }] } }],
    animationDuration: '420ms', animationTimingFunction: 'cubic-bezier(.22,1,.36,1)', animationFillMode: 'both',
  },
  push: {
    // @ts-expect-error propriedades só do react-native-web
    animationKeyframes: [{ from: { opacity: 0.2, transform: [{ translateX: 36 }] }, to: { opacity: 1, transform: [{ translateX: 0 }] } }],
    animationDuration: '300ms', animationTimingFunction: 'cubic-bezier(.22,1,.36,1)', animationFillMode: 'both',
  },
  sheet: {
    // @ts-expect-error propriedades só do react-native-web
    animationKeyframes: [{ from: { opacity: 0.3, transform: [{ translateY: 60 }] }, to: { opacity: 1, transform: [{ translateY: 0 }] } }],
    animationDuration: '340ms', animationTimingFunction: 'cubic-bezier(.22,1,.36,1)', animationFillMode: 'both',
  },
  fade: {
    // @ts-expect-error propriedades só do react-native-web
    animationKeyframes: [{ from: { opacity: 0.35 }, to: { opacity: 1 } }],
    animationDuration: '220ms', animationTimingFunction: 'ease-out', animationFillMode: 'both',
  },
}) : null;

// Entrada em cascata: só na primeira montagem da tela, 60 ms entre blocos.
export function Enter({ i = 0, children, style }: { i?: number; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const reduce = useReduceMotion();
  if (css) {
    // @ts-expect-error propriedade só do react-native-web
    return <View style={[style, !reduce && css.up, !reduce && { animationDelay: `${Math.min(i, 8) * 60}ms` }]}>{children}</View>;
  }
  return (
    <Animated.View style={style} entering={reduce ? undefined : FadeInDown.duration(420).delay(Math.min(i, 8) * 60).easing(EASE).withInitialValues({ transform: [{ translateY: 14 }] })}>
      {children}
    </Animated.View>
  );
}

const APressable = Animated.createAnimatedComponent(Pressable);

// Toque: o bloco escurece de leve (sem mudar de tamanho, para o texto não "pular" ao rolar).
export function Pressy({ style, children, onPressIn, onPressOut, scaleTo, ...rest }: PressableProps & { scaleTo?: number; style?: StyleProp<ViewStyle>; children: ReactNode }) {
  const o = useSharedValue(1);
  const a = useAnimatedStyle(() => ({ opacity: o.value }));
  return (
    <APressable
      {...rest}
      onPressIn={(e) => { o.value = withTiming(0.72, { duration: 90 }); onPressIn?.(e); }}
      onPressOut={(e) => { o.value = withTiming(1, { duration: 180 }); onPressOut?.(e); }}
      style={[style, a]}
    >
      {children}
    </APressable>
  );
}

// "Pulo" quando algo é concluído (check da tarefa, conquista).
export function Pop({ on, children, style }: { on: boolean; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const reduce = useReduceMotion();
  const s = useSharedValue(1);
  const first = React.useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (on && !reduce) s.value = withSequence(withTiming(0.6, { duration: 0 }), withSpring(1, { damping: 7, stiffness: 260 }));
  }, [on, reduce, s]);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return <Animated.View style={[style, a]}>{children}</Animated.View>;
}

// Transição entre telas na web (no celular a navegação nativa já anima).
export function ScreenIn({ children, kind = 'push', style }: { children: ReactNode; kind?: 'push' | 'up' | 'fade'; style?: StyleProp<ViewStyle> }) {
  const reduce = useReduceMotion();
  const k = kind === 'up' ? 'sheet' : kind;
  return <View style={[{ flex: 1 }, style, css && !reduce ? css[k] : null]}>{children}</View>;
}
