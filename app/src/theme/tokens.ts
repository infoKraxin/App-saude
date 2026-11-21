// Tokens do Evura com sistema visual inspirado no Foodvisor 7.8.1:
// texto azul-ardósia em 3 níveis (#233345, #405167, #95A6BD), famílias de 4 tons
// (base, light, bg, ul), cartões flat com borda 1dp, Fraunces (serifa) + Hanken Grotesk (sans).

export type ColorFamily = {
  base: string;
  light: string;
  bg: string;
  ul: string;
};

export type FamilyName = 'seaweed' | 'sky' | 'campfire' | 'broccoli' | 'sunshine' | 'aubergine' | 'salmon' | 'sand';

export const families: Record<FamilyName, ColorFamily> = {
  seaweed: { base: '#10A37F', light: '#B9E8DA', bg: '#DCF5EC', ul: '#EFFBF7' },
  sky: { base: '#2B95D6', light: '#BBDDF3', bg: '#E1F1FB', ul: '#F2F8FD' },
  campfire: { base: '#E8833A', light: '#F8D3B5', bg: '#FCE9DA', ul: '#FEF6F0' },
  broccoli: { base: '#4FA95A', light: '#C4E6C8', bg: '#E3F4E5', ul: '#F3FAF4' },
  sunshine: { base: '#D9A11E', light: '#F4DF9E', bg: '#FBF2D4', ul: '#FEFBF0' },
  aubergine: { base: '#7C5CBF', light: '#D5C8EE', bg: '#ECE6F8', ul: '#F7F4FC' },
  salmon: { base: '#E56B6F', light: '#F6C8C9', bg: '#FCE4E5', ul: '#FEF4F4' },
  sand: { base: '#C79A5B', light: '#EBD9BE', bg: '#F6ECDC', ul: '#FCF8F2' },
};

export type Palette = {
  bg: string; // fundo da tela
  card: string; // superfícies flat
  sunk: string; // campos, trilhas
  ink: string; // texto principal (azul-ardósia escuro #233345)
  mut: string; // texto secundário (azul-ardósia médio #405167)
  mutLight: string; // texto terciário (azul-ardósia claro #95A6BD)
  line: string; // bordas finas 1dp
  brand: string; // cor primária de ação
  onBrand: string; // texto sobre brand
  amber: string; // chama da sequência, anel do dia, marcos
  amberInk: string; // âmbar legível como texto
  water: string;
  good: string;
  warn: string;
  crit: string;
  focus: string;
  overlay: string;
  peach: string; // cartões de dica / coach
  peachTag: string;
};

export const light: Palette = {
  bg: '#F7F9FB',
  card: '#FFFFFF',
  sunk: '#EDF1F5',
  ink: '#233345',
  mut: '#405167',
  mutLight: '#95A6BD',
  line: '#DCE4EE',
  brand: '#233345',
  onBrand: '#FFFFFF',
  amber: '#FF9A1F',
  amberInk: '#9A4E00',
  water: '#2B95D6',
  good: '#10A37F',
  warn: '#B86B00',
  crit: '#C43832',
  focus: '#2B95D6',
  overlay: 'rgba(35,51,69,0.48)',
  peach: '#FEF6F0',
  peachTag: '#E8833A',
};

export const dark: Palette = {
  bg: '#0E1720',
  card: '#162330',
  sunk: '#1E2F40',
  ink: '#EEF3F8',
  mut: '#A8B8CC',
  mutLight: '#73869E',
  line: '#283B4E',
  brand: '#5AD4B5',
  onBrand: '#0A221C',
  amber: '#FFB24D',
  amberInk: '#FFC980',
  water: '#6CC3F0',
  good: '#5AD4B5',
  warn: '#F2C46B',
  crit: '#FF8A80',
  focus: '#7CC0F5',
  overlay: 'rgba(0,0,0,0.65)',
  peach: '#2D2118',
  peachTag: '#E8833A',
};

export const font = {
  serif: 'Fraunces_600SemiBold', // títulos de impacto e números de conquista
  display: 'BricolageGrotesque_700Bold', // números grandes / KPIs
  displayMed: 'BricolageGrotesque_600SemiBold',
  body: 'HankenGrotesk_400Regular',
  bodyMed: 'HankenGrotesk_500Medium',
  bodySemi: 'HankenGrotesk_600SemiBold',
  dyslexic: 'HankenGrotesk_500Medium',
};

// Escala tipográfica (padrão Foodvisor adaptado ao Evura)
export const type = {
  hero: 44,
  h1: 28,
  h2: 22,
  h3: 18,
  body: 16,
  small: 14,
  micro: 12.5,
};

export const space = (n: number) => n * 4;
// Raios Foodvisor: 8 (tag), 16 (card), 24 (largeCard/preço), 32 (sheet), 999 (pílula)
export const radius = {
  tag: 8,
  field: 14,
  card: 16,
  largeCard: 24,
  sheet: 32,
  chip: 999,
};
export const hit = 48; // alvo mínimo de toque (dp)
