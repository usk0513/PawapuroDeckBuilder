import { pgTable, text, serial, integer, boolean, json, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// キャラクターの種別
export enum CharacterType {
  PITCHER = "投手",
  BATTER = "野手",
  PITCHER_BATTER = "投手・野手",
  GIRLFRIEND = "彼女",
  GIRLFRIEND_PITCHER = "投手・彼女",
  GIRLFRIEND_BATTER = "野手・彼女",
  PARTNER = "相棒"
}

// Character rarity enum
export enum Rarity {
  SR = "SR",
  PSR = "PSR"
}

// 得意練習の種類
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

// イベント発生タイミング
export enum EventTiming {
  PRE = "前イベント",
  POST = "後イベント"
}

// ボーナス効果の種類
export enum BonusEffectType {
  INITIAL_RATING = "初期評価",
  TAG_BONUS = "タッグボーナス",
  KOTS_EVENT_BONUS = "コツイベボーナス",
  MATCH_EXPERIENCE_BONUS = "試合経験点ボーナス",
  TRAINING_RATE_UP = "得意練習率Up",
  TRAINING_EFFECT_UP = "練習効果Up",
  KOTS_EVENT_RATE_UP = "コツイベ率Up",
  MOTIVATION_EFFECT_UP = "やる気効果Up",
  TRAINING_STAMINA_CONSUMPTION_DOWN = "練習体力消費量Down",
  EVENT_STAMINA_RECOVERY_UP = "イベント体力回復量Up",
  EVENT_BONUS = "イベントボーナス",
  KOTS_LEVEL_BONUS = "コツレベボーナス",
  LIMIT_UP_MEET = "上限Up_ミート",
  LIMIT_UP_POWER = "上限Up_パワー",
  LIMIT_UP_SPEED = "上限Up_走力",
  LIMIT_UP_ARM = "上限Up_肩力",
  LIMIT_UP_FIELDING = "上限Up_守備",
  LIMIT_UP_CATCHING = "上限Up_捕球",
  LIMIT_UP_VELOCITY = "上限Up_球速",
  LIMIT_UP_CONTROL = "上限Up_コントロール",
  LIMIT_UP_STAMINA = "上限Up_スタミナ",
  BASE_BONUS_STRENGTH = "基礎ボーナス_筋力",
  BASE_BONUS_AGILITY = "基礎ボーナス_敏捷",
  BASE_BONUS_TECHNIQUE = "基礎ボーナス_技術",
  BASE_BONUS_CHANGE = "基礎ボーナス_変化",
  BASE_BONUS_MENTAL = "基礎ボーナス_精神",
  REFORM_STRENGTH_AGILITY = "筋力練習改革_敏捷",
  REFORM_RUNNING_MENTAL = "走塁練習改革_精神",
  REFORM_CONTROL_CHANGE = "コントロール練習改革_変化",
  REFORM_STAMINA_CHANGE = "スタミナ練習改革_変化",
  // 新しい基礎コツボーナス
  BASE_KOTS_MEET = "基礎コツ_ミート",
  BASE_KOTS_POWER = "基礎コツ_パワー",
  BASE_KOTS_SPEED = "基礎コツ_走力",
  BASE_KOTS_ARM = "基礎コツ_肩力",
  BASE_KOTS_FIELDING = "基礎コツ_守備",
  BASE_KOTS_CATCHING = "基礎コツ_捕球",
  BASE_KOTS_VELOCITY = "基礎コツ_球速",
  BASE_KOTS_CONTROL = "基礎コツ_コントロール",
  BASE_KOTS_STAMINA = "基礎コツ_スタミナ",
  // サポートデッキ専用効果
  MAX_AWAKENINGS = "開眼最大回数",
  EXPERIENCE_POINT_CAP_UP = "獲得経験点上限アップ",
  // Lv35専用の固有アイテム効果
  UNIQUE_ITEM = "固有アイテム"
}

// 選手育成時のタイプ（投手・野手）
export enum PlayerType {
  PITCHER = "投手",
  BATTER = "野手"
}

// 金特殊能力の選択肢タイプ
export enum SpecialAbilityChoiceType {
  TYPE_A = "Aルート",
  TYPE_B = "Bルート",
  TYPE_C = "Cルート"
}

// キャラクターレベルごとのボーナス効果スキーマ
export const LevelBonusSchema = z.object({
  level: z.number().min(1).max(50),
  effectType: z.nativeEnum(BonusEffectType),
  value: z.string(), // 効果の値（例: "40%", "2", "55(SR),60(PSR)"）
  description: z.string().optional(),
});

export type LevelBonus = z.infer<typeof LevelBonusSchema>;

// 覚醒ボーナス効果スキーマ (Lv10まで開放時の効果)
export const AwakeningBonusSchema = z.object({
  awakeningType: z.enum(["initial", "second"]), // initial=初回覚醒, second=2回目覚醒(PSRのみ)
  effectType: z.nativeEnum(BonusEffectType),
  value: z.string(), // 効果の値
  description: z.string().optional(),
});

export type AwakeningBonus = z.infer<typeof AwakeningBonusSchema>;

// Character stats schema
export const StatSchema = z.object({
  pitching: z.object({
    velocity: z.number().default(0),
    control: z.number().default(0),
    stamina: z.number().default(0),
    breaking: z.number().default(0),
  }),
  batting: z.object({
    contact: z.number().default(0),
    power: z.number().default(0),
    speed: z.number().default(0),
    arm: z.number().default(0),
    fielding: z.number().default(0),
  })
});

export type Stat = z.infer<typeof StatSchema>;

// Users schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Character schema - イベントキャラクターのマスターデータ
export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  position: text("position").notNull().$type<CharacterType>(),
  rating: integer("rating").notNull().default(3),
  stats: json("stats").notNull().$type<Stat>(),
  specialTrainings: json("specialTrainings").$type<SpecialTraining[]>().default([]),
  eventTiming: text("event_timing").$type<EventTiming>(),
  canAwaken: boolean("can_awaken").notNull().default(true),
});

