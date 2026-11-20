import { useEffect, useState } from 'react';
import { AccessibilityInfo, useColorScheme } from 'react-native';
import { useApp } from '../data/store';
import { dark, light, type Palette } from './tokens';

export function useReduceMotion() {
  const pref = useApp((s) => s.prefs.reduceMotion);
  const [sys, setSys] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setSys).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setSys);
    return () => sub.remove();
  }, []);
  return pref === 'on' ? true : pref === 'off' ? false : sys;
}

export function useTheme(): { c: Palette; dark: boolean; scale: number } {
  const sys = useColorScheme();
  const mode = useApp((s) => s.prefs.theme);
  const scale = useApp((s) => s.prefs.textScale);
  const isDark = mode === 'system' ? sys === 'dark' : mode === 'dark';
  return { c: isDark ? dark : light, dark: isDark, scale };
}
