import React, { useMemo, useState } from 'react';
import { Linking, View } from 'react-native';
import { Screen, T, Field, Group, Card, Button } from '@/components/ui';
import { space } from '@/theme/tokens';

const SUPPORT = process.env.EXPO_PUBLIC_SUPPORT_EMAIL ?? '';

const FAQ = [
  { q: 'Como o Evura descobre o que pesa no meu caso?', a: 'Ele compara os seus próprios dias: por exemplo, dias em que você dormiu menos de 6 horas com dias em que dormiu mais. Só fala em sinal quando há dias suficientes dos dois lados, e diz o quanto confia.' },
  { q: 'Por que aparece "pouco dado"?', a: 'Porque ainda não há dias suficientes para comparar. Cada dia registrado ajuda. Em geral, com 5 dias de cada lado aparece o primeiro sinal.' },
  { q: 'O Evura faz diagnóstico ou indica remédio?', a: 'Não. Ele informa e mostra padrões nos seus dados. Diagnóstico, dose e tratamento são sempre com médico ou nutricionista.' },
  { q: 'Esqueci de registrar um dia. Perdi tudo?', a: 'Não. Dia sem registro não zera nada. O que conta é o conjunto.' },
  { q: 'Posso registrar algo de ontem?', a: 'Pela tela Progresso você vê cada dia. Registros de dias anteriores chegam na próxima versão.' },
  { q: 'Como cancelo?', a: 'Em Perfil, Plano e assinatura. Sem ligação e sem formulário longo.' },
  { q: 'Como apago meus dados?', a: 'Em Perfil, Privacidade e dados, Excluir minha conta e meus dados.' },
  { q: 'Os meus dados vão para anúncios?', a: 'Não. Dados de saúde não são vendidos, não vão para anúncios e não treinam IA.' },
];

export default function Ajuda() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<number | null>(null);
  const list = useMemo(() => FAQ.map((f, i) => ({ ...f, i })).filter((f) => !q || (f.q + f.a).toLowerCase().includes(q.toLowerCase())), [q]);
  return (
    <Screen back title="Ajuda e contato">
      <Card style={{ borderWidth: 2 }}>
        <T weight="semi">Em emergência, ligue 192 (SAMU).</T>
        <T v="small">Se você está em sofrimento e precisa conversar, o CVV atende de graça, 24 horas, pelo 188.</T>
        <View style={{ flexDirection: 'row', gap: space(2) }}>
          <View style={{ flex: 1 }}><Button small kind="secondary" label="Ligar 192" onPress={() => Linking.openURL('tel:192')} /></View>
          <View style={{ flex: 1 }}><Button small kind="secondary" label="Ligar 188" onPress={() => Linking.openURL('tel:188')} /></View>
        </View>
      </Card>
      <Field label="Buscar nas perguntas" value={q} onChangeText={setQ} placeholder="Ex.: cancelar" />
      <Group>
        {list.length === 0 ? <View style={{ padding: space(4) }}><T tone="mut">Nada encontrado. Fale com a equipe abaixo.</T></View> : list.map((f) => (
          <View key={f.i} style={{ padding: space(4), gap: space(2) }}>
            <T weight="semi" accessibilityRole="button" accessibilityState={{ expanded: open === f.i }} onPress={() => setOpen(open === f.i ? null : f.i)}>{f.q}</T>
            {open === f.i ? <T v="small">{f.a}</T> : null}
          </View>
        ))}
      </Group>
      {SUPPORT ? (
        <Button kind="secondary" label="Falar com a equipe" onPress={() => Linking.openURL(`mailto:${SUPPORT}?subject=Ajuda%20no%20app`)} hint="Abre o seu e-mail" />
      ) : (
        <T v="small" tone="mut">O canal de contato com a equipe abre junto com o beta.</T>
      )}
    </Screen>
  );
}
