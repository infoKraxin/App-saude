// As 8 portas, com os mesmos ids do quiz (AREAS em ../../app.js).
// `deep` marca as portas com profundidade total no lançamento (decisão 1, recomendação B).

export type AreaId = 'emag' | 'cane' | 'intes' | 'horm' | 'sono' | 'ener' | 'mass' | 'long';

export type Area = {
  id: AreaId;
  name: string;
  short: string;
  deep: boolean;
  symptoms: { id: string; label: string }[];
  defaultHypotheses: string[]; // ids em engine/hypotheses.ts
};

const common = [
  { id: 'cansaco', label: 'Cansaço' },
  { id: 'dor_cabeca', label: 'Dor de cabeça' },
  { id: 'inchaco', label: 'Inchaço' },
];

export const AREAS: Area[] = [
  {
    id: 'emag', name: 'Emagrecimento', short: 'A balança parou', deep: true,
    symptoms: [...common, { id: 'compulsao', label: 'Vontade forte de comer' }, { id: 'azia', label: 'Azia' }],
    defaultHypotheses: ['sono_curto_fome', 'proteina_baixa_fome', 'estresse_fome'],
  },
  {
    id: 'cane', name: 'Canetas', short: 'Uso ou vou usar', deep: true,
    symptoms: [
      { id: 'nausea', label: 'Náusea' }, { id: 'prisao', label: 'Intestino preso' },
      { id: 'refluxo', label: 'Refluxo' }, { id: 'cansaco', label: 'Cansaço' },
      { id: 'tontura', label: 'Tontura' }, { id: 'vomito', label: 'Vômito' },
    ],
    defaultHypotheses: ['agua_baixa_nausea_cane', 'proteina_baixa_energia', 'pos_aplicacao_nausea'],
  },
  {
    id: 'intes', name: 'Intestino', short: 'Inchaço e desconforto', deep: false,
    symptoms: [{ id: 'inchaco', label: 'Inchaço' }, { id: 'prisao', label: 'Intestino preso' }, { id: 'gases', label: 'Gases' }, { id: 'dor_barriga', label: 'Dor na barriga' }],
    defaultHypotheses: ['agua_baixa_inchaco', 'ultra_inchaco', 'estresse_inchaco'],
  },
  {
    id: 'horm', name: 'Saúde hormonal', short: 'Ciclo e energia', deep: false,
    symptoms: [...common, { id: 'colica', label: 'Cólica' }, { id: 'humor_baixo', label: 'Humor baixo' }],
    defaultHypotheses: ['sono_curto_energia', 'estresse_fome', 'movimento_energia'],
  },
  {
    id: 'sono', name: 'Sono', short: 'Acordo cansado', deep: false,
    symptoms: [{ id: 'cansaco', label: 'Cansaço' }, { id: 'dor_cabeca', label: 'Dor de cabeça' }, { id: 'acordou_noite', label: 'Acordei de madrugada' }],
    defaultHypotheses: ['cafeina_tarde_sono', 'tela_noite_sono', 'alcool_sono'],
  },
  {
    id: 'ener', name: 'Energia', short: 'A energia some', deep: false,
    symptoms: [...common, { id: 'sono_tarde', label: 'Sono depois do almoço' }],
    defaultHypotheses: ['sono_curto_energia', 'ultra_energia', 'movimento_energia'],
  },
  {
    id: 'mass', name: 'Ganho de massa', short: 'Treino e não evolui', deep: false,
    symptoms: [{ id: 'dor_muscular', label: 'Dor muscular' }, { id: 'cansaco', label: 'Cansaço' }],
    defaultHypotheses: ['proteina_baixa_energia', 'sono_curto_energia', 'movimento_sono'],
  },
  {
    id: 'long', name: 'Longevidade', short: 'Viver bem por mais tempo', deep: false,
    symptoms: [...common],
    defaultHypotheses: ['movimento_sono', 'alcool_sono', 'estresse_fome'],
  },
];

export const areaById = (id: AreaId | null | undefined) => AREAS.find((a) => a.id === id) ?? AREAS[0];

// Sintomas que viram alerta: o app orienta procurar atendimento e não mostra números.
export const ALARM_SYMPTOMS = new Set(['vomito', 'tontura']);
