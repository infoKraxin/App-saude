import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Check, ChevronRight, Plus, TriangleAlert } from 'lucide-react-native';
import { Screen, T, Card, Button, Pill, tap } from '@/components/ui';
import { DayRing, Evu, WaterGlass } from '@/components/art';
import { Enter, Pop, Pressy } from '@/components/motion';
import { Illus, Thumb, TipCard, toast } from '@/components/premium';
import { KIND_ICON } from '@/components/illus';
import { addLog, removeLog, useApp } from '@/data/store';
import { dayKey, fmtDay, fmtWeekday, greeting } from '@/data/dates';
import { useToday } from '@/lib/useDay';
import { useTheme } from '@/theme/useTheme';
import { hit, radius, space } from '@/theme/tokens';

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
  const addWater = (ml: number) => {
    const l = addLog({ kind: 'water', ml });
    toast(`${ml} ml de água registrados`, () => removeLog(l.id));
  };
  let i = 0;

  return (
    <Screen>
      <Enter i={i++}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space(3) }}>
          <View style={{ flex: 1, gap: 2 }}>
            <T v="small" tone="mut">{fmtWeekday(today)}, {fmtDay(today)}</T>
            <T v="h1" accessibilityRole="header">{greeting()}{name ? `, ${name}` : ''}</T>
          </View>
          <Pressy accessibilityRole="button" accessibilityLabel="Abrir perfil e configurações" onPress={() => { tap(); router.push('/perfil'); }}
            style={{ width: hit, height: hit, borderRadius: hit / 2, backgroundColor: c.brand, alignItems: 'center', justifyContent: 'center' }}>
            <T v="h3" style={{ color: c.onBrand }}>{(name?.[0] ?? 'E').toUpperCase()}</T>
          </Pressy>
        </View>
        {trialDay <= 7 && <View style={{ marginTop: space(3) }}><Pill label={trialDay >= 7 ? 'Último dia do seu teste grátis' : `Dia ${trialDay} de 7 do seu teste grátis`} tone="amberInk" /></View>}
      </Enter>

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

      <Enter i={i++}>
        <Card style={{ gap: space(4) }}>
          <View style={{ alignItems: 'center', gap: space(2) }}>
            <DayRing done={tasks.map((t) => t.done)} />
            {allDone ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space(2) }}>
                <Evu mood="cheer" size={44} />
                <T weight="semi" style={{ flex: 1 }}>Dia completo. Isso alimenta suas descobertas.</T>
              </View>
            ) : (
              <T v="small" tone="mut" center>Toque em um item para registrar. Leva segundos.</T>
            )}
          </View>
          <View>
            {tasks.map((t, k) => (
              <Pressy key={t.kind} scaleTo={0.985} accessibilityRole="button" accessibilityLabel={`${t.label}: ${t.detail}. ${t.done ? 'Feito' : 'Registrar'}`}
                onPress={() => { tap(); router.push(`/registro/${t.kind}`); }}
                style={{ minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: space(3), borderTopWidth: k ? 1 : 0, borderTopColor: c.line }}>
                <Thumb name={KIND_ICON[t.kind]} />
                <View style={{ flex: 1 }}>
                  <T weight="semi">{t.label}</T>
                  <T v="small" tone="mut">{t.detail}</T>
                </View>
                <Pop on={t.done}>
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: t.done ? c.amber : c.brand, alignItems: 'center', justifyContent: 'center' }}>
                    {t.done ? <Check color="#0E1517" size={18} strokeWidth={3} /> : <Plus color={c.onBrand} size={20} strokeWidth={2.5} />}
                  </View>
                </Pop>
              </Pressy>
            ))}
          </View>
        </Card>
      </Enter>

      <Enter i={i++}>
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space(4) }}>
            <WaterGlass pct={water / goal} />
            <View style={{ flex: 1 }}>
              <T v="h2" weight="display">{(water / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} L</T>
              <T v="small" tone="mut">de {(goal / 1000).toLocaleString('pt-BR')} L hoje</T>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: space(2) }}>
            <View style={{ flex: 1 }}><Button kind="secondary" small label="+ 250 ml" hint="Registra um copo de água" onPress={() => addWater(250)} /></View>
            <View style={{ flex: 1 }}><Button kind="secondary" small label="+ 500 ml" hint="Registra uma garrafa de água" onPress={() => addWater(500)} /></View>
          </View>
        </Card>
      </Enter>

      {report && report.action && (
        <Enter i={i++}>
          <TipCard tag={`Dia ${Math.min(trialDay, 99)}`} title="Para testar amanhã" text={report.action} img="tela-descobertas" />
        </Enter>
      )}

      {(profile?.motive || profile?.eventName) && (
        <Enter i={i++}>
          <Card tone="brand">
            {profile?.motive ? (
              <>
                <T v="small" style={{ color: c.onBrand, opacity: 0.8 }}>O que te move</T>
                <T v="h2" style={{ color: c.onBrand }}>{profile.motive}</T>
              </>
            ) : null}
            {profile?.eventName && eventDays != null && eventDays >= 0 ? (
              <T style={{ color: c.onBrand }}>
                {eventDays === 0 ? `Hoje é o dia: ${profile.eventName.toLowerCase()}.` : `Faltam ${eventDays} ${eventDays === 1 ? 'dia' : 'dias'} para ${profile.eventName.toLowerCase()}.`}
              </T>
            ) : null}
          </Card>
        </Enter>
      )}

      {report && (
        <Enter i={i++}>
          <Pressy accessibilityRole="button" accessibilityLabel="Abrir o relatório de hoje" onPress={() => { tap(); router.push('/descobertas'); }}
            style={{ backgroundColor: c.card, borderRadius: radius.card, borderWidth: 1, borderColor: c.line, overflow: 'hidden' }}>
            <View style={{ backgroundColor: '#C5E2EF' }}><Illus name="tela-relatorio" width="70%" style={{ alignSelf: 'center' }} /></View>
            <View style={{ padding: space(5), gap: space(2) }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <T v="label" tone="mut" style={{ flex: 1 }}>{trialDay >= 7 && trialDay <= 8 ? 'Seu relatório do dia 7 está pronto' : 'Relatório de hoje'}</T>
                <ChevronRight color={c.mut} size={20} />
              </View>
              {first ? (
                <>
                  <T v="h2">{first.title}</T>
                  <Pill label={first.confidenceLabel} />
                </>
              ) : null}
              <T v="small" tone="mut">{report.daysLogged} {report.daysLogged === 1 ? 'dia registrado' : 'dias registrados'} até agora.</T>
            </View>
          </Pressy>
        </Enter>
      )}
    </Screen>
  );
}

