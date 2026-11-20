// Tokens do Evura. Mesma identidade do quiz: verde-petróleo profundo, papel claro,
// âmbar como único calor (anel do dia e conquistas), Bricolage nos títulos, Hanken no texto.
// Contraste conferido: texto principal e secundário >= 4.5 nos dois temas.

export type Palette = {
  bg: string; // fundo da tela
  card: string; // superfícies
  sunk: string; // campos, trilhas
  ink: string; // texto principal
  mut: string; // texto secundário
  line: string; // bordas finas
  brand: string; // verde-petróleo: botões primários, abas ativas
  onBrand: string; // texto sobre brand
  amber: string; // anel do dia, marcos (forma, não texto)
  amberInk: string; // âmbar legível como texto
  water: string;
  good: string;
  warn: string;
  crit: string;
  focus: string;
  overlay: string;
};

export const light: Palette = {
  bg: '#F3F4F5',
  card: '#FFFFFF',
  sunk: '#E9ECED',
  ink: '#0E1517',
  mut: '#55625F',
  line: '#DDE2E3',
  brand: '#0B2A2E',
  onBrand: '#F3F7F6',
  amber: '#FF9A1F',
  amberInk: '#8F4A00',
  water: '#2C7F8C',
  good: '#1E7A4C',
  warn: '#8F5B00',
  crit: '#B3261E',
  focus: '#1F6FEB',
  overlay: 'rgba(11,42,46,0.45)',
};

export const dark: Palette = {
  bg: '#0A1416',
  card: '#112022',
  sunk: '#18292B',
  ink: '#ECF2F1',
  mut: '#A3B2B0',
  line: '#24373A',
  brand: '#7FD3CF',
  onBrand: '#062022',
  amber: '#FFB24D',
  amberInk: '#FFC57A',
  water: '#6CC3CF',
  good: '#6FD39C',
  warn: '#F2C46B',
  crit: '#FF8A80',
  focus: '#8AB4FF',
  overlay: 'rgba(0,0,0,0.6)',
};

export const font = {
  display: 'BricolageGrotesque_700Bold',
  displayMed: 'BricolageGrotesque_600SemiBold',
  body: 'HankenGrotesk_400Regular',
  bodyMed: 'HankenGrotesk_500Medium',
  bodySemi: 'HankenGrotesk_600SemiBold',
  dyslexic: 'HankenGrotesk_500Medium', // trocado por fonte própria quando a pessoa ativa (fase 1.1)
};

// Escala tipográfica (modular 1.2). O tamanho final é multiplicado pela preferência
// de texto do app e respeita a fonte do sistema (allowFontScaling fica ligado).
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
export const radius = { card: 20, field: 14, chip: 999, sheet: 28 };
export const hit = 48; // alvo mínimo de toque (dp)
