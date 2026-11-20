import React from 'react';
import { Pressable, View } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { House, Lightbulb, Plus, TrendingUp, Users } from 'lucide-react-native';
import { useTheme } from '@/theme/useTheme';
import { font } from '@/theme/tokens';
import { tap } from '@/components/ui';

export default function TabsLayout() {
  const { c, scale } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: 'shift',
        tabBarActiveTintColor: c.brand,
        tabBarInactiveTintColor: c.mut,
        tabBarStyle: { backgroundColor: c.card, borderTopColor: c.line, height: 64 + insets.bottom, paddingTop: 6 },
        tabBarLabelStyle: { fontFamily: font.bodySemi, fontSize: 11.5 * Math.min(scale, 1.15) },
        tabBarAllowFontScaling: true,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Hoje', tabBarIcon: ({ color }) => <House color={color} size={24} /> }} />
      <Tabs.Screen name="descobertas" options={{ title: 'Descobertas', tabBarIcon: ({ color }) => <Lightbulb color={color} size={24} /> }} />
      <Tabs.Screen
        name="registrar"
        options={{
          title: 'Registrar',
          tabBarAccessibilityLabel: 'Registrar algo do seu dia',
          tabBarButton: (props) => (
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Registrar algo do seu dia"
                onPress={() => { tap(); router.push('/registro'); }}
                style={({ pressed }) => ({ marginTop: -18, width: 60, height: 60, borderRadius: 30, backgroundColor: c.brand, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: c.bg, opacity: pressed ? 0.85 : 1 })}
                testID={props.testID}
              >
                <Plus color={c.onBrand} size={28} strokeWidth={2.5} />
              </Pressable>
            </View>
          ),
        }}
      />
      <Tabs.Screen name="progresso" options={{ title: 'Progresso', tabBarIcon: ({ color }) => <TrendingUp color={color} size={24} /> }} />
      <Tabs.Screen name="comunidade" options={{ title: 'Comunidade', tabBarIcon: ({ color }) => <Users color={color} size={24} /> }} />
    </Tabs>
  );
}
