import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { BookOpen, Check, ChevronRight, Info, Sparkles, ThumbsDown, ThumbsUp } from 'lucide-react-native';
import { Screen, T, Card, Pill, Button, Group, Row, tap } from '@/components/ui';
import { Evu } from '@/components/art';
import { HeroScreen, TipCard } from '@/components/premium';
import { LessonModal } from '@/components/foodvisor';
import { Enter, Pressy } from '@/components/motion';
import { completeLesson, giveFeedback, rateLesson, useApp } from '@/data/store';
import { contextualCoachHeader, lessonsForArea, type Lesson } from '@/data/lessons';
import { useToday } from '@/lib/useDay';
import { useTheme } from '@/theme/useTheme';
import { families, radius, space } from '@/theme/tokens';
import type { Confidence } from '@/engine/analyze';

const toneFor = (k: Confidence): 'good' | 'amberInk' | 'mut' => (k === 'sinal_consistente' ? 'good' : k === 'sinal_fraco' ? 'amberInk' : 'mut');

export default function Descobertas() {
  const { c, dark } = useTheme();
  const { report, trialDay } = useToday();
  const profile = useApp((s) => s.profile);
  const completedLessons = useApp((s) => s.completedLessons);
  const lessonFeedback = useApp((s) => s.lessonFeedback);
  const ai = useApp((s) => !!s.profile?.consents.ai);
  const [voted, setVoted] = useState<Record<string, boolean>>({});
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  const lessons = useMemo(() => lessonsForArea(profile?.area), [profile?.area]);
  const coach = contextualCoachHeader(profile?.name);
  const allLessonsDone = lessons.every((l) => completedLessons.includes(l.id));

  if (!report) return <Screen title="Descobertas"><T>Complete o seu plano para ver as descobertas.</T></Screen>;
  const day7 = trialDay >= 7;

  const openNextLesson = (currentId: string) => {
    const idx = lessons.findIndex((l) => l.id === currentId);
    const next = lessons.slice(idx + 1).find((l) => !completedLessons.includes(l.id));
    setActiveLesson(next ?? null);
  };

  return (
    <HeroScreen
      img={day7 ? 'tela-relatorio' : 'tela-descobertas'}
      title={day7 ? 'Seu relatório do dia 7' : coach.headline}
      subtitle={
        report.daysLogged === 0
          ? `${coach.eyebrow} · Ainda não há registros, mas suas aulas do dia e hipóteses já estão prontas.`
          : `${coach.eyebrow} · Com base em ${report.daysLogged} ${report.daysLogged === 1 ? 'dia registrado' : 'dias registrados'}.`
      }
    >
      {/* Minhas aulas do dia (Coach estilo Foodvisor) */}
      <Enter i={0}>
        <View style={{ gap: space(2) }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <T v="h2" accessibilityRole="header">Minhas aulas do dia</T>
            <Pill label={`${completedLessons.length}/${lessons.length} lidas`} tone="good" />
          </View>
          {allLessonsDone ? (
            <Card style={{ backgroundColor: dark ? c.card : families.broccoli.ul, borderColor: dark ? c.line : families.broccoli.light }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space(3) }}>
                <Sparkles color={families.broccoli.base} size={22} />
                <View style={{ flex: 1 }}>
                  <T weight="semi">Parabéns, você completou suas aulas!</T>
                  <T v="small" tone="mut">Você pode reler qualquer aula abaixo quando quiser.</T>
                </View>
              </View>
            </Card>
          ) : null}

          <View style={{ gap: space(2) }}>
            {lessons.map((l) => {
              const fam = families[l.family];
              const done = completedLessons.includes(l.id);
              return (
                <Pressy
                  key={l.id}
                  scaleTo={0.985}
                  accessibilityRole="button"
                  accessibilityLabel={`Abrir aula: ${l.title}`}
                  onPress={() => { tap(); setActiveLesson(l); }}
                  style={{
                    backgroundColor: dark ? c.card : fam.ul,
                    borderRadius: radius.card,
                    borderWidth: 1,
                    borderColor: dark ? c.line : fam.light,
                    padding: space(4),
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: space(3),
                  }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      backgroundColor: done ? fam.base : dark ? c.sunk : fam.bg,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {done ? <Check color="#FFFFFF" size={20} strokeWidth={3} /> : <BookOpen color={fam.base} size={20} />}
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <T v="micro" weight="semi" style={{ color: dark ? fam.light : fam.base }}>
                      {l.category} · {l.durationMin} min
                    </T>
                    <T weight="semi">{l.title}</T>
                    <T v="small" tone="mut" numberOfLines={2}>{l.subtitle}</T>
                  </View>
                  <ChevronRight color={c.mutLight} size={20} />
                </Pressy>
              );
            })}
          </View>
        </View>
      </Enter>

      {report.safety.mode === 'cuidado' && (
        <Card tone="sunk">
          <View style={{ flexDirection: 'row', gap: space(3) }}>
            <Info color={c.ink} size={22} />
            <View style={{ flex: 1 }}>
              <T weight="semi">Modo cuidadoso ligado</T>
              <T v="small" tone="mut">Pelo que você informou ({report.safety.reasons.join(', ')}), o app não mostra metas de peso nem projeções. Converse com um profissional antes de mudar alimentação, treino ou remédios.</T>
            </View>
          </View>
        </Card>
      )}

      <Enter i={1}><TipCard tag={`Dia ${trialDay}`} title="Para testar amanhã" text={report.action} img="icone-sentir" /></Enter>

      <T v="h2" accessibilityRole="header">O que vimos até agora</T>
      {report.findings.map((f, k) => (
        <Enter key={f.id} i={k + 2}>
          <Card>
            <Pill label={f.confidenceLabel} tone={toneFor(f.confidence)} />
            <T v="h3">{f.title}</T>
            <T>{f.body}</T>
            {f.tip ? <T v="small" tone="mut">Experimente: {f.tip}</T> : null}
            <View style={{ flexDirection: 'row', gap: space(2), marginTop: space(1) }}>
              {voted[f.id] === undefined ? (
                <>
                  <Button small kind="secondary" label="Útil" icon={<ThumbsUp color={c.ink} size={18} />} onPress={() => { giveFeedback(f.id, true); setVoted({ ...voted, [f.id]: true }); }} />
                  <Button small kind="ghost" label="Não ajudou" icon={<ThumbsDown color={c.ink} size={18} />} onPress={() => { giveFeedback(f.id, false); setVoted({ ...voted, [f.id]: false }); }} />
                </>
              ) : (
                <T v="small" tone="mut" accessibilityLiveRegion="polite">Obrigado. Isso ajuda a melhorar os relatórios.</T>
              )}
            </View>
          </Card>
        </Enter>
      ))}

      <T v="h2" accessibilityRole="header">Suas hipóteses do quiz</T>
      <Group>
        {report.quizHypotheses.map((h) => <Row key={h.id} label={h.title} desc={h.status} />)}
      </Group>
      {report.missing.length > 0 && <T v="small" tone="mut">Para testar todas, registre: {report.missing.join('; ')}.</T>}

      {day7 && (
        <>
          <T v="h2" accessibilityRole="header">Seus próximos 7 dias</T>
          <Card>
            {report.nextWeek.map((s, i) => <T key={i}>{`${i + 1}. ${s}`}</T>)}
          </Card>
        </>
      )}

      <Group title="Fontes" note="Cada afirmação geral do app aponta para uma ficha revisada por profissional. As primeiras fichas entram após a revisão clínica; até lá, os achados mostram só o que aparece nos seus próprios dados.">
        <Row label="Biblioteca de fontes" value="0 fichas revisadas" icon={<BookOpen color={c.ink} size={20} />} />
      </Group>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space(3) }}>
        <Evu mood="think" size={48} />
        <T v="micro" tone="mut" style={{ flex: 1 }}>
          {ai ? 'Versão simples, escrita pelo motor do app. A versão escrita pela IA chega quando ela for ligada.' : 'Versão simples, escrita pelo motor do app. Você escolheu não usar a IA.'} Isto é informação, não diagnóstico. {report.engine}
        </T>
      </View>

      <LessonModal
        lesson={activeLesson}
        visible={!!activeLesson}
        liked={activeLesson ? lessonFeedback[activeLesson.id] : undefined}
        onClose={() => setActiveLesson(null)}
        onComplete={(id) => completeLesson(id)}
        onRate={(id, useful) => rateLesson(id, useful)}
        onNext={activeLesson ? () => openNextLesson(activeLesson.id) : undefined}
      />
    </HeroScreen>
  );
}
