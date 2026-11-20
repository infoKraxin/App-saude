import React from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Check, ChevronRight, Circle, TriangleAlert } from 'lucide-react-native';
import { Screen, T, Card, Button, Pill, tap } from '@/components/ui';
import { DayRing, Evu, WaterGlass } from '@/components/art';
import { addLog, useApp } from '@/data/store';
import { dayKey, fmtDay, fmtWeekday, greeting } from '@/data/dates';
import { useToday } from '@/lib/useDay';
import { useTheme } from '@/theme/useTheme';
import { hit, space } from '@/theme/tokens';

export default function Hoje() {
  const { c } = useTheme();
  const router = useRouter();
  const profile = useApp((s) => s.profile);
  const goal = useApp((s) => s.prefs.waterGoalMl);
  const { tasks, report, trialDay, eventDays, water } = useToday();
  const today = dayKey();
  const allDone = tasks.every((t) => t.done);
  const first = report?.findings[0];
  const name = profile?.name?.trim();

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space(3) }}>
        <View style={{ flex: 1, gap: 2 }}>
          <T v="small" tone="mut">{fmtWeekday(today)}, {fmtDay(today)}</T>
          <T v="h1" accessibilityRole="header">{greeting()}{name ? `, ${name}` : ''}</T>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Abrir perfil e configurações" onPress={() => { tap(); router.push('/perfil'); }}
          style={{ width: hit, height: hit, borderRadius: hit / 2, backgroundColor: c.brand, alignItems: 'center', justifyContent: 'center' }}>
          <T v="h3" style={{ color: c.onBrand }}>{(name?.[0] ?? 'E').toUpperCase()}</T>
        </Pressable>
      </View>

      {trialDay <= 7 && <Pill label={trialDay >= 7 ? 'Último dia do seu teste grátis' : `Dia ${trialDay} de 7 do seu teste grátis`} tone="amberInk" />}

      {report?.safety.urgent && (
        <Card style={{ borderColor: c.crit, borderWidth: 2 }}>
          <View style={{ flexDirection: 'row', gap: space(3) }}>
            <TriangleAlert color={c.crit} size={24} />
            <View style={{ flex: 1, gap: space(1) }}>
              <T weight="semi">Você marcou um sintoma forte</T>
              <T v="small">Procure atendimento ou fale com quem acompanha você. Em emergência, ligue 192.</T>
            </View>
          </View>
        </Card>
      )}

      <Card style={{ alignItems: 'stretch', gap: space(4) }}>
        <View style={{ alignItems: 'center', gap: space(2) }}>
          <DayRing done={tasks.map((t) => t.done)} />
          {allDone ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space(2) }}>
              <Evu mood="cheer" size={44} />
              <T weight="semi">Dia completo. Isso alimenta suas descobertas.</T>
            </View>
          ) : (
            <T v="small" tone="mut" center>Toque em um item para registrar. Leva segundos.</T>
          )}
        </View>
        <View>
          {tasks.map((t, i) => (
            <Pressable key={t.kind} accessibilityRole="button" accessibilityLabel={`${t.label}: ${t.detail}. ${t.done ? 'Feito' : 'Registrar'}`}
              onPress={() => { tap(); router.push(`/registro/${t.kind}`); }}
              style={({ pressed }) => ({ minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: space(3), borderTopWidth: i ? 1 : 0, borderTopColor: c.line, opacity: pressed ? 0.7 : 1 })}>
              {t.done ? (
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: c.amber, alignItems: 'center', justifyContent: 'center' }}><Check color="#0E1517" size={18} strokeWidth={3} /></View>
              ) : <Circle color={c.line} size={28} />}
              <View style={{ flex: 1 }}>
                <T weight="semi">{t.label}</T>
                <T v="small" tone="mut">{t.detail}</T>
              </View>
              <ChevronRight color={c.mut} size={20} />
            </Pressable>
          ))}
        </View>
      </Card>

      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space(4) }}>
          <WaterGlass pct={water / goal} />
          <View style={{ flex: 1 }}>
            <T v="h2">{(water / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} L</T>
            <T v="small" tone="mut">de {(goal / 1000).toLocaleString('pt-BR')} L hoje</T>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: space(2) }}>
          <View style={{ flex: 1 }}><Button kind="secondary" small label="+ 250 ml" hint="Registra um copo de água" onPress={() => addLog({ kind: 'water', ml: 250 })} /></View>
          <View style={{ flex: 1 }}><Button kind="secondary" small label="+ 500 ml" hint="Registra uma garrafa de água" onPress={() => addLog({ kind: 'water', ml: 500 })} /></View>
        </View>
      </Card>

      {(profile?.motive || profile?.eventName) && (
        <Card tone="brand">
          {profile?.motive ? (
            <>
              <T v="small" style={{ color: c.onBrand, opacity: 0.8 }}>O que te move</T>
              <T v="h3" style={{ color: c.onBrand }}>{profile.motive}</T>
            </>
          ) : null}
          {profile?.eventName && eventDays != null && eventDays >= 0 ? (
            <T style={{ color: c.onBrand }}>
              {eventDays === 0 ? `Hoje é o dia: ${profile.eventName.toLowerCase()}.` : `Faltam ${eventDays} ${eventDays === 1 ? 'dia' : 'dias'} para ${profile.eventName.toLowerCase()}.`}
            </T>
          ) : null}
        </Card>
      )}

      {report && (
        <Card onPress={() => router.push('/descobertas')} label="Abrir o relatório de hoje">
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <T v="label" tone="mut" style={{ flex: 1 }}>{trialDay >= 7 && trialDay <= 8 ? 'Seu relatório do dia 7 está pronto' : 'Relatório de hoje'}</T>
            <ChevronRight color={c.mut} size={20} />
          </View>
          {first ? (
            <>
              <T v="h3">{first.title}</T>
              <Pill label={first.confidenceLabel} />
            </>
          ) : null}
          <T v="small" tone="mut">{report.daysLogged} {report.daysLogged === 1 ? 'dia registrado' : 'dias registrados'} até agora.</T>
        </Card>
      )}
    </Screen>
  );
}
