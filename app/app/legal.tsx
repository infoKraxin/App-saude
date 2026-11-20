import React from 'react';
import { Screen, T, Card } from '@/components/ui';

// Rascunho em linguagem simples. O texto final é escrito ou revisado por advogado antes do beta
// (plano, seção 11). Esta tela existe para o fluxo de consentimento já apontar para o lugar certo.
export default function Legal() {
  return (
    <Screen back title="Termos e privacidade">
      <Card tone="sunk"><T v="small" weight="semi">Versão preliminar. O texto final será publicado antes do lançamento.</T></Card>
      <T v="h3">O que o Evura é</T>
      <T>Um app de bem-estar e informação. Não faz diagnóstico, não prescreve e não substitui profissionais de saúde. É para maiores de 18 anos.</T>
      <T v="h3">Quais dados usamos</T>
      <T>O que você registra (refeições, água, sono, como se sente, sintomas, medidas, movimento e, se você ativar, ciclo e aplicações), seu perfil e suas preferências. Dados de saúde são dados sensíveis pela LGPD e só são tratados com o seu consentimento.</T>
      <T v="h3">Para que usamos</T>
      <T>Para gerar os seus relatórios. Se você permitir, um resumo sem nome e sem e-mail é enviado a um serviço de IA para escrever os textos. Não vendemos dados, não usamos dados de saúde em anúncios e não treinamos IA com eles.</T>
      <T v="h3">Seus direitos</T>
      <T>Ver, corrigir, exportar e excluir seus dados dentro do app, e retirar consentimentos a qualquer momento em Perfil, Privacidade e dados.</T>
      <T v="h3">Assinatura</T>
      <T>Teste grátis de 7 dias, sem cartão. Planos pagos podem ser cancelados a qualquer momento, com direito de arrependimento em 7 dias.</T>
    </Screen>
  );
}