export const insertCharacterSchema = createInsertSchema(characters).omit({
  id: true
});

export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type Character = typeof characters.$inferSelect;

// OwnedCharacter schema - ユーザーが所持しているキャラクター
export const ownedCharacters = pgTable("owned_characters", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  characterId: integer("character_id").references(() => characters.id).notNull(),
  level: integer("level").notNull().default(1),
  awakening: integer("awakening").notNull().default(0),
  rarity: text("rarity").notNull().$type<Rarity>().default(Rarity.SR),
});

export const insertOwnedCharacterSchema = createInsertSchema(ownedCharacters).omit({
  id: true
});

export type InsertOwnedCharacter = z.infer<typeof insertOwnedCharacterSchema>;
export type OwnedCharacter = typeof ownedCharacters.$inferSelect;

// Deck schema
export const decks = pgTable("decks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  characters: json("characters").notNull().$type<number[]>(),
  userId: integer("user_id").references(() => users.id),
});

export const insertDeckSchema = createInsertSchema(decks).omit({
  id: true
});

export type InsertDeck = z.infer<typeof insertDeckSchema>;
export type Deck = typeof decks.$inferSelect;

// Combo schema (for preset combinations)
export const combos = pgTable("combos", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  requiredCharacters: json("requiredCharacters").notNull().$type<number[]>(),
  effects: json("effects").notNull().$type<Record<string, number>>(),
});

export const insertComboSchema = createInsertSchema(combos).omit({
  id: true
});

export type InsertCombo = z.infer<typeof insertComboSchema>;
export type Combo = typeof combos.$inferSelect;

