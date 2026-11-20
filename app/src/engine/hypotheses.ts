// Biblioteca fixa de hipóteses. Cada uma diz: quando X acontece, Y muda?
// `lag` = 0 compara no mesmo dia; 1 compara a exposição de hoje com a resposta de amanhã.
// `evidence` recebe ids de fichas revisadas (tabela evidence_cards). Fica vazio até a revisão
// clínica: sem ficha, o texto diz "observamos no seu caso, ainda sem estudo revisado no app".

import type { DaySummary } from './summary';

export type Hypothesis = {
  id: string;
  title: string; // pergunta em linguagem simples
  exposureLabel: string; // "dias com menos de 6 h de sono"
  controlLabel: string; // "dias com 6 h ou mais"
  outcomeLabel: string; // "fome"
  outcomeUnit: 'nivel' | 'nota' | 'presenca';
  outcomeMasc?: boolean; // concordância: "o inchaço ficou alto"
  lag: 0 | 1;
  expect: 'up' | 'down'; // direção que a hipótese espera na resposta
  exposure: (d: DaySummary) => boolean | null;
  outcome: (d: DaySummary) => number | null;
  needs: string; // o que falta registrar para testar
  tip: string; // ação pequena e opcional para testar amanhã
  evidence: string[];
};

const sym = (id: string) => (d: DaySummary) => (d.symptomLogged ? d.symptoms[id] ?? 0 : null);

