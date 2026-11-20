import React from 'react';
import { Platform } from 'react-native';
import { Screen, T, Group, Row, Card } from '@/components/ui';

// Health Connect precisa de build próprio (módulo nativo) e da aprovação da Play.
// Até lá, a tela explica o que vai acontecer em vez de mostrar um botão que não funciona.
export default function Conexoes() {
  return (
    <Screen back title="Conexões">
      <T tone="mut">Conectar o app de saúde do celular preenche sono, passos e peso sem você digitar. O Evura só lê, nunca escreve.</T>
      <Group>
        <Row label={Platform.OS === 'ios' ? 'Apple Saúde' : 'Health Connect'} value="Em breve" desc="Sono, passos e peso" />
      </Group>
      <Card tone="sunk">
        <T v="small">Quando estiver disponível, você escolhe o que o Evura pode ler, vê a última sincronização e pode desconectar a qualquer momento, apagando o que veio de lá.</T>
      </Card>
    </Screen>
  );
}