// Define junction tables
export const deckCharacters = pgTable('deck_characters', {
  deckId: integer('deck_id').notNull().references(() => decks.id),
  characterId: integer('character_id').notNull().references(() => characters.id),
}, (t) => ({
  pk: primaryKey(t.deckId, t.characterId),
}));

export const comboCharacters = pgTable('combo_characters', {
  comboId: integer('combo_id').notNull().references(() => combos.id),
  characterId: integer('character_id').notNull().references(() => characters.id),
}, (t) => ({
  pk: primaryKey(t.comboId, t.characterId),
}));

// Relations
// 全テーブルのリレーションは最後にまとめて定義することとし、ここでは省略

// キャラクターのレベル別ボーナス効果テーブル
export const characterLevelBonuses = pgTable("character_level_bonuses", {
  id: serial("id").primaryKey(),
  characterId: integer("character_id").references(() => characters.id).notNull(),
  level: integer("level").notNull(),
  effectType: text("effect_type").notNull().$type<BonusEffectType>(),
  value: text("value").notNull(),
  rarity: text("rarity").$type<Rarity>(),
  description: text("description"),
});

export const insertCharacterLevelBonusSchema = createInsertSchema(characterLevelBonuses).omit({
  id: true
});

export type InsertCharacterLevelBonus = z.infer<typeof insertCharacterLevelBonusSchema>;
export type CharacterLevelBonus = typeof characterLevelBonuses.$inferSelect;

// 覚醒ボーナスのテーブル (Lv10まで開放時の効果のみ)
export const characterAwakeningBonuses = pgTable("character_awakening_bonuses", {
  id: serial("id").primaryKey(),
  characterId: integer("character_id").references(() => characters.id).notNull(),
  awakeningType: text("awakening_type").notNull().$type<"initial" | "second">(),
  awakeningLevel: integer("awakening_level").notNull().default(1), // データベース互換性のために追加
  effectType: text("effect_type").notNull().$type<BonusEffectType>(),
  value: text("value").notNull(),
  description: text("description"),  // データベース互換性のために追加
});

export const insertCharacterAwakeningBonusSchema = createInsertSchema(characterAwakeningBonuses).omit({
  id: true
});

export type InsertCharacterAwakeningBonus = z.infer<typeof insertCharacterAwakeningBonusSchema>;
export type CharacterAwakeningBonus = typeof characterAwakeningBonuses.$inferSelect;

// リレーションは最後にまとめて定義します

// 特殊能力名のテーブル（金特の名前マスタ）
export const specialAbilities = pgTable("special_abilities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // 特殊能力の名前（例：「エース」、「広角打法」）
  description: text("description"), // 特殊能力の説明
  playerType: text("player_type").notNull().$type<PlayerType>(), // 投手か野手か
});

export const insertSpecialAbilitySchema = createInsertSchema(specialAbilities).omit({
  id: true
});

export type InsertSpecialAbility = z.infer<typeof insertSpecialAbilitySchema>;
export type SpecialAbility = typeof specialAbilities.$inferSelect;

// キャラクターの特殊能力セットのテーブル（各キャラクターが持つ金特のセット）
export const characterSpecialAbilitySets = pgTable("character_special_ability_sets", {
  id: serial("id").primaryKey(),
  characterId: integer("character_id").references(() => characters.id).notNull(),
  playerType: text("player_type").notNull().$type<PlayerType>(), // 投手か野手か
  choiceType: text("choice_type").notNull().$type<SpecialAbilityChoiceType>(), // 選択肢のパターン
  name: text("name").notNull(), // セットの表示名（例：「Aルート - エース系」）
  description: text("description"), // セットの説明
});

export const insertCharacterSpecialAbilitySetSchema = createInsertSchema(characterSpecialAbilitySets).omit({
  id: true
});

export type InsertCharacterSpecialAbilitySet = z.infer<typeof insertCharacterSpecialAbilitySetSchema>;
export type CharacterSpecialAbilitySet = typeof characterSpecialAbilitySets.$inferSelect;

