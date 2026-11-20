import React from 'react';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { Screen, T, Group, Row, Card } from '@/components/ui';
import { Evu } from '@/components/art';
import { ENGINE_VERSION } from '@/engine/report';

export default function Sobre() {
  const router = useRouter();
  return (
    <Screen back title="Sobre o Evura">
      <Evu mood="calm" size={72} />
      <T v="h2">O sistema de saúde que se adapta a você.</T>
      <T>O Evura junta o que você registra todos os dias, compara os seus próprios dias e mostra, em linguagem simples, o que parece pesar no seu caso. Cada afirmação diz quanto dado a sustenta.</T>
      <Card tone="sunk">
        <T v="small">O Evura é um app de bem-estar e informação. Não faz diagnóstico, não prescreve e não substitui médicos, nutricionistas ou outros profissionais de saúde.</T>
      </Card>
      <Group>
        <Row label="Termos e política de privacidade" onPress={() => router.push('/legal')} />
        <Row label="Versão" value={`${Constants.expoConfig?.version ?? '1.0.0'}, ${ENGINE_VERSION}`} />
        <Row label="Créditos" desc="Fontes Bricolage Grotesque e Hanken Grotesk (SIL Open Font License). Ícones Lucide (ISC)." />
      </Group>
    </Screen>
  );
}
