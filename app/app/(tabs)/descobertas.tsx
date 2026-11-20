import React, { useState } from 'react';
import { View } from 'react-native';
import { BookOpen, Info, ThumbsDown, ThumbsUp } from 'lucide-react-native';
import { Screen, T, Card, Pill, Button, Group, Row } from '@/components/ui';
import { Evu } from '@/components/art';
import { giveFeedback, useApp } from '@/data/store';
import { useToday } from '@/lib/useDay';
import { useTheme } from '@/theme/useTheme';
import { space } from '@/theme/tokens';
import type { Confidence } from '@/engine/analyze';

const toneFor = (k: Confidence): 'good' | 'amberInk' | 'mut' => (k === 'sinal_consistente' ? 'good' : k === 'sinal_fraco' ? 'amberInk' : 'mut');

export default function Descobertas() {
  const { c } = useTheme();
  const { report, trialDay } = useToday();
  const ai = useApp((s) => !!s.profile?.consents.ai);
  const [voted, setVoted] = useState<Record<string, boolean>>({});
  if (!report) return <Screen title="Descobertas"><T>Complete o seu plano para ver as descobertas.</T></Screen>;
  const day7 = trialDay >= 7;

  return (
    <Screen>
      <T v="h1" accessibilityRole="header">{day7 ? 'Seu relatório do dia 7' : 'Descobertas'}</T>
      <T tone="mut">
        {report.daysLogged === 0
          ? 'Ainda não há registros. Mesmo assim, aqui está o que vamos investigar e o que falta medir.'
          : `Com base em ${report.daysLogged} ${report.daysLogged === 1 ? 'dia registrado' : 'dias registrados'}. Cada ponto mostra quanto dado sustenta o que dizemos.`}
      </T>

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

      <Card tone="brand">
        <T v="small" style={{ color: c.onBrand, opacity: 0.8 }}>Para testar amanhã</T>
        <T v="h3" style={{ color: c.onBrand }}>{report.action}</T>
      </Card>

      <T v="h2" accessibilityRole="header">O que vimos até agora</T>
      {report.findings.map((f) => (
        <Card key={f.id}>
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
    </Screen>
  );
}
