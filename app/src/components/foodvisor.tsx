// Componentes UX/UI inspirados no Foodvisor 7.8.1, adaptados ao Evura:
// - ShimmerBox (500ms)
// - StreakCard (número gigante em serifa, chama, gelos equipados, calendário linear 7d, meta 7/14/30/50)
// - EvuEvolutionCard (mascote evolutivo por constância, nome editável, toque interativo)
// - UncertaintyChart (curva com faixa pontilhada de incerteza + guias verticais de 3 fases)
// - LessonModal (leitor de aula curta com diagrama educativo + "Achou interessante?")
// - RecapModal (resumo pós-registro com recompensa animada do Evu)

import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { BookOpen, Check, ChevronRight, Flame, Pencil, Shield, Snowflake, Sparkles, ThumbsDown, ThumbsUp, X } from 'lucide-react-native';
import { Button, Card, Pill, T, tap } from './ui';
import { Evu } from './art';
import { EASE, Pop, Pressy } from './motion';
import { families, font, hit, radius, space } from '../theme/tokens';
import { useReduceMotion, useTheme } from '../theme/useTheme';
import { STREAK_GOALS, type EvuStage, type StreakSummary } from '../data/gamification';
import type { Lesson } from '../data/lessons';
import type { StreakGoal } from '../data/types';

// ---------- 1. ShimmerBox (500ms Foodvisor) ----------
export function ShimmerBox({ height = 18, width = '100%', style }: { height?: number; width?: number | `${number}%`; style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  const reduce = useReduceMotion();
  const op = useSharedValue(0.45);
  useEffect(() => {
    if (reduce) return;
    op.value = withRepeat(withTiming(0.95, { duration: 500, easing: EASE }), -1, true);
  }, [reduce, op]);
  const anim = useAnimatedStyle(() => ({ opacity: reduce ? 0.65 : op.value }));
  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[{ height, width, borderRadius: radius.tag, backgroundColor: c.sunk }, anim, style]}
    />
  );
}

