import { z } from "zod";
import { 
  CharacterType, 
  EventTiming, 
  BonusEffectType, 
  Rarity, 
  PlayerType,
  SpecialAbilityChoiceType,
  insertCharacterSchema, 
  insertCharacterLevelBonusSchema, 
  insertCharacterAwakeningBonusSchema,
  insertSpecialAbilitySchema,
  insertCharacterSpecialAbilitySetSchema
} from "@shared/schema";

// 管理者向けキャラクター作成スキーマ
export const characterSchema = insertCharacterSchema.extend({});
export type CharacterFormValues = z.infer<typeof characterSchema>;

// レベルボーナス登録用スキーマ
export const levelBonusSchema = insertCharacterLevelBonusSchema.extend({});
export type LevelBonusFormValues = z.infer<typeof levelBonusSchema>;

// 覚醒ボーナス登録用スキーマ
export const awakeningBonusSchema = insertCharacterAwakeningBonusSchema.extend({});
export type AwakeningBonusFormValues = z.infer<typeof awakeningBonusSchema>;

// 金特登録用スキーマ
export const specialAbilitySchema = insertSpecialAbilitySchema.extend({});
export type SpecialAbilityFormValues = z.infer<typeof specialAbilitySchema>;

// 金特セット登録用スキーマ
export const characterSpecialAbilitySetSchema = insertCharacterSpecialAbilitySetSchema.extend({});
export type CharacterSpecialAbilitySetFormValues = z.infer<typeof characterSpecialAbilitySetSchema>;

// 金特セットアイテム登録用スキーマ
// スキーマを修正：orderフィールドを不要にし、specialAbilityIdのみ必須に
export const specialAbilitySetItemSchema = z.object({
  setId: z.number(),
  specialAbilityId: z.number(),
  customName: z.string().optional(),
});
export type SpecialAbilitySetItemFormValues = z.infer<typeof specialAbilitySetItemSchema>;

// 友情特殊能力のフォーム用のスキーマとタイプ定義
export const friendshipAbilitySchema = z.object({
  characterId: z.number().min(1, "キャラクターを選択してください"),
  playerType: z.nativeEnum(PlayerType, { message: "プレイヤータイプを選択してください" }),
  name: z.string().min(1, "友情特殊能力名を入力してください"),
});
export type FriendshipAbilityFormValues = z.infer<typeof friendshipAbilitySchema>;