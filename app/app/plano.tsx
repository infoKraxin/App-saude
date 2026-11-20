// Primeira abertura: confirma o plano do quiz ou monta um mini-plano, pede as respostas de
// segurança e os consentimentos. Termina com o teste de 7 dias começando hoje.
import React, { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@/theme/useTheme';
import { Image, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, T, Button, Chip, Field, Card, ToggleRow, Group, Segmented, tap } from '@/components/ui';
import { Evu } from '@/components/art';
import { Checks, Illus } from '@/components/premium';
import { ILLUS, AREA_ILLUS } from '@/components/illus';
import { Pressy } from '@/components/motion';
import { getState, setPrefs, setProfile, useApp } from '@/data/store';
import { AREAS, areaById, type AreaId } from '@/data/areas';
import { dayKey, fmtDay } from '@/data/dates';
import { emptyProfile } from '@/lib/quizLead';
import { space } from '@/theme/tokens';

const MOTIVES = ['Me sentir melhor comigo mesmo', 'Ter mais disposição no dia a dia', 'Cuidar da saúde com mais segurança', 'Estar presente para quem eu amo', 'Recuperar o ritmo que eu tinha', 'Chegar bem a uma data especial'];
const EVENTS = ['Férias', 'Casamento', 'Festa ou encontro', 'Aniversário', 'Viagem'];

type Step = 'confirm' | 'name' | 'area' | 'motive' | 'event' | 'age' | 'safety' | 'sens' | 'consents' | 'minor';

const parseBr = (s: string) => {
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const k = `${m[3]}-${m[2]}-${m[1]}`;
  const d = new Date(+m[3], +m[2] - 1, +m[1]);
  if (d.getMonth() !== +m[2] - 1) return null;
  return k > dayKey() ? k : null;
};

export default function Plano() {
  const router = useRouter();
  const p = useApp((s) => s.profile) ?? emptyProfile();
  const prefs = useApp((s) => s.prefs);
  const steps = useMemo<Step[]>(() => {
    const s0 = getState().profile ?? emptyProfile();
    const out: Step[] = [];
    if (s0.fromQuiz) out.push('confirm');
    if (!s0.name) out.push('name');
    if (!s0.fromQuiz) out.push('area', 'motive', 'event');
    if (!s0.birthYear) out.push('age');
    out.push('safety', 'sens', 'consents');
    return out;
  }, []);
  const [i, setI] = useState(0);
  const [eventText, setEventText] = useState('');
  const [err, setErr] = useState<string | undefined>();
  const [age, setAge] = useState('');
  const [consent, setConsent] = useState({ health: false, ai: true, analytics: false, marketing: false });
  const step: Step = (steps[i] ?? 'consents') as Step;
  useEffect(() => { if (!getState().profile) setProfile(emptyProfile()); }, []);
  const { c } = useTheme();

  const next = () => { setErr(undefined); setI((x) => Math.min(x + 1, steps.length - 1)); };
  const back = i > 0 ? () => setI(i - 1) : undefined;

  const finish = () => {
    const now = new Date().toISOString();
    setProfile({
      onboarded: true,
      trialStart: dayKey(),
      hypotheses: p.hypotheses.length ? p.hypotheses : areaById(p.area).defaultHypotheses,
      consents: {
        health: now,
        ai: consent.ai ? now : undefined,
        analytics: consent.analytics ? now : undefined,
        marketing: consent.marketing ? now : undefined,
      },
    });
    router.replace('/');
  };

  let body: React.ReactNode = null;
  let cta: React.ReactNode = <Button label="Continuar" onPress={next} />;

  if (step === 'confirm') {
    body = (
      <>
        <Illus name="tela-relatorio" width="100%" style={{ borderRadius: 20, overflow: 'hidden' }} />
        <T v="h1" accessibilityRole="header" center>{p.name ? `${p.name}, seu plano já está aqui.` : 'Seu plano já está aqui.'}</T>
        <T tone="mut" center>Trouxemos o que você respondeu no quiz. Confira antes de começar.</T>
        <Group>
          <Row2 k="Foco" v={areaById(p.area).name} />
          {p.motive ? <Row2 k="O que te move" v={p.motive} /> : null}
          {p.eventName ? <Row2 k="Evento" v={`${p.eventName}${p.eventDate ? `, ${fmtDay(p.eventDate)}` : ''}`} /> : null}
        </Group>
        <Checks items={['Registro de 1 minuto por dia', 'Relatório diário com o que pesa no seu caso', 'Relatório do dia 7 grátis, sempre com conteúdo']} />
        <T v="small" tone="mut">Dá para mudar tudo isso depois em Perfil.</T>
      </>
    );
  }
  if (step === 'name') {
    body = (
      <>
        <T v="h1" accessibilityRole="header" center>Como podemos chamar você?</T>
        <Field label="Nome ou apelido" value={p.name} onChangeText={(t) => setProfile({ name: t.slice(0, 40) })} autoCapitalize="words" autoComplete="given-name" error={err} />
      </>
    );
    cta = <Button label="Continuar" onPress={() => (p.name.trim() ? next() : setErr('Escreva um nome ou apelido.'))} />;
  }
  if (step === 'area') {
    body = (
      <>
        <T v="h1" accessibilityRole="header" center>Qual é o seu foco agora?</T>
        <T tone="mut" center>O app inteiro se ajusta a essa escolha. Dá para somar outros focos depois.</T>
        <View style={{ gap: space(2) }}>
          {AREAS.map((a) => (
            <Pressy key={a.id} accessibilityRole="radio" accessibilityState={{ checked: p.area === a.id }} accessibilityLabel={`${a.name}. ${a.short}`}
              onPress={() => { tap(); setProfile({ area: a.id as AreaId, usesPen: a.id === 'cane', hypotheses: a.defaultHypotheses }); }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: space(3), backgroundColor: c.card, borderRadius: 20, borderWidth: p.area === a.id ? 2 : 1, borderColor: p.area === a.id ? c.brand : c.line, padding: space(2), paddingRight: space(4) }}>
              <View style={{ width: 92, height: 64, borderRadius: 14, overflow: 'hidden', backgroundColor: ILLUS[AREA_ILLUS[a.id]].bg }}>
                <Image source={ILLUS[AREA_ILLUS[a.id]].src} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              </View>
              <View style={{ flex: 1 }}>
                <T weight="semi">{a.name}</T>
                <T v="small" tone="mut">{a.short}</T>
              </View>
            </Pressy>
          ))}
        </View>
      </>
    );
  }
  if (step === 'motive') {
    body = (
      <>
        <T v="h1" accessibilityRole="header" center>O que te move?</T>
        <T tone="mut" center>Ele aparece na sua tela Hoje e volta nos dias difíceis.</T>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space(2) }}>
          {MOTIVES.map((m) => <Chip key={m} label={m} selected={p.motive === m} onPress={() => setProfile({ motive: m })} />)}
        </View>
      </>
    );
    cta = <Button label="Continuar" onPress={() => (p.motive ? next() : setErr('Escolha um motivo.'))} />;
    if (err) body = <>{body}<T v="small" tone="crit">{err}</T></>;
  }
  if (step === 'event') {
    body = (
      <>
        <T v="h1" accessibilityRole="header" center>Tem uma data especial chegando?</T>
        <T tone="mut" center>Opcional. Com uma data, o plano mostra a contagem e foca nela.</T>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space(2) }}>
          {EVENTS.map((m) => <Chip key={m} label={m} selected={p.eventName === m} onPress={() => setProfile({ eventName: p.eventName === m ? undefined : m })} />)}
        </View>
        {p.eventName ? <Field label="Data (dia/mês/ano)" placeholder="20/12/2026" value={eventText} onChangeText={(t) => { setEventText(t); setErr(undefined); }} keyboardType="numbers-and-punctuation" error={err} /> : null}
      </>
    );
    cta = (
      <View style={{ gap: space(2) }}>
        <Button label="Continuar" onPress={() => {
          if (p.eventName) {
            const k = parseBr(eventText.trim());
            if (!k) return setErr('Use o formato dia/mês/ano, com uma data futura.');
            setProfile({ eventDate: k });
          }
          next();
        }} />
        <Button kind="ghost" label="Pular, sem data" onPress={() => { setProfile({ eventName: undefined, eventDate: undefined }); next(); }} />
      </View>
    );
  }
  if (step === 'age') {
    body = (
      <>
        <T v="h1" accessibilityRole="header" center>Qual é a sua idade?</T>
        <T tone="mut" center>O Evura é para maiores de 18 anos e ajusta as referências pela idade.</T>
        <Field label="Idade em anos" value={age} onChangeText={(t) => { setAge(t.replace(/\D/g, '').slice(0, 3)); setErr(undefined); }} keyboardType="number-pad" error={err} />
      </>
    );
    cta = <Button label="Continuar" onPress={() => {
      const n = Number(age);
      if (!n || n > 110) return setErr('Digite a sua idade em anos.');
      setProfile({ birthYear: new Date().getFullYear() - n });
      if (n < 18) { setI(steps.length); return; }
      next();
    }} />;
  }
  if (i >= steps.length) {
    body = (
      <>
        <Evu mood="calm" size={88} />
        <T v="h1" accessibilityRole="header" center>O Evura ainda não é para menores de 18 anos.</T>
        <T tone="mut" center>Cuidar da saúde nessa fase pede acompanhamento de um adulto e de um profissional. Converse com a sua família ou procure uma unidade de saúde.</T>
      </>
    );
    cta = null;
  }
  if (step === 'safety' && i < steps.length) {
    const s = p.safety;
    body = (
      <>
        <Evu mood="calm" size={72} />
        <T v="h1" accessibilityRole="header" center>Para deixar o seu plano seguro</T>
        <T tone="mut" center>Nesses casos o app esconde metas de peso e mostra orientações mais cuidadosas. Você pode mudar depois.</T>
        <Group>
          <ToggleRow label="Estou grávida" value={s.pregnant} onChange={(v) => setProfile({ safety: { ...s, pregnant: v } })} />
          <ToggleRow label="Estou amamentando" value={s.breastfeeding} onChange={(v) => setProfile({ safety: { ...s, breastfeeding: v } })} />
          <ToggleRow label="Tenho ou já tive transtorno alimentar" value={s.eatingDisorder} onChange={(v) => setProfile({ safety: { ...s, eatingDisorder: v } })} />
          <ToggleRow label="Uso caneta para controle de peso" desc="Ativa o diário de aplicações. O app nunca sugere dose." value={p.usesPen} onChange={(v) => setProfile({ usesPen: v })} />
          <ToggleRow label="Quero acompanhar meu ciclo" desc="Opcional. Cruza a fase do ciclo com fome, humor e energia." value={p.cycleTracking} onChange={(v) => setProfile({ cycleTracking: v })} />
        </Group>
      </>
    );
  }
  if (step === 'sens' && i < steps.length) {
    body = (
      <>
        <T v="h1" accessibilityRole="header" center>Do seu jeito</T>
        <T tone="mut" center>Algumas pessoas preferem não ver números. Você escolhe.</T>
        <Group>
          <ToggleRow label="Esconder o peso" desc="Mostra só a tendência, sem o número." value={prefs.hideWeight} onChange={(v) => setPrefs({ hideWeight: v })} />
          <ToggleRow label="Esconder calorias" value={prefs.hideCalories} onChange={(v) => setPrefs({ hideCalories: v })} />
          <ToggleRow label="Desligar projeções" desc="Sem curva de peso até a data." value={prefs.hideProjection} onChange={(v) => setPrefs({ hideProjection: v })} />
          <ToggleRow label="Mostrar o Evu" desc="O mascote aparece nos momentos-chave." value={prefs.mascot} onChange={(v) => setPrefs({ mascot: v })} />
        </Group>
        <Segmented label="Tamanho do texto" value={prefs.textScale} onChange={(v) => setPrefs({ textScale: v })} options={[{ v: 1, label: 'Padrão' }, { v: 1.15, label: 'Maior' }, { v: 1.3, label: 'Bem maior' }]} />
      </>
    );
  }
  if (step === 'consents' && i < steps.length) {
    body = (
      <>
        <Illus name="tela-privacidade" width="100%" style={{ borderRadius: 20, overflow: 'hidden', backgroundColor: ILLUS['tela-privacidade'].bg }} />
        <T v="h1" accessibilityRole="header" center>Seus dados, suas escolhas</T>
        <T tone="mut" center>Cada item é separado e pode ser desligado em Perfil, em Privacidade e dados.</T>
        <Group>
          <ToggleRow label="Usar meus dados de saúde para gerar meus relatórios" desc="Necessário para o app funcionar. Seus dados não são vendidos nem usados em anúncios." value={consent.health} onChange={(v) => setConsent({ ...consent, health: v })} />
          <ToggleRow label="Enviar um resumo sem nome e sem e-mail para a IA escrever os textos" desc="Opcional. Sem isso, você recebe a versão simples dos relatórios." value={consent.ai} onChange={(v) => setConsent({ ...consent, ai: v })} />
          <ToggleRow label="Medir o uso do app para melhorar" desc="Opcional. Sem dados de saúde." value={consent.analytics} onChange={(v) => setConsent({ ...consent, analytics: v })} />
          <ToggleRow label="Receber novidades por e-mail" desc="Opcional." value={consent.marketing} onChange={(v) => setConsent({ ...consent, marketing: v })} />
        </Group>
        <Button kind="ghost" label="Ler os termos e a política de privacidade" onPress={() => router.push('/legal')} />
      </>
    );
    cta = <Button label="Começar meus 7 dias" disabled={!consent.health} hint={!consent.health ? 'Ative o primeiro item para continuar' : undefined} onPress={finish} />;
  }

  return (
    <Screen back onBack={back} title={i < steps.length ? `Passo ${i + 1} de ${steps.length}` : ' '} footer={cta}>
      {body}
    </Screen>
  );
}

function Row2({ k, v }: { k: string; v: string }) {
  return (
    <View style={{ padding: space(4), gap: 2 }}>
      <T v="small" tone="mut">{k}</T>
      <T weight="semi">{v}</T>
    </View>
  );
}
