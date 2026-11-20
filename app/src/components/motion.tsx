// Movimento do Evura: poucos momentos, sempre respondendo a algo (entrada da tela, toque,
// conclusão). Tudo some quando a pessoa pede "reduzir movimento" no app ou no sistema.
import React, { useEffect, type ReactNode } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing, FadeInDown, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming,
} from 'react-native-reanimated';
import { useReduceMotion } from '../theme/useTheme';

export const EASE = Easing.bezier(0.22, 1, 0.36, 1);

// Entrada em cascata: só na primeira montagem da tela, 60 ms entre blocos.
export function Enter({ i = 0, children, style }: { i?: number; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const reduce = useReduceMotion();
  return (
    <Animated.View style={style} entering={reduce ? undefined : FadeInDown.duration(420).delay(Math.min(i, 8) * 60).easing(EASE).withInitialValues({ transform: [{ translateY: 14 }] })}>
      {children}
    </Animated.View>
  );
}

const APressable = Animated.createAnimatedComponent(Pressable);

// Toque com leve afundamento (mola), como um botão físico.
export function Pressy({ style, children, onPressIn, onPressOut, scaleTo = 0.97, ...rest }: PressableProps & { scaleTo?: number; style?: StyleProp<ViewStyle>; children: ReactNode }) {
  const reduce = useReduceMotion();
  const s = useSharedValue(1);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <APressable
      {...rest}
      onPressIn={(e) => { if (!reduce) s.value = withSpring(scaleTo, { damping: 18, stiffness: 420 }); onPressIn?.(e); }}
      onPressOut={(e) => { s.value = withSpring(1, { damping: 14, stiffness: 300 }); onPressOut?.(e); }}
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