// ---------- 2. StreakCard (Sequência + Gelos + Meta 7/14/30/50) ----------
export function StreakCard({
  streak,
  onSelectGoal,
  onUseFreeze,
  compact = false,
}: {
  streak: StreakSummary;
  onSelectGoal?: (g: StreakGoal) => void;
  onUseFreeze?: () => void;
  compact?: boolean;
}) {
  const { c, dark } = useTheme();
  const fam = families.campfire;
  const sky = families.sky;

  return (
    <Card
      style={{
        backgroundColor: dark ? c.card : fam.ul,
        borderColor: dark ? c.line : fam.light,
        borderRadius: radius.largeCard,
        gap: space(3),
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space(3) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space(3), flex: 1 }}>
          <View
            style={{
              width: 54,
              height: 54,
              borderRadius: 27,
              backgroundColor: dark ? c.sunk : fam.bg,
              borderWidth: 1,
              borderColor: dark ? c.line : fam.light,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Flame color={fam.base} size={28} fill={streak.current > 0 ? fam.base : 'transparent'} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
              <T style={{ fontFamily: font.serif, fontSize: compact ? 34 : 44, lineHeight: compact ? 38 : 48, color: c.ink }}>
                {streak.current}
              </T>
              <T v="small" weight="semi" tone="mut">
                {streak.current === 1 ? 'dia seguido' : 'dias seguidos'}
              </T>
            </View>
            <T v="micro" tone="mut">
              Meta: {streak.goalDays} dias ({streak.goalLabel}) · Recorde: {streak.best}
            </T>
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            backgroundColor: dark ? c.sunk : sky.bg,
            borderColor: dark ? c.line : sky.light,
            borderWidth: 1,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: radius.tag,
          }}
        >
          <Snowflake color={sky.base} size={15} />
          <T v="micro" weight="semi" style={{ color: dark ? c.ink : '#1B5E8A' }}>
            {streak.freezes} {streak.freezes === 1 ? 'gelo' : 'gelos'}
          </T>
        </View>
      </View>

      {/* Calendário linear 7 dias */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 6 }}>
        {streak.week.map((d) => {
          const isDone = d.status === 'done';
          const isFreeze = d.status === 'freeze';
          const isToday = d.status === 'today';
          return (
            <View key={d.day} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: isDone ? fam.base : isFreeze ? sky.base : dark ? c.sunk : '#FFFFFF',
                  borderWidth: isToday ? 2 : 1,
                  borderColor: isDone ? fam.base : isFreeze ? sky.base : isToday ? c.ink : c.line,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isDone ? (
                  <Check color="#FFFFFF" size={16} strokeWidth={3} />
                ) : isFreeze ? (
                  <Snowflake color="#FFFFFF" size={15} />
                ) : (
                  <T v="micro" tone="mut">{d.label}</T>
                )}
              </View>
              <T v="micro" tone={isToday ? 'ink' : 'mutLight'} weight={isToday ? 'semi' : 'reg'}>
                {d.label}
              </T>
            </View>
          );
        })}
      </View>

      {streak.canProtectYesterday && onUseFreeze && (
        <View
          style={{
            backgroundColor: dark ? c.sunk : '#FFFFFF',
            borderRadius: radius.card,
            borderWidth: 1,
            borderColor: dark ? c.line : sky.light,
            padding: space(3),
            gap: space(2),
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space(2) }}>
            <Shield color={sky.base} size={18} />
            <T v="small" weight="semi" style={{ flex: 1 }}>
              Todo mundo perde um dia! Proteja ontem com 1 gelo.
            </T>
          </View>
          <Button small kind="secondary" label="Usar 1 gelo e manter sequência" onPress={onUseFreeze} />
        </View>
      )}

      {!compact && onSelectGoal && (
        <View style={{ gap: space(2), paddingTop: space(1) }}>
          <T v="micro" weight="semi" tone="mut">Escolha sua meta de constância</T>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {STREAK_GOALS.map((g) => {
              const sel = g.days === streak.goalDays;
              return (
                <Pressable
                  key={g.days}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: sel }}
                  onPress={() => { tap(); onSelectGoal(g.days); }}
                  style={{
                    flex: 1,
                    minHeight: 48,
                    borderRadius: radius.card,
                    backgroundColor: sel ? c.ink : dark ? c.sunk : '#FFFFFF',
                    borderWidth: sel ? 2 : 1,
                    borderColor: sel ? c.ink : c.line,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 6,
                  }}
                >
                  <T v="small" weight="semi" style={{ color: sel ? c.onBrand : c.ink }}>{g.days}d</T>
                  <T v="micro" style={{ color: sel ? c.onBrand : c.mut, opacity: sel ? 0.85 : 1 }}>{g.label}</T>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
    </Card>
  );
}

// ---------- 3. EvuEvolutionCard (Mascote evolutivo por constância) ----------
export function EvuEvolutionCard({
  evuName,
  stage,
  totalDays,
  onRename,
}: {
  evuName: string;
  stage: EvuStage;
  totalDays: number;
  onRename: (name: string) => void;
}) {
  const { c, dark } = useTheme();
  const fam = families.seaweed;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(evuName);
  const [cheered, setCheered] = useState(false);

  const saveName = () => {
    onRename(draft);
    setEditing(false);
  };

  return (
    <Card
      style={{
        backgroundColor: dark ? c.card : fam.ul,
        borderColor: dark ? c.line : fam.light,
        borderRadius: radius.largeCard,
        gap: space(3),
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space(3) }}>
        <Pressy
          accessibilityRole="button"
          accessibilityLabel={`Interagir com ${evuName}`}
          onPress={() => {
            tap();
            setCheered(true);
            setTimeout(() => setCheered(false), 1400);
          }}
        >
          <Pop on={cheered}>
            <View
              style={{
                width: 74,
                height: 74,
                borderRadius: 37,
                backgroundColor: dark ? c.sunk : '#FFFFFF',
                borderWidth: 1,
                borderColor: dark ? c.line : fam.light,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Evu mood={cheered ? 'cheer' : stage.mood} size={58} />
            </View>
          </Pop>
        </Pressy>

        <View style={{ flex: 1, gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ backgroundColor: dark ? c.sunk : fam.bg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.tag }}>
              <T v="micro" weight="semi" style={{ color: dark ? fam.light : '#0B6E56' }}>
                Estágio {stage.level} de 5
              </T>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Renomear mascote"
              onPress={() => { tap(); setDraft(evuName); setEditing(!editing); }}
              hitSlop={8}
            >
              <Pencil color={c.mut} size={14} />
            </Pressable>
          </View>
          <T v="h3">{evuName} · {stage.title}</T>
          <T v="small" tone="mut">{cheered ? 'Obrigado pelo carinho! Vamos seguir firmes hoje.' : stage.subtitle}</T>
        </View>
      </View>

      {editing && (
        <View style={{ flexDirection: 'row', gap: space(2), alignItems: 'center' }}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Nome do seu companheiro"
            placeholderTextColor={c.mutLight}
            maxLength={20}
            style={{
              flex: 1,
              minHeight: 44,
              borderRadius: radius.field,
              borderWidth: 1,
              borderColor: c.line,
              backgroundColor: c.card,
              paddingHorizontal: space(3),
              color: c.ink,
              fontFamily: font.body,
            }}
          />
          <Button small label="Salvar" onPress={saveName} />
        </View>
      )}

      <View style={{ gap: 6 }}>
        <View style={{ height: 8, borderRadius: 99, backgroundColor: dark ? c.sunk : '#FFFFFF', overflow: 'hidden', borderWidth: 1, borderColor: dark ? c.line : fam.light }}>
          <View style={{ width: `${Math.max(8, Math.round(stage.progressPct * 100))}%`, height: '100%', backgroundColor: fam.base, borderRadius: 99 }} />
        </View>
        <T v="micro" tone="mut">
          {stage.nextDays
            ? `${totalDays} de ${stage.nextDays} dias registrados para o próximo estágio`
            : `${totalDays} dias registrados · Estágio máximo de constância`}
        </T>
      </View>
    </Card>
  );
}

// ---------- 4. UncertaintyChart (Curva com faixa pontilhada + 3 fases) ----------
export function UncertaintyChart({
  points,
  phases = ['Preparar', 'Avançar', 'Estabilizar'],
  color,
}: {
  points: number[];
  phases?: [string, string, string];
  color?: string;
}) {
  const { c } = useTheme();
  const stroke = color ?? families.seaweed.base;
  const W = 320;
  const H = 136;
  const padX = 16;
  const padTop = 18;
  const padBot = 28;
  const usableW = W - padX * 2;
  const usableH = H - padTop - padBot;

  const min = Math.min(...points) - 0.8;
  const max = Math.max(...points) + 0.8;
  const range = Math.max(1, max - min);

  const x = (i: number) => padX + (points.length === 1 ? usableW / 2 : (i / (points.length - 1)) * usableW);
  const y = (v: number) => padTop + (1 - (v - min) / range) * usableH;

  const mainPath = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(p).toFixed(1)}`).join(' ');
  const upperPath = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${Math.max(padTop, y(p) - 10).toFixed(1)}`).join(' ');
  const lowerPath = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${Math.min(H - padBot, y(p) + 10).toFixed(1)}`).join(' ');

  const g1 = padX + usableW / 3;
  const g2 = padX + (usableW * 2) / 3;

  return (
    <View style={{ gap: 6 }}>
      <Svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {/* Guias verticais das 3 fases */}
        <Line x1={g1} y1={padTop - 4} x2={g1} y2={H - padBot} stroke={c.line} strokeWidth={1} strokeDasharray="4 4" />
        <Line x1={g2} y1={padTop - 4} x2={g2} y2={H - padBot} stroke={c.line} strokeWidth={1} strokeDasharray="4 4" />
        <Line x1={padX} y1={H - padBot} x2={W - padX} y2={H - padBot} stroke={c.line} strokeWidth={1} />
        {/* Faixa pontilhada de incerteza */}
        <Path d={upperPath} stroke={stroke} strokeOpacity={0.35} strokeWidth={1.5} strokeDasharray="4 4" fill="none" />
        <Path d={lowerPath} stroke={stroke} strokeOpacity={0.35} strokeWidth={1.5} strokeDasharray="4 4" fill="none" />
        {/* Linha principal */}
        <Path d={mainPath} stroke={stroke} strokeWidth={3} fill="none" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <Circle key={i} cx={x(i)} cy={y(p)} r={4} fill="#FFFFFF" stroke={stroke} strokeWidth={2.5} />
        ))}
      </Svg>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 }}>
        {phases.map((ph, idx) => (
          <View key={ph} style={{ flex: 1, alignItems: idx === 0 ? 'flex-start' : idx === 2 ? 'flex-end' : 'center' }}>
            <T v="micro" weight="semi" tone="mutLight">{ph}</T>
          </View>
        ))}
      </View>
    </View>
  );
}

// ---------- 5. LessonModal (Leitor de Aula do Dia estilo Foodvisor Coach) ----------
export function LessonModal({
  lesson,
  visible,
  liked,
  onClose,
  onComplete,
  onRate,
  onNext,
}: {
  lesson: Lesson | null;
  visible: boolean;
  liked?: boolean;
  onClose: () => void;
  onComplete: (id: string) => void;
  onRate: (id: string, useful: boolean) => void;
  onNext?: () => void;
}) {
  const { c, dark } = useTheme();
  if (!lesson) return null;
  const fam = families[lesson.family];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: dark ? c.bg : fam.ul }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: space(5), paddingBottom: space(2) }}>
          <View style={{ backgroundColor: dark ? c.sunk : fam.bg, borderRadius: radius.tag, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: dark ? c.line : fam.light }}>
            <T v="micro" weight="semi" style={{ color: c.ink }}>{lesson.category} · {lesson.durationMin} min</T>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fechar aula"
            onPress={() => { tap(); onClose(); }}
            style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: c.card, borderWidth: 1, borderColor: c.line, alignItems: 'center', justifyContent: 'center' }}
          >
            <X color={c.ink} size={20} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ padding: space(5), gap: space(4), paddingBottom: space(12) }}>
          <T v="h1">{lesson.title}</T>
          <T tone="mut">{lesson.subtitle}</T>

          {lesson.steps.map((st, idx) => (
            <Card key={idx} style={{ borderColor: dark ? c.line : fam.light }}>
              <T v="h3">{st.heading}</T>
              <T tone="mut">{st.body}</T>
            </Card>
          ))}

          {/* Diagrama educativo estilo Foodvisor (cartão branco com destaque colorido) */}
          <Card style={{ borderColor: fam.base, borderWidth: 1.5, gap: space(3) }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space(2) }}>
              <BookOpen color={fam.base} size={20} />
              <T v="h3" style={{ flex: 1 }}>{lesson.diagram.title}</T>
            </View>
            {lesson.diagram.nodes.map((n, idx) => (
              <View key={idx} style={{ flexDirection: 'row', gap: space(3), alignItems: 'flex-start' }}>
                <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: dark ? c.sunk : fam.bg, alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                  <T v="micro" weight="semi" style={{ color: fam.base }}>{idx + 1}</T>
                </View>
                <View style={{ flex: 1 }}>
                  <T weight="semi">{n.label}</T>
                  <T v="small" tone="mut">{n.note}</T>
                </View>
              </View>
            ))}
          </Card>

          <Card style={{ backgroundColor: dark ? c.sunk : fam.bg, borderColor: dark ? c.line : fam.light }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space(2) }}>
              <Sparkles color={fam.base} size={18} />
              <T v="label">Para levar para o seu dia</T>
            </View>
            <T weight="med">{lesson.takeaway}</T>
          </Card>

          {/* Feedback "Achou interessante?" */}
          <Card style={{ alignItems: 'center', gap: space(3) }}>
            <T weight="semi">Achou esta aula interessante?</T>
            <View style={{ flexDirection: 'row', gap: space(3), width: '100%' }}>
              <View style={{ flex: 1 }}>
                <Button
                  small
                  kind={liked === true ? 'primary' : 'secondary'}
                  label="Sim, ajudou"
                  icon={<ThumbsUp color={liked === true ? c.onBrand : c.ink} size={16} />}
                  onPress={() => onRate(lesson.id, true)}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  small
                  kind={liked === false ? 'primary' : 'secondary'}
                  label="Nem tanto"
                  icon={<ThumbsDown color={liked === false ? c.onBrand : c.ink} size={16} />}
                  onPress={() => onRate(lesson.id, false)}
                />
              </View>
            </View>
          </Card>
        </ScrollView>

        <View style={{ padding: space(5), borderTopWidth: 1, borderTopColor: c.line, backgroundColor: c.card, flexDirection: 'row', gap: space(3) }}>
          <View style={{ flex: 1 }}>
            <Button
              label={onNext ? 'Concluir e ir para a próxima' : 'Concluir aula'}
              onPress={() => {
                onComplete(lesson.id);
                if (onNext) onNext();
                else onClose();
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ---------- 6. RecapModal (Resumo pós-registro com recompensa animada do Evu) ----------
export function RecapModal({
  visible,
  title,
  summary,
  streakDays,
  onDone,
}: {
  visible: boolean;
  title: string;
  summary: string;
  streakDays: number;
  onDone: () => void;
}) {
  const { c, dark } = useTheme();
  const fam = families.seaweed;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDone}>
      <View style={{ flex: 1, backgroundColor: c.overlay, justifyContent: 'flex-end' }}>
        <View
          style={{
            backgroundColor: dark ? c.card : '#FFFFFF',
            borderTopLeftRadius: radius.sheet,
            borderTopRightRadius: radius.sheet,
            padding: space(6),
            paddingBottom: space(8),
            alignItems: 'center',
            gap: space(3),
          }}
        >
          <View
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              backgroundColor: dark ? c.sunk : fam.bg,
              borderWidth: 2,
              borderColor: fam.base,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Evu mood="cheer" size={76} />
          </View>
          <Pill label={streakDays > 0 ? `Sequência ativa · ${streakDays} ${streakDays === 1 ? 'dia' : 'dias'}` : 'Registro salvo'} tone="good" />
          <T v="h1" center>{title}</T>
          <T tone="mut" center>{summary}</T>
          <View style={{ width: '100%', marginTop: space(2) }}>
            <Button label="Continuar" onPress={onDone} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function MissionRow({
  title,
  desc,
  done,
  onPress,
}: {
  title: string;
  desc: string;
  done: boolean;
  onPress: () => void;
}) {
  const { c, dark } = useTheme();
  const fam = families.broccoli;
  return (
    <Pressy
      scaleTo={0.985}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${done ? 'Concluída' : 'Pendente'}`}
      onPress={() => { tap(); onPress(); }}
      style={{
        minHeight: hit + 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: space(3),
        paddingVertical: space(3),
        paddingHorizontal: space(4),
        backgroundColor: done ? (dark ? c.sunk : fam.ul) : c.card,
      }}
    >
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: done ? fam.base : 'transparent',
          borderWidth: 2,
          borderColor: done ? fam.base : c.line,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {done ? <Check color="#FFFFFF" size={16} strokeWidth={3} /> : null}
      </View>
      <View style={{ flex: 1 }}>
        <T weight="semi" style={done ? { textDecorationLine: 'line-through', opacity: 0.7 } : undefined}>{title}</T>
        <T v="small" tone="mut">{desc}</T>
      </View>
      {!done && <ChevronRight color={c.mutLight} size={18} />}
    </Pressy>
  );
}
