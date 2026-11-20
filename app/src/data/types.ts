import type { AreaId } from './areas';

export type Level3 = 1 | 2 | 3; // baixo, médio, alto

export type LogBase = {
  id: string; // gerado no aparelho
  day: string; // AAAA-MM-DD no fuso da pessoa
  at: string; // ISO do momento do registro
  updatedAt: string;
  deleted?: boolean;
  synced?: boolean;
  source: 'manual' | 'health_connect' | 'foto';
};

export type WaterLog = LogBase & { kind: 'water'; ml: number };
export type MealSlot = 'cafe' | 'almoco' | 'lanche' | 'jantar' | 'ceia';
export type MealLog = LogBase & {
  kind: 'meal';
  slot: MealSlot;
  text: string;
  protein: boolean;
  fiber: boolean;
  ultra: boolean; // ultraprocessado
  alcohol: boolean;
};
export type SleepLog = LogBase & {
  kind: 'sleep'; // a noite que terminou no `day`
  bed: string; // HH:MM
  wake: string; // HH:MM
  quality: 1 | 2 | 3 | 4 | 5;
};
export type EveningLog = LogBase & { kind: 'evening'; caffeineLate: boolean; screenLate: boolean };
export type FeelLog = LogBase & { kind: 'feel'; energy: Level3; hunger: Level3; mood: Level3; stress: Level3 };
export type SymptomLog = LogBase & { kind: 'symptom'; items: { id: string; level: Level3 }[] };
export type MeasureLog = LogBase & { kind: 'measure'; weightKg?: number; waistCm?: number };
export type MoveLog = LogBase & { kind: 'move'; level: 0 | 1 | 2 | 3; minutes?: number };
export type MedLog = LogBase & { kind: 'med'; name: string; doseText: string; site?: string };
export type CycleLog = LogBase & { kind: 'cycle'; phase: 'menstrual' | 'folicular' | 'ovulatoria' | 'lutea' | 'nao_sei' };

export type Log = WaterLog | MealLog | SleepLog | EveningLog | FeelLog | SymptomLog | MeasureLog | MoveLog | MedLog | CycleLog;
export type LogKind = Log['kind'];

export type Consents = {
  health?: string; // data ISO do aceite; ausente = não aceito
  ai?: string;
  community?: string;
  analytics?: string;
  marketing?: string;
};

export type Profile = {
  name: string;
  email?: string;
  area: AreaId;
  extraAreas: AreaId[];
  motive: string;
  eventName?: string;
  eventDate?: string; // AAAA-MM-DD
  birthYear?: number;
  sex?: 'f' | 'm' | 'na';
  heightCm?: number;
  startWeightKg?: number;
  goalWeightKg?: number;
  safety: { pregnant: boolean; breastfeeding: boolean; eatingDisorder: boolean };
  hypotheses: string[];
  trialStart?: string; // AAAA-MM-DD
  fromQuiz?: boolean;
  onboarded: boolean;
  consents: Consents;
  cycleTracking: boolean;
  usesPen: boolean;
};

export type Prefs = {
  theme: 'system' | 'light' | 'dark';
  textScale: 1 | 1.15 | 1.3;
  reduceMotion: 'system' | 'on' | 'off';
  hideWeight: boolean;
  hideCalories: boolean;
  hideProjection: boolean;
  mascot: boolean;
  simpleLanguage: boolean;
  haptics: boolean;
  units: 'metric' | 'imperial';
  waterGoalMl: number;
  notif: {
    logs: boolean;
    water: boolean;
    report: boolean;
    med: boolean;
    community: boolean;
    marketing: boolean;
    reminderTime: string; // HH:MM
    quietFrom: string;
    quietTo: string;
    maxPerDay: number;
    pausedUntil?: string;
  };
  lockApp: boolean;
};

export type AppState = {
  version: 1;
  profile: Profile | null;
  prefs: Prefs;
  logs: Log[];
  favorites: { text: string; slot: MealSlot; protein: boolean; fiber: boolean; ultra: boolean; alcohol: boolean }[];
  feedback: { findingId: string; day: string; useful: boolean }[];
};
