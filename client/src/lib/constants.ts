// 新しい定数値を定義する
// 選手ポジション
export enum Position {
  PITCHER = "投手",
  CATCHER = "捕手",
  INFIELD = "内野",
  OUTFIELD = "外野"
}

// レア度
export enum Rarity {
  N = "N",
  PN = "PN",
  R = "R",
  PR = "PR",
  SR = "SR",
  PSR = "PSR"
}

// 得意練習
export enum SpecialTraining {
  BATTING = "打撃",
  STRENGTH = "筋力",
  RUNNING = "走塁",
  ARM = "肩力",
  FIELDING = "守備",
  MENTAL = "メンタル",
  VELOCITY = "球速",
  CONTROL = "コントロール",
  STAMINA = "スタミナ",
  BREAKING = "変化球"
}

// イベントタイミング
export enum EventTiming {
  PRE = "前イベント",
  POST = "後イベント"
}

// Stat types
export interface PitchingStats {
  velocity: number;
  control: number;
  stamina: number;
  breaking: number;
}

export interface BattingStats {
  contact: number;
  power: number;
  speed: number;
  arm: number;
  fielding: number;
}

export interface Stats {
  pitching: PitchingStats;
  batting: BattingStats;
}

// Character type
export interface Character {
  id: number;
  name: string;
  position: Position;
  rarity: Rarity;
  level: number;
  awakening: number;
  rating: number;
  stats: Stats;
  owned: boolean;
  specialTrainings?: SpecialTraining[];
  eventTiming?: EventTiming;
}

// Deck type
export interface Deck {
  id: number;
  name: string;
  characters: number[];
}

// Combo effect type
export interface Combo {
  id: number;
  name: string;
  description: string;
  requiredCharacters: number[];
  effects: Record<string, number>;
}

// Stat color mapping
export const statColorMap = {
  velocity: {
    bg: "bg-red-100",
    text: "text-red-600"
  },
  control: {
    bg: "bg-blue-100",
    text: "text-blue-600"
  },
  stamina: {
    bg: "bg-green-100",
    text: "text-green-600"
  },
  breaking: {
    bg: "bg-purple-100",
    text: "text-purple-600"
  },
  contact: {
    bg: "bg-yellow-100",
    text: "text-yellow-600"
  },
  power: {
    bg: "bg-red-100",
    text: "text-red-600"
  },
  speed: {
    bg: "bg-blue-100",
    text: "text-blue-600"
  },
  arm: {
    bg: "bg-green-100",
    text: "text-green-600"
  },
  fielding: {
    bg: "bg-purple-100",
    text: "text-purple-600"
  }
};

// Japanese translations for stat names
export const statNames = {
  velocity: "球速",
  control: "制球",
  stamina: "スタミナ",
  breaking: "変化球",
  contact: "ミート",
  power: "パワー",
  speed: "走力",
  arm: "肩力",
  fielding: "守備"
};

// Level options
export const levelOptions = [
  { value: 1, label: "Lv.1" },
  { value: 2, label: "Lv.2" },
  { value: 3, label: "Lv.3" },
  { value: 4, label: "Lv.4" },
  { value: 5, label: "Lv.5" }
];

// Awakening options
export const awakeningOptions = [
  { value: 0, label: "覚醒なし" },
  { value: 1, label: "覚醒1" },
  { value: 2, label: "覚醒2" },
  { value: 3, label: "覚醒3" },
  { value: 4, label: "覚醒4" }
];

// Position options
export const positionOptions = [
  { value: Position.PITCHER, label: Position.PITCHER },
  { value: Position.CATCHER, label: Position.CATCHER },
  { value: Position.INFIELD, label: Position.INFIELD },
  { value: Position.OUTFIELD, label: Position.OUTFIELD }
];

// Rarity options
export const rarityOptions = [
  { value: Rarity.N, label: Rarity.N },
  { value: Rarity.PN, label: Rarity.PN },
  { value: Rarity.R, label: Rarity.R },
  { value: Rarity.PR, label: Rarity.PR },
  { value: Rarity.SR, label: Rarity.SR },
  { value: Rarity.PSR, label: Rarity.PSR }
];

// 得意練習オプション
export const specialTrainingOptions = [
  { value: SpecialTraining.BATTING, label: SpecialTraining.BATTING },
  { value: SpecialTraining.STRENGTH, label: SpecialTraining.STRENGTH },
  { value: SpecialTraining.RUNNING, label: SpecialTraining.RUNNING },
  { value: SpecialTraining.ARM, label: SpecialTraining.ARM },
  { value: SpecialTraining.FIELDING, label: SpecialTraining.FIELDING },
  { value: SpecialTraining.MENTAL, label: SpecialTraining.MENTAL },
  { value: SpecialTraining.VELOCITY, label: SpecialTraining.VELOCITY },
  { value: SpecialTraining.CONTROL, label: SpecialTraining.CONTROL },
  { value: SpecialTraining.STAMINA, label: SpecialTraining.STAMINA },
  { value: SpecialTraining.BREAKING, label: SpecialTraining.BREAKING }
];

// イベントタイミングオプション
export const eventTimingOptions = [
  { value: EventTiming.PRE, label: EventTiming.PRE },
  { value: EventTiming.POST, label: EventTiming.POST }
];

// Rarity color mapping
export const rarityColorMap = {
  [Rarity.N]: { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-300" },
  [Rarity.PN]: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-300" },
  [Rarity.R]: { bg: "bg-green-100", text: "text-green-800", border: "border-green-300" },
  [Rarity.PR]: { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300" },
  [Rarity.SR]: { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-300" },
  [Rarity.PSR]: { bg: "bg-red-100", text: "text-red-800", border: "border-red-300" }
};

// Maximum number of characters in a deck
export const MAX_DECK_SIZE = 6;
