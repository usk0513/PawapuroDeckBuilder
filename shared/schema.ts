import { pgTable, text, serial, integer, boolean, json, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Character position enum
export enum Position {
  PITCHER = "投手",
  CATCHER = "捕手",
  INFIELD = "内野",
  OUTFIELD = "外野"
}

// Character rarity enum
export enum Rarity {
  N = "N",
  PN = "PN",
  R = "R",
  PR = "PR",
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
  position: text("position").notNull().$type<Position>(),
  rating: integer("rating").notNull().default(3),
  stats: json("stats").notNull().$type<Stat>(),
  specialTrainings: json("specialTrainings").$type<SpecialTraining[]>().default([]),
  eventTiming: text("event_timing").$type<EventTiming>(),
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
  rarity: text("rarity").notNull().$type<Rarity>().default(Rarity.N),
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
export const charactersRelations = relations(characters, ({ many }) => ({
  deckCharacters: many(deckCharacters),
  comboCharacters: many(comboCharacters),
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

export const usersRelations = relations(users, ({ many }) => ({
  decks: many(decks),
  ownedCharacters: many(ownedCharacters),
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