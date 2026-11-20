// Ilustrações do Evura (geradas pelo Codex com design/ESTILO.md). `bg` é a cor do fundo da
// imagem, usada para estender a faixa colorida até as bordas da tela sem emenda.
import type { ImageSourcePropType } from 'react-native';
import type { LogKind } from '../data/types';
import type { AreaId } from '../data/areas';

type I = { src: ImageSourcePropType; bg: string; ratio: number };

export const ILLUS = {
  'icone-agua': { src: require('../../assets/ilustracoes/icone-agua.webp'), bg: '#FDF1E5', ratio: 1 },
  'icone-refeicao': { src: require('../../assets/ilustracoes/icone-refeicao.webp'), bg: '#FDF2E1', ratio: 1 },
  'icone-sono': { src: require('../../assets/ilustracoes/icone-sono.webp'), bg: '#FDF2E3', ratio: 1 },
  'icone-sentir': { src: require('../../assets/ilustracoes/icone-sentir.webp'), bg: '#FDF2E3', ratio: 1 },
  'icone-movimento': { src: require('../../assets/ilustracoes/icone-movimento.webp'), bg: '#FDF2E3', ratio: 1 },
  'icone-sintomas': { src: require('../../assets/ilustracoes/icone-sintomas.webp'), bg: '#FEF3E4', ratio: 1 },
  'icone-noite': { src: require('../../assets/ilustracoes/icone-noite.webp'), bg: '#FDF2E1', ratio: 1 },
  'icone-medidas': { src: require('../../assets/ilustracoes/icone-medidas.webp'), bg: '#FFF1E3', ratio: 1 },
  'icone-aplicacao': { src: require('../../assets/ilustracoes/icone-aplicacao.webp'), bg: '#FEF3E4', ratio: 1 },
  'icone-ciclo': { src: require('../../assets/ilustracoes/icone-ciclo.webp'), bg: '#FFF2E4', ratio: 1 },
  'porta-emag': { src: require('../../assets/ilustracoes/porta-emag.webp'), bg: '#B1EBE3', ratio: 2 },
  'porta-cane': { src: require('../../assets/ilustracoes/porta-cane.webp'), bg: '#C5E2F1', ratio: 2 },
  'porta-intes': { src: require('../../assets/ilustracoes/porta-intes.webp'), bg: '#FFF1E1', ratio: 16 / 9 },
  'porta-horm': { src: require('../../assets/ilustracoes/porta-horm.webp'), bg: '#FFF1E1', ratio: 16 / 9 },
  'porta-sono': { src: require('../../assets/ilustracoes/porta-sono.webp'), bg: '#C2E2F0', ratio: 2 },
  'porta-ener': { src: require('../../assets/ilustracoes/porta-ener.webp'), bg: '#FDF2E3', ratio: 16 / 9 },
  'porta-mass': { src: require('../../assets/ilustracoes/porta-mass.webp'), bg: '#B1EEE3', ratio: 16 / 9 },
  'porta-long': { src: require('../../assets/ilustracoes/porta-long.webp'), bg: '#FFF2DF', ratio: 16 / 9 },
  'tela-relatorio': { src: require('../../assets/ilustracoes/tela-relatorio.webp'), bg: '#C5E2EF', ratio: 16 / 9 },
  'tela-descobertas': { src: require('../../assets/ilustracoes/tela-descobertas.webp'), bg: '#FDF1E5', ratio: 16 / 9 },
  'tela-comunidade': { src: require('../../assets/ilustracoes/tela-comunidade.webp'), bg: '#FDF2E1', ratio: 16 / 9 },
  'tela-privacidade': { src: require('../../assets/ilustracoes/tela-privacidade.webp'), bg: '#B2ECE4', ratio: 16 / 9 },
  'tela-notificacoes': { src: require('../../assets/ilustracoes/tela-notificacoes.webp'), bg: '#FFF1E1', ratio: 1024 / 683 },
  'tela-vazio': { src: require('../../assets/ilustracoes/tela-vazio.webp'), bg: '#FDF2E3', ratio: 16 / 9 },
  'cena-dezembro': { src: require('../../assets/ilustracoes/cena-dezembro.webp'), bg: '#FDF0E0', ratio: 1024 / 683 },
  'cena-sono': { src: require('../../assets/ilustracoes/cena-sono.webp'), bg: '#072F36', ratio: 1024 / 683 },
} satisfies Record<string, I>;

export type IllusName = keyof typeof ILLUS;

export const KIND_ICON: Record<LogKind, IllusName> = {
  water: 'icone-agua', meal: 'icone-refeicao', sleep: 'icone-sono', feel: 'icone-sentir', move: 'icone-movimento',
  symptom: 'icone-sintomas', evening: 'icone-noite', measure: 'icone-medidas', med: 'icone-aplicacao', cycle: 'icone-ciclo',
};

export const AREA_ILLUS: Record<AreaId, IllusName> = {
  emag: 'porta-emag', cane: 'porta-cane', intes: 'porta-intes', horm: 'porta-horm', sono: 'porta-sono', ener: 'porta-ener', mass: 'porta-mass', long: 'porta-long',
};
