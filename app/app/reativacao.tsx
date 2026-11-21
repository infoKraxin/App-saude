// Fluxo condicional de reativação inspirado em welcome_back_dormant.json do Foodvisor 7.8.1,
// adaptado ao Evura para usuários que ficaram dias sem registrar.
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Check, ChevronLeft } from 'lucide-react-native';
import { Screen, T, Card, Button, tap } from '@/components/ui';
import { Evu } from '@/components/art';
import { toast } from '@/components/premium';
import { saveReactivation } from '@/data/store';
import { useTheme } from '@/theme/useTheme';
import { families, radius, space } from '@/theme/tokens';

const REASONS = [
  { id: 'vacation', label: 'Estava de férias ou viajando', reply: 'Férias existem para descansar! Agora é só retomar sem pressa.' },
  { id: 'sick', label: 'Estava doente ou indisposto(a)', reply: 'Sua recuperação vem sempre em primeiro lugar. Vamos recomeçar bem leve.' },
  { id: 'stress', label: 'Passei por dias de estresse', reply: 'Em semanas corridas, registrar 1 único item já é uma vitória.' },
  { id: 'issues', label: 'Tinha outras prioridades', reply: 'A vida acontece. O importante é que você voltou para cuidar de si.' },
];

const FEELINGS = [
  { id: 'excited', label: 'Entusiasmado(a)', positive: true },
  { id: 'confident', label: 'Confiante', positive: true },
  { id: 'grateful', label: 'Grato(a) por voltar', positive: true },
  { id: 'nervous', label: 'Um pouco nervoso(a)', positive: false },
  { id: 'not_sure', label: 'Ainda não tenho certeza', positive: false },
];

const STRATEGIES = [
  'Registrar 1 item por dia em menos de 1 minuto',
  'Manter uma sequência de 7 dias seguidos a partir de hoje',
  'Ler 1 aula curta por dia em Descobertas',
  'Deixar um lembrete no horário mais tranquilo',
  'Falar da minha meta para alguém próximo',
];

export default function Reativacao() {
  const { c, dark } = useTheme();
  const router = useRouter();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [reason, setReason] = useState<string | null>(null);
  const [feeling, setFeeling] = useState<string | null>(null);
  const [strategies, setStrategies] = useState<string[]>([STRATEGIES[0]]);

  const fam = step === 0 ? families.sky : step === 1 ? families.campfire : families.seaweed;
  const selectedReason = REASONS.find((r) => r.id === reason);
  const selectedFeeling = FEELINGS.find((f) => f.id === feeling);

  const toggleStrategy = (s: string) => {
    setStrategies((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));
  };

  const finish = () => {
    saveReactivation(strategies);
    toast('Recomeço salvo! Suas missões de hoje estão prontas.');
    router.replace('/');
  };

  return (
    <Screen
      back
      title="Bem-vindo de volta"
      footer={
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space(3) }}>
          {step > 0 && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Voltar etapa"
              onPress={() => { tap(); setStep((step - 1) as 0 | 1); }}
              style={{
                width: 54,
                height: 54,
                borderRadius: 27,
                backgroundColor: c.card,
                borderWidth: 1.5,
                borderColor: c.line,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ChevronLeft color={c.ink} size={24} />
            </Pressable>
          )}
          <View style={{ flex: 1 }}>
            <Button
              label={step < 2 ? 'Continuar' : 'Começar meus 7 dias'}
              disabled={(step === 0 && !reason) || (step === 1 && !feeling) || (step === 2 && strategies.length === 0)}
              onPress={() => {
                if (step < 2) setStep((step + 1) as 1 | 2);
                else finish();
              }}
            />
          </View>
        </View>
      }
    >
      {/* Progresso segmentado estilo Foodvisor */}
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={{ flex: 1, height: 6, borderRadius: 99, backgroundColor: i <= step ? fam.base : c.line }} />
        ))}
      </View>

      <View style={{ alignItems: 'center', marginVertical: space(1) }}>
        <Evu mood={step === 2 ? 'cheer' : 'calm'} size={86} />
      </View>

      {step === 0 && (
        <>
          <T v="h1" center>Qual foi o principal motivo da sua pausa?</T>
          <T tone="mut" center>Sem julgamentos — entender a pausa ajuda o Evura a ajustar o seu ritmo.</T>
          <View style={{ gap: space(2) }}>
            {REASONS.map((r) => {
              const on = reason === r.id;
              return (
                <Pressable
                  key={r.id}
                  onPress={() => { tap(); setReason(r.id); }}
                  style={{
                    backgroundColor: on ? (dark ? c.sunk : fam.ul) : c.card,
                    borderRadius: radius.card,
                    borderWidth: on ? 2 : 1,
                    borderColor: on ? fam.base : c.line,
                    padding: space(4),
                  }}
                >
                  <T weight="semi">{r.label}</T>
                </Pressable>
              );
            })}
          </View>
          {selectedReason && (
            <Card style={{ backgroundColor: dark ? c.sunk : fam.bg, borderColor: dark ? c.line : fam.light }}>
              <T v="small" weight="med">{selectedReason.reply}</T>
            </Card>
          )}
        </>
      )}

      {step === 1 && (
        <>
          <T v="h1" center>Como você se sente ao pensar em voltar?</T>
          <T tone="mut" center>Qualquer resposta é válida. Vamos no ritmo que funcionar para você.</T>
          <View style={{ gap: space(2) }}>
            {FEELINGS.map((f) => {
              const on = feeling === f.id;
              return (
                <Pressable
                  key={f.id}
                  onPress={() => { tap(); setFeeling(f.id); }}
                  style={{
                    backgroundColor: on ? (dark ? c.sunk : fam.ul) : c.card,
                    borderRadius: radius.card,
                    borderWidth: on ? 2 : 1,
                    borderColor: on ? fam.base : c.line,
                    padding: space(4),
                  }}
                >
                  <T weight="semi">{f.label}</T>
                </Pressable>
              );
            })}
          </View>
          {selectedFeeling && (
            <Card style={{ backgroundColor: dark ? c.sunk : fam.bg, borderColor: dark ? c.line : fam.light }}>
              <T v="small" weight="med">
                {selectedFeeling.positive
                  ? 'Que energia boa! Vamos transformar essa disposição em passos simples e sustentáveis.'
                  : 'Tudo bem ir devagar. Um único registro curto hoje já coloca você de volta no trilho.'}
              </T>
            </Card>
          )}
        </>
      )}

      {step === 2 && (
        <>
          <T v="h1" center>Escolha suas estratégias para os próximos 7 dias</T>
          <T tone="mut" center>Marque uma ou mais opções que cabem na sua semana real.</T>
          <View style={{ gap: space(2) }}>
            {STRATEGIES.map((s) => {
              const on = strategies.includes(s);
              return (
                <Pressable
                  key={s}
                  onPress={() => { tap(); toggleStrategy(s); }}
                  style={{
                    backgroundColor: on ? (dark ? c.sunk : fam.ul) : c.card,
                    borderRadius: radius.card,
                    borderWidth: on ? 2 : 1,
                    borderColor: on ? fam.base : c.line,
                    padding: space(4),
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: space(3),
                  }}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 8,
                      borderWidth: 2,
                      borderColor: on ? fam.base : c.line,
                      backgroundColor: on ? fam.base : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {on ? <Check color="#FFFFFF" size={14} strokeWidth={3} /> : null}
                  </View>
                  <T weight="med" style={{ flex: 1 }}>{s}</T>
                </Pressable>
              );
            })}
          </View>
        </>
      )}
    </Screen>
  );
}