export const HYPOTHESES: Hypothesis[] = [
  {
    id: 'sono_curto_fome', title: 'Dormir pouco aumenta a sua fome no dia seguinte?',
    exposureLabel: 'noites com menos de 6 h', controlLabel: 'noites com 6 h ou mais', outcomeLabel: 'fome',
    outcomeUnit: 'nivel', lag: 0, expect: 'up',
    exposure: (d) => (d.sleepH == null ? null : d.sleepH < 6), outcome: (d) => d.hunger,
    needs: 'sono e como você se sente', tip: 'Tente deitar 30 minutos mais cedo hoje e veja a fome amanhã.', evidence: [],
  },
  {
    id: 'sono_curto_energia', title: 'Dormir pouco derruba a sua energia?',
    exposureLabel: 'noites com menos de 6 h', controlLabel: 'noites com 6 h ou mais', outcomeLabel: 'energia',
    outcomeUnit: 'nivel', lag: 0, expect: 'down',
    exposure: (d) => (d.sleepH == null ? null : d.sleepH < 6), outcome: (d) => d.energy,
    needs: 'sono e como você se sente', tip: 'Tente deitar 30 minutos mais cedo hoje.', evidence: [],
  },
  {
    id: 'proteina_baixa_fome', title: 'Pouca proteína deixa você com mais fome?',
    exposureLabel: 'dias com proteína em menos de 2 refeições', controlLabel: 'dias com proteína em 2 ou mais', outcomeLabel: 'fome',
    outcomeUnit: 'nivel', lag: 0, expect: 'up',
    exposure: (d) => (d.proteinMeals == null ? null : d.proteinMeals < 2), outcome: (d) => d.hunger,
    needs: 'refeições e como você se sente', tip: 'Inclua uma fonte de proteína no café da manhã amanhã.', evidence: [],
  },
  {
    id: 'proteina_baixa_energia', title: 'Pouca proteína pesa na sua energia?',
    exposureLabel: 'dias com proteína em menos de 2 refeições', controlLabel: 'dias com proteína em 2 ou mais', outcomeLabel: 'energia',
    outcomeUnit: 'nivel', lag: 0, expect: 'down',
    exposure: (d) => (d.proteinMeals == null ? null : d.proteinMeals < 2), outcome: (d) => d.energy,
    needs: 'refeições e como você se sente', tip: 'Inclua proteína em mais uma refeição amanhã.', evidence: [],
  },
  {
    id: 'estresse_fome', title: 'Dias tensos aumentam a sua fome?',
    exposureLabel: 'dias de estresse alto', controlLabel: 'dias de estresse baixo ou médio', outcomeLabel: 'fome',
    outcomeUnit: 'nivel', lag: 0, expect: 'up',
    exposure: (d) => (d.stress == null ? null : d.stress >= 2.5), outcome: (d) => d.hunger,
    needs: 'como você se sente', tip: 'Antes de comer fora de hora, faça uma pausa de 2 minutos e veja se a fome continua.', evidence: [],
  },
  {
    id: 'cafeina_tarde_sono', title: 'Cafeína depois das 16 h piora o seu sono?',
    exposureLabel: 'dias com cafeína depois das 16 h', controlLabel: 'dias sem', outcomeLabel: 'qualidade do sono',
    outcomeUnit: 'nota', lag: 1, expect: 'down',
    exposure: (d) => d.caffeineLate, outcome: (d) => d.sleepQ,
    needs: 'a noite (cafeína e telas) e o sono', tip: 'Troque o café da tarde por uma opção sem cafeína hoje.', evidence: [],
  },
  {
    id: 'tela_noite_sono', title: 'Tela na cama piora o seu sono?',
    exposureLabel: 'noites com tela até dormir', controlLabel: 'noites sem', outcomeLabel: 'qualidade do sono',
    outcomeUnit: 'nota', lag: 1, expect: 'down',
    exposure: (d) => d.screenLate, outcome: (d) => d.sleepQ,
    needs: 'a noite (cafeína e telas) e o sono', tip: 'Deixe o celular fora do alcance 30 minutos antes de deitar.', evidence: [],
  },
  {
    id: 'alcool_sono', title: 'Álcool à noite piora o seu sono?',
    exposureLabel: 'dias com bebida alcoólica', controlLabel: 'dias sem', outcomeLabel: 'qualidade do sono',
    outcomeUnit: 'nota', lag: 1, expect: 'down',
    exposure: (d) => d.alcohol, outcome: (d) => d.sleepQ,
    needs: 'refeições e sono', tip: 'Se beber, tente parar 3 horas antes de deitar.', evidence: [],
  },
  {
    id: 'movimento_sono', title: 'Se movimentar melhora o seu sono?',
    exposureLabel: 'dias sem movimento', controlLabel: 'dias com movimento', outcomeLabel: 'qualidade do sono',
    outcomeUnit: 'nota', lag: 1, expect: 'down',
    exposure: (d) => (d.move == null ? null : d.move === 0), outcome: (d) => d.sleepQ,
    needs: 'movimento e sono', tip: 'Uma caminhada de 15 minutos hoje já conta.', evidence: [],
  },
  {
    id: 'movimento_energia', title: 'Se movimentar aumenta a sua energia?',
    exposureLabel: 'dias com movimento moderado ou intenso', controlLabel: 'dias com pouco ou nenhum', outcomeLabel: 'energia',
    outcomeUnit: 'nivel', lag: 0, expect: 'up',
    exposure: (d) => (d.move == null ? null : d.move >= 2), outcome: (d) => d.energy,
    needs: 'movimento e como você se sente', tip: 'Tente 10 minutos de movimento antes do almoço.', evidence: [],
  },
  {
    id: 'ultra_energia', title: 'Ultraprocessados derrubam a sua energia?',
    exposureLabel: 'dias com 2 ou mais refeições ultraprocessadas', controlLabel: 'dias com menos', outcomeLabel: 'energia',
    outcomeUnit: 'nivel', lag: 0, expect: 'down',
    exposure: (d) => (d.ultraMeals == null ? null : d.ultraMeals >= 2), outcome: (d) => d.energy,
    needs: 'refeições e como você se sente', tip: 'Troque um lanche pronto por uma fruta com castanhas.', evidence: [],
  },
  {
    id: 'ultra_inchaco', title: 'Ultraprocessados aumentam o seu inchaço?',
    exposureLabel: 'dias com 2 ou mais refeições ultraprocessadas', controlLabel: 'dias com menos', outcomeLabel: 'inchaço',
    outcomeUnit: 'nivel', outcomeMasc: true, lag: 0, expect: 'up',
    exposure: (d) => (d.ultraMeals == null ? null : d.ultraMeals >= 2), outcome: sym('inchaco'),
    needs: 'refeições e sintomas', tip: 'Troque um lanche pronto por comida de verdade amanhã.', evidence: [],
  },
  {
    id: 'agua_baixa_inchaco', title: 'Pouca água aumenta o seu inchaço?',
    exposureLabel: 'dias com menos de 1,5 L', controlLabel: 'dias com 1,5 L ou mais', outcomeLabel: 'inchaço',
    outcomeUnit: 'nivel', outcomeMasc: true, lag: 0, expect: 'up',
    exposure: (d) => (d.waterMl == null ? null : d.waterMl < 1500), outcome: sym('inchaco'),
    needs: 'água e sintomas', tip: 'Deixe uma garrafa à vista e beba um copo a cada refeição.', evidence: [],
  },
  {
    id: 'estresse_inchaco', title: 'Dias tensos mexem com o seu intestino?',
    exposureLabel: 'dias de estresse alto', controlLabel: 'dias de estresse baixo ou médio', outcomeLabel: 'inchaço',
    outcomeUnit: 'nivel', outcomeMasc: true, lag: 0, expect: 'up',
    exposure: (d) => (d.stress == null ? null : d.stress >= 2.5), outcome: sym('inchaco'),
    needs: 'como você se sente e sintomas', tip: 'Tente comer devagar e sem tela em uma refeição amanhã.', evidence: [],
  },
  {
    id: 'agua_baixa_nausea_cane', title: 'Pouca água piora a sua náusea?',
    exposureLabel: 'dias com menos de 1,5 L', controlLabel: 'dias com 1,5 L ou mais', outcomeLabel: 'náusea',
    outcomeUnit: 'nivel', lag: 0, expect: 'up',
    exposure: (d) => (d.waterMl == null ? null : d.waterMl < 1500), outcome: sym('nausea'),
    needs: 'água e sintomas', tip: 'Beba em goles pequenos ao longo do dia.', evidence: [],
  },
  {
    id: 'pos_aplicacao_nausea', title: 'A náusea aumenta no dia da aplicação?',
    exposureLabel: 'dias de aplicação', controlLabel: 'outros dias', outcomeLabel: 'náusea',
    outcomeUnit: 'nivel', lag: 0, expect: 'up',
    exposure: (d) => (d.logged ? d.med : null), outcome: sym('nausea'),
    needs: 'aplicações e sintomas', tip: 'Prefira refeições menores no dia da aplicação e fale com quem prescreveu se a náusea for forte.', evidence: [],
  },
];

export const hypothesisById = (id: string) => HYPOTHESES.find((h) => h.id === id);
