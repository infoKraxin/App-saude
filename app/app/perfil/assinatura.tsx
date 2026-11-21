import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Bell, Check, CreditCard, ShieldCheck, Sparkles } from 'lucide-react-native';
import { Screen, T, Card, Group, Row, Pill, Button, tap } from '@/components/ui';
import { toast } from '@/components/premium';
import { useApp } from '@/data/store';
import { addDays, dayKey, diffDays, fmtDay } from '@/data/dates';
import { useTheme } from '@/theme/useTheme';
import { families, radius, space } from '@/theme/tokens';

type PlanId = 'anual' | 'trimestral' | 'mensal';

const PLANS: { id: PlanId; name: string; price: string; perMonth: string; badge?: string }[] = [
  { id: 'anual', name: 'Anual', price: 'R$ 197,00', perMonth: 'R$ 16,42 / mês', badge: 'Mais escolhido' },
  { id: 'trimestral', name: 'Trimestral', price: 'R$ 89,90', perMonth: 'R$ 29,97 / mês' },
  { id: 'mensal', name: 'Mensal', price: 'R$ 37,90', perMonth: 'R$ 37,90 / mês' },
];

export default function Assinatura() {
  const { c, dark } = useTheme();
  const p = useApp((s) => s.profile);
  const [selected, setSelected] = useState<PlanId>('anual');
  const start = p?.trialStart ?? dayKey();
  const reminderDay = addDays(start, 5);
  const end = addDays(start, 7);
  const left = diffDays(dayKey(), end);
  const fam = families.seaweed;

  const timeline = [
    {
      icon: <Sparkles color={fam.base} size={18} />,
      title: 'Hoje — R$ 0',
      desc: 'Acesso completo ao motor de descobertas, aulas do dia, sequência e missões.',
    },
    {
      icon: <Bell color={families.campfire.base} size={18} />,
      title: `Dia 5 (${fmtDay(reminderDay)}) — Lembrete`,
      desc: 'Avisamos antes do fim do teste grátis para você decidir com calma.',
    },
    {
      icon: <CreditCard color={families.sky.base} size={18} />,
      title: `Dia 7 (${fmtDay(end)}) — Relatório completo`,
      desc: 'Você recebe seu relatório do dia 7. Só assina se fizer sentido para você.',
    },
  ];

  return (
    <Screen
      back
      title="Plano e assinatura"
      footer={
        <Button
          label={left > 0 ? 'Continuar meu teste grátis' : `Escolher plano ${PLANS.find((x) => x.id === selected)?.name.toLowerCase()}`}
          onPress={() =>
            toast(
              left > 0
                ? 'Seu teste grátis já está ativo! Aproveite os 7 dias sem cobrança.'
                : 'Checkout externo seguro será aberto quando o gateway estiver conectado.',
            )
          }
        />
      }
    >
      {/* Cabeçalho transparente estilo Foodvisor */}
      <Card style={{ backgroundColor: dark ? c.card : fam.ul, borderColor: dark ? c.line : fam.light, borderRadius: radius.largeCard }}>
        <Pill label={left > 0 ? 'Teste grátis ativo' : 'Teste encerrado'} tone="good" />
        <T v="h1">
          {left > 0
            ? `Faltam ${left} ${left === 1 ? 'dia' : 'dias'} do seu teste grátis`
            : 'Continue sua jornada no Evura'}
        </T>
        <T tone="mut">
          {left > 0
            ? `Sem cartão e sem cobrança automática até ${fmtDay(end)}.`
            : 'Seu histórico continua salvo. Escolha um plano para desbloquear novos relatórios e aulas.'}
        </T>
      </Card>

      {/* Linha do tempo do teste de 7 dias (padrão Foodvisor ético) */}
      <Card style={{ borderRadius: radius.largeCard, gap: space(4) }}>
        <T v="h3">Como funcionam os seus 7 dias</T>
        <View style={{ gap: space(3) }}>
          {timeline.map((step, idx) => (
            <View key={idx} style={{ flexDirection: 'row', gap: space(3), alignItems: 'flex-start' }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: c.sunk,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 2,
                }}
              >
                {step.icon}
              </View>
              <View style={{ flex: 1 }}>
                <T weight="semi">{step.title}</T>
                <T v="small" tone="mut">{step.desc}</T>
              </View>
            </View>
          ))}
        </View>
      </Card>

      {/* Cards de preço Foodvisor: borda grossa 3dp e raio 24 no selecionado */}
      <View style={{ gap: space(2) }}>
        <T v="label" tone="mut" style={{ paddingHorizontal: space(1) }}>Escolha seu plano</T>
        {PLANS.map((plan) => {
          const on = selected === plan.id;
          return (
            <Pressable
              key={plan.id}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              onPress={() => { tap(); setSelected(plan.id); }}
              style={{
                backgroundColor: on ? (dark ? c.sunk : fam.ul) : c.card,
                borderRadius: radius.largeCard,
                borderWidth: on ? 3 : 1,
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
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: on ? fam.base : c.line,
                  backgroundColor: on ? fam.base : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {on ? <Check color="#FFFFFF" size={14} strokeWidth={3} /> : null}
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <T v="h3">{plan.name}</T>
                  {plan.badge && (
                    <View style={{ backgroundColor: fam.base, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.tag }}>
                      <T v="micro" weight="semi" style={{ color: '#FFFFFF' }}>{plan.badge}</T>
                    </View>
                  )}
                </View>
                <T v="small" tone="mut">{plan.perMonth}</T>
              </View>
              <T v="h3" weight="display">{plan.price}</T>
            </Pressable>
          );
        })}
      </View>

      {/* Como cancelar explícito */}
      <Card tone="sunk" style={{ gap: space(2) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space(2) }}>
          <ShieldCheck color={fam.base} size={20} />
          <T weight="semi">Como cancelar quando quiser</T>
        </View>
        <T v="small" tone="mut">
          Sem burocracia: basta acessar Perfil → Plano e assinatura ou responder ao e-mail do recibo. Você também tem direito a reembolso integral em até 7 dias após a compra.
        </T>
      </Card>

      <Group title="Dúvidas frequentes">
        <Row label="Restaurar acesso" desc="Já pagou com este e-mail? O acesso volta automaticamente ao entrar." />
        <Row label="Meus dados se eu cancelar" desc="Seu histórico e relatórios gerados continuam disponíveis para leitura e exportação." />
      </Group>
    </Screen>
  );
}
