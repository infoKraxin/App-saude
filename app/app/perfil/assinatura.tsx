import React from 'react';
import { Screen, T, Card, Group, Row, Pill } from '@/components/ui';
import { useApp } from '@/data/store';
import { addDays, dayKey, diffDays, fmtDay } from '@/data/dates';

// Pagamento é externo (checkout + webhook que libera `entitlements`). A tela mostra o estado;
// os botões de compra entram na fase 3, quando o gateway e as regras das lojas estiverem definidos.
export default function Assinatura() {
  const p = useApp((s) => s.profile);
  const start = p?.trialStart ?? dayKey();
  const end = addDays(start, 7);
  const left = diffDays(dayKey(), end);
  return (
    <Screen back title="Plano e assinatura">
      <Card>
        <Pill label={left > 0 ? 'Teste grátis' : 'Teste encerrado'} tone="amberInk" />
        <T v="h2">{left > 0 ? `${left} ${left === 1 ? 'dia restante' : 'dias restantes'}` : 'Seu teste terminou'}</T>
        <T tone="mut">{left > 0 ? `O teste vai até ${fmtDay(end)}. Sem cartão e sem cobrança automática.` : 'Seu histórico continua aqui. Para registrar e receber relatórios novos, escolha um plano.'}</T>
      </Card>
      <Group title="Planos" note="Valores em reais. A compra é feita fora do app, em página segura, e o acesso é liberado na hora. Você pode cancelar quando quiser e pedir reembolso em até 7 dias.">
        <Row label="Mensal" value="R$ 37,90" />
        <Row label="Trimestral" value="R$ 89,90" />
        <Row label="Anual" value="R$ 197,00" />
      </Group>
      <Group>
        <Row label="Restaurar acesso" desc="Já pagou com este e-mail? O acesso volta ao entrar." />
        <Row label="Recibos" desc="Enviados ao seu e-mail após cada pagamento." />
      </Group>
    </Screen>
  );
}
