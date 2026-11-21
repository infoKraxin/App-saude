// Biblioteca de "Aulas do dia" (Coach) e saudação contextual por dia/horário.
// Conteúdo 100% original do Evura, educativo, sem diagnóstico nem promessas sem fonte.
import type { AreaId } from './areas';
import type { FamilyName } from '../theme/tokens';

export type Lesson = {
  id: string;
  areas: AreaId[];
  family: FamilyName;
  durationMin: number;
  category: string;
  title: string;
  subtitle: string;
  steps: { heading: string; body: string }[];
  diagram: { title: string; nodes: { label: string; note: string }[] };
  takeaway: string;
};

export function contextualCoachHeader(name?: string): { eyebrow: string; headline: string } {
  const now = new Date();
  const h = now.getHours();
  const day = now.getDay(); // 0 dom, 5 sex, 6 sab
  const n = name?.trim() ? `, ${name.trim()}` : '';

  if (day === 5 && h >= 12) {
    return { eyebrow: 'Sexta-feira · Coach', headline: `O fim de semana está chegando${n}` };
  }
  if (day === 0 || day === 6) {
    return { eyebrow: 'Fim de semana · Coach', headline: `Ritmo leve sem perder o fio${n}` };
  }
  if (h < 11) {
    return { eyebrow: 'Manhã · Coach', headline: `Dormiu bem${n}?` };
  }
  if (h < 17) {
    return { eyebrow: 'Tarde · Coach', headline: `Como está a sua energia${n}?` };
  }
  return { eyebrow: 'Noite · Coach', headline: `Hora de desacelerar${n}` };
}

export const LESSONS: Lesson[] = [
  {
    id: 'long-pilares',
    areas: ['long', 'ener', 'mass'],
    family: 'seaweed',
    durationMin: 3,
    category: 'Longevidade',
    title: 'Os 4 pilares silenciosos da longevidade',
    subtitle: 'Por que constância vence intensidade quando o objetivo é viver bem por mais tempo.',
    steps: [
      {
        heading: 'Saúde não é um sprint',
        body: 'Envelhecer com autonomia depende mais do que você repete em 80% dos dias do que de semanas perfeitas seguidas de abandono.',
      },
      {
        heading: 'Tudo conversa entre si',
        body: 'Dormir mal aumenta a busca por energia rápida no dia seguinte; pouco movimento reduz a qualidade do sono profundo. Registrar juntos mostra onde mexer primeiro.',
      },
    ],
    diagram: {
      title: 'Ciclo de proteção da longevidade',
      nodes: [
        { label: '1. Sono reparador', note: 'Regula hormônios, memória e recuperação.' },
        { label: '2. Força e movimento', note: 'Preserva massa muscular e metabolismo.' },
        { label: '3. Comida de verdade', note: 'Proteína e fibras sustentam saciedade e intestino.' },
        { label: '4. Gestão do estresse', note: 'Reduz desgaste silencioso no dia a dia.' },
      ],
    },
    takeaway: 'Escolha apenas 1 hábito âncora para repetir nos próximos 7 dias.',
  },
  {
    id: 'habito-ciclo',
    areas: ['emag', 'cane', 'long', 'ener'],
    family: 'campfire',
    durationMin: 2,
    category: 'Ciências comportamentais',
    title: 'O ciclo do hábito: gatilho, rotina e recompensa',
    subtitle: 'Entender por que você belisca ou pula um registro tira a culpa e devolve o controle.',
    steps: [
      {
        heading: 'Não é falta de força de vontade',
        body: 'Seu cérebro automatiza respostas para economizar energia. Quando você sente cansaço ou tédio às 16h, ele pede uma recompensa imediata.',
      },
      {
        heading: 'Mude o ambiente antes de lutar contra ele',
        body: 'Deixar água visível na mesa ou registrar logo após a refeição reduz o atrito e cria um novo gatilho automático.',
      },
    ],
    diagram: {
      title: 'Como um hábito se fixa',
      nodes: [
        { label: 'Gatilho', note: 'Horário, lugar ou emoção que dispara a ação.' },
        { label: 'Rotina', note: 'A ação em si (ex.: registrar em 30 segundos).' },
        { label: 'Recompensa', note: 'Sensação de clareza e sequência mantida.' },
      ],
    },
    takeaway: 'Anexe seu registro do Evura a algo que você já faz todo dia (como o café da manhã).',
  },
  {
    id: 'sono-cafeina',
    areas: ['sono', 'ener', 'horm', 'long'],
    family: 'aubergine',
    durationMin: 3,
    category: 'Sono',
    title: 'A janela invisível da cafeína e da luz',
    subtitle: 'Como pequenas escolhas à tarde mudam a profundidade do seu sono à noite.',
    steps: [
      {
        heading: 'Meia-vida longa',
        body: 'A cafeína pode permanecer ativa por horas. Mesmo quem adormece rápido após café tardio costuma ter sono mais raso.',
      },
      {
        heading: 'Luz de manhã, penumbra à noite',
        body: 'Exposição à luz natural cedo ajuda o relógio biológico a liberar melatonina na hora certa à noite.',
      },
    ],
    diagram: {
      title: 'Linha do tempo do descanso',
      nodes: [
        { label: 'Manhã', note: 'Luz natural nos primeiros 30 min ao acordar.' },
        { label: '16h', note: 'Ponto de corte experimental para cafeína.' },
        { label: '30 min antes', note: 'Reduzir brilho de telas e desacelerar.' },
      ],
    },
    takeaway: 'Teste marcar “Minha noite” por 5 dias para ver se cafeína após 16h mexe com seu descanso.',
  },
  {
    id: 'nutri-saciedade',
    areas: ['emag', 'cane', 'intes', 'mass', 'long'],
    family: 'broccoli',
    durationMin: 3,
    category: 'Nutrição prática',
    title: 'Proteína e fibras: a dupla da saciedade estável',
    subtitle: 'Por que montar o prato pensando em equilíbrio evita picos de fome à tarde.',
    steps: [
      {
        heading: 'Sem precisar pesar tudo',
        body: 'Observar se cada refeição principal tem uma fonte de proteína e fibras já explica boa parte da sua curva de fome e energia.',
      },
      {
        heading: 'Atenção redobrada em GLP-1 e massa',
        body: 'Quando o apetite está menor, priorizar proteína e movimento ajuda a preservar massa magra.',
      },
    ],
    diagram: {
      title: 'Efeito no seu dia',
      nodes: [
        { label: 'Proteína', note: 'Sustenta saciedade e preserva músculo.' },
        { label: 'Fibras', note: 'Apoiam o intestino e liberam energia devagar.' },
        { label: 'Água', note: 'Evita confundir sede leve com fome.' },
      ],
    },
    takeaway: 'No próximo registro de refeição, observe apenas se havia proteína e fibras no prato.',
  },
];

export function lessonsForArea(area?: AreaId): Lesson[] {
  if (!area) return LESSONS;
  const matching = LESSONS.filter((l) => l.areas.includes(area));
  const rest = LESSONS.filter((l) => !l.areas.includes(area));
  return [...matching, ...rest];
}