// 特殊能力セットと特殊能力の関連付けテーブル
export const specialAbilitySetItems = pgTable("special_ability_set_items", {
  id: serial("id").primaryKey(),
  setId: integer("set_id").references(() => characterSpecialAbilitySets.id).notNull(),
  specialAbilityId: integer("special_ability_id").references(() => specialAbilities.id).notNull(),
  order: integer("order").notNull().default(0), // 表示順序
  customName: text("custom_name"), // オリジナル変化球のカスタム名
});

export const insertSpecialAbilitySetItemSchema = createInsertSchema(specialAbilitySetItems).omit({
  id: true
});

export type InsertSpecialAbilitySetItem = z.infer<typeof insertSpecialAbilitySetItemSchema>;
export type SpecialAbilitySetItem = typeof specialAbilitySetItems.$inferSelect;

// 全テーブルのリレーション定義
export const usersRelations = relations(users, ({ many }) => ({
  decks: many(decks),
  ownedCharacters: many(ownedCharacters),
}));

export const charactersRelations = relations(characters, ({ many }) => ({
  deckCharacters: many(deckCharacters),
  comboCharacters: many(comboCharacters),
  levelBonuses: many(characterLevelBonuses),
  awakeningBonuses: many(characterAwakeningBonuses),
  specialAbilitySets: many(characterSpecialAbilitySets),
  ownedCharacters: many(ownedCharacters),
}));

export const decksRelations = relations(decks, ({ one, many }) => ({
  user: one(users, {
    fields: [decks.userId],
    references: [users.id],
  }),
  deckCharacters: many(deckCharacters),
}));

export const combosRelations = relations(combos, ({ many }) => ({
  comboCharacters: many(comboCharacters),
}));

export const ownedCharactersRelations = relations(ownedCharacters, ({ one }) => ({
  user: one(users, {
    fields: [ownedCharacters.userId],
    references: [users.id],
  }),
  character: one(characters, {
    fields: [ownedCharacters.characterId],
    references: [characters.id],
  }),
}));

export const deckCharactersRelations = relations(deckCharacters, ({ one }) => ({
  deck: one(decks, {
    fields: [deckCharacters.deckId],
    references: [decks.id],
  }),
  character: one(characters, {
    fields: [deckCharacters.characterId],
    references: [characters.id],
  }),
}));

export const comboCharactersRelations = relations(comboCharacters, ({ one }) => ({
  combo: one(combos, {
    fields: [comboCharacters.comboId],
    references: [combos.id],
  }),
  character: one(characters, {
    fields: [comboCharacters.characterId],
    references: [characters.id],
  }),
}));

export const characterLevelBonusesRelations = relations(characterLevelBonuses, ({ one }) => ({
  character: one(characters, {
    fields: [characterLevelBonuses.characterId],
    references: [characters.id],
  }),
}));

export const characterAwakeningBonusesRelations = relations(characterAwakeningBonuses, ({ one }) => ({
  character: one(characters, {
    fields: [characterAwakeningBonuses.characterId],
    references: [characters.id],
  }),
}));

export const specialAbilitiesRelations = relations(specialAbilities, ({ many }) => ({
  setItems: many(specialAbilitySetItems),
}));

export const characterSpecialAbilitySetsRelations = relations(characterSpecialAbilitySets, ({ one, many }) => ({
  character: one(characters, {
    fields: [characterSpecialAbilitySets.characterId],
    references: [characters.id],
  }),
  setItems: many(specialAbilitySetItems),
}));

export const specialAbilitySetItemsRelations = relations(specialAbilitySetItems, ({ one }) => ({
  set: one(characterSpecialAbilitySets, {
    fields: [specialAbilitySetItems.setId],
    references: [characterSpecialAbilitySets.id],
  }),
  specialAbility: one(specialAbilities, {
    fields: [specialAbilitySetItems.specialAbilityId],
    references: [specialAbilities.id],
  }),
}));