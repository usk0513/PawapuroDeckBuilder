// 新しい定数値を定義する
// キャラクター種別
export enum CharacterType {
  PITCHER = "投手",
  BATTER = "野手",
  PITCHER_BATTER = "投手・野手",
  GIRLFRIEND = "彼女",
  GIRLFRIEND_PITCHER = "投手・彼女",
  GIRLFRIEND_BATTER = "野手・彼女",
  PARTNER = "相棒"
}

// レア度
export enum Rarity {
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

// キャラクターの役割
export enum CharacterRole {
  GUARD = "ガード",
  BOUNCER = "バウンサー",
  RANGER = "レンジャー",
  SNIPER = "スナイパー"
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
  position: CharacterType;
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

// キャラ種別オプション
export const positionOptions = [
  { value: CharacterType.PITCHER, label: CharacterType.PITCHER },
  { value: CharacterType.BATTER, label: CharacterType.BATTER },
  { value: CharacterType.PITCHER_BATTER, label: CharacterType.PITCHER_BATTER },
  { value: CharacterType.GIRLFRIEND, label: CharacterType.GIRLFRIEND },
  { value: CharacterType.GIRLFRIEND_PITCHER, label: CharacterType.GIRLFRIEND_PITCHER },
  { value: CharacterType.GIRLFRIEND_BATTER, label: CharacterType.GIRLFRIEND_BATTER },
  { value: CharacterType.PARTNER, label: CharacterType.PARTNER }
];

// Rarity options
export const rarityOptions = [
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

// キャラクター役割オプション
export const characterRoleOptions = [
  { value: CharacterRole.GUARD, label: CharacterRole.GUARD },
  { value: CharacterRole.BOUNCER, label: CharacterRole.BOUNCER },
  { value: CharacterRole.RANGER, label: CharacterRole.RANGER },
  { value: CharacterRole.SNIPER, label: CharacterRole.SNIPER }
];

// Rarity color mapping
export const rarityColorMap = {
  [Rarity.SR]: { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-300" },
  [Rarity.PSR]: { bg: "bg-red-100", text: "text-red-800", border: "border-red-300" }
};

// Maximum number of characters in a deck
export const MAX_DECK_SIZE = 6;

// Lv35の固有ボーナスアイテム一覧
export const uniqueBonusItems = [
  { value: "万能パワドリンク", label: "万能パワドリンク" },
  { value: "アロマグッズ", label: "アロマグッズ" },
  { value: "Maxパワドリンク", label: "Maxパワドリンク" },
  { value: "ともだちスタンプ", label: "ともだちスタンプ" },
  { value: "サポーター", label: "サポーター" },
];
