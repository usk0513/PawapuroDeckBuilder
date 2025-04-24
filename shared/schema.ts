import { pgTable, text, serial, integer, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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

// Character schema
export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  position: text("position").notNull().$type<Position>(),
  rarity: text("rarity").notNull().$type<Rarity>().default(Rarity.N),
  level: integer("level").notNull().default(1),
  awakening: integer("awakening").notNull().default(0),
  rating: integer("rating").notNull().default(3),
  stats: json("stats").notNull().$type<Stat>(),
  owned: boolean("owned").notNull().default(true),
});

export const insertCharacterSchema = createInsertSchema(characters).omit({
  id: true
});

export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type Character = typeof characters.$inferSelect;

// Deck schema
export const decks = pgTable("decks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  characters: json("characters").notNull().$type<number[]>(),
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
