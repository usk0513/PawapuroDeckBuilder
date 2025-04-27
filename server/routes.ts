import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertCharacterSchema, 
  insertDeckSchema, 
  insertOwnedCharacterSchema, 
  insertCharacterLevelBonusSchema, 
  insertCharacterAwakeningBonusSchema,
  insertCharacterFriendshipAbilitySchema,
  insertSpecialAbilitySchema,
  insertCharacterSpecialAbilitySetSchema,
  insertSpecialAbilitySetItemSchema,
  PlayerType
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for characters
  app.get("/api/characters", async (req, res) => {
    try {
      const characters = await storage.getAllCharacters();
      res.json(characters);
    } catch (error) {
      res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  });

  app.get("/api/characters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "無効なIDです" });
      }
      
      const character = await storage.getCharacter(id);
      if (!character) {
        return res.status(404).json({ message: "キャラクターが見つかりませんでした" });
      }
      
      res.json(character);
    } catch (error) {
      res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  });

  app.post("/api/characters", async (req, res) => {
    try {
      const result = insertCharacterSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "入力エラー",
          errors: result.error.issues 
        });
      }
      
      const newCharacter = await storage.createCharacter(result.data);
      res.status(201).json(newCharacter);
    } catch (error) {
      res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  });

  app.patch("/api/characters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "無効なIDです" });
      }
      
      // Validate partial schema
      const partialSchema = insertCharacterSchema.partial();
      const result = partialSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "入力エラー", 
          errors: result.error.issues 
        });
      }
      
      const updatedCharacter = await storage.updateCharacter(id, result.data);
      if (!updatedCharacter) {
        return res.status(404).json({ message: "キャラクターが見つかりませんでした" });
      }
      
      res.json(updatedCharacter);
    } catch (error) {
      res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  });

  app.delete("/api/characters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "無効なIDです" });
      }
      
      const deleted = await storage.deleteCharacter(id);
      if (!deleted) {
        return res.status(404).json({ message: "キャラクターが見つかりませんでした" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  });

  // API routes for decks
  app.get("/api/decks", async (req, res) => {
    try {
      const decks = await storage.getAllDecks();
      res.json(decks);
    } catch (error) {
      res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  });

  app.get("/api/decks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "無効なIDです" });
      }
      
      const deck = await storage.getDeck(id);
      if (!deck) {
        return res.status(404).json({ message: "デッキが見つかりませんでした" });
      }
      
      res.json(deck);
    } catch (error) {
      res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  });

  app.post("/api/decks", async (req, res) => {
    try {
      const result = insertDeckSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "入力エラー", 
          errors: result.error.issues 
        });
      }
      
      const newDeck = await storage.createDeck(result.data);
      res.status(201).json(newDeck);
    } catch (error) {
      res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  });

  app.patch("/api/decks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "無効なIDです" });
      }
      
      // Validate partial schema
      const partialSchema = insertDeckSchema.partial();
      const result = partialSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "入力エラー", 
          errors: result.error.issues 
        });
      }
      
      const updatedDeck = await storage.updateDeck(id, result.data);
      if (!updatedDeck) {
        return res.status(404).json({ message: "デッキが見つかりませんでした" });
      }
      
      res.json(updatedDeck);
    } catch (error) {
      res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  });

  app.delete("/api/decks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "無効なIDです" });
      }
      
      const deleted = await storage.deleteDeck(id);
      if (!deleted) {
        return res.status(404).json({ message: "デッキが見つかりませんでした" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  });

  // API routes for combos
  app.get("/api/combos", async (req, res) => {
    try {
      const combos = await storage.getAllCombos();
      res.json(combos);
    } catch (error) {
      res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  });

  app.get("/api/combos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "無効なIDです" });
      }
      
      const combo = await storage.getCombo(id);
      if (!combo) {
        return res.status(404).json({ message: "コンボが見つかりませんでした" });
      }
      
      res.json(combo);
    } catch (error) {
      res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  });

  // API routes for owned characters
  app.get("/api/owned-characters", async (req, res) => {
    try {
      // userIdクエリパラメータが必要
      const userId = parseInt(req.query.userId as string);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "無効なユーザーIDです" });
      }
      
      const ownedCharacters = await storage.getAllOwnedCharacters(userId);
      res.json(ownedCharacters);
    } catch (error) {
      res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  });

  app.get("/api/owned-characters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "無効なIDです" });
      }
      
      const ownedCharacter = await storage.getOwnedCharacter(id);
      if (!ownedCharacter) {
        return res.status(404).json({ message: "所持キャラクターが見つかりませんでした" });
      }
      
      res.json(ownedCharacter);
    } catch (error) {
      res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  });

  app.post("/api/owned-characters", async (req, res) => {
    try {
      const result = insertOwnedCharacterSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "入力エラー", 
          errors: result.error.issues 
        });
      }
      
      const newOwnedCharacter = await storage.createOwnedCharacter(result.data);
      res.status(201).json(newOwnedCharacter);
    } catch (error) {
      res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  });

  app.patch("/api/owned-characters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "無効なIDです" });
      }
      
      // Validate partial schema
      const partialSchema = insertOwnedCharacterSchema.partial();
      const result = partialSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "入力エラー", 
          errors: result.error.issues 
        });
      }
      
      const updatedOwnedCharacter = await storage.updateOwnedCharacter(id, result.data);
      if (!updatedOwnedCharacter) {
        return res.status(404).json({ message: "所持キャラクターが見つかりませんでした" });
      }
      
      res.json(updatedOwnedCharacter);
    } catch (error) {
      res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  });

  app.delete("/api/owned-characters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "無効なIDです" });
      }
      
      const deleted = await storage.deleteOwnedCharacter(id);
      if (!deleted) {
        return res.status(404).json({ message: "所持キャラクターが見つかりませんでした" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  });

  // API routes for character level bonuses
  app.get("/api/character-level-bonuses", async (req, res) => {
    try {
      const characterId = req.query.characterId ? parseInt(req.query.characterId as string) : undefined;
      const rarity = req.query.rarity as string | undefined;
      
      if (!characterId || isNaN(characterId)) {
        return res.status(400).json({ message: "キャラクターIDを指定してください" });
      }
      
      const bonuses = await storage.getCharacterLevelBonuses(characterId, rarity);
      res.json(bonuses);
    } catch (error) {
      res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  });

  app.post("/api/character-level-bonuses", async (req, res) => {
    try {
      const result = insertCharacterLevelBonusSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "入力エラー", 
          errors: result.error.issues 
        });
      }
      
      const newBonus = await storage.createCharacterLevelBonus(result.data);
      res.status(201).json(newBonus);
    } catch (error) {
      res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  });

  app.patch("/api/character-level-bonuses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "無効なIDです" });
      }
      
      // Validate partial schema
      const partialSchema = insertCharacterLevelBonusSchema.partial();
      const result = partialSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "入力エラー", 
          errors: result.error.issues 
        });
      }
      
      const updatedBonus = await storage.updateCharacterLevelBonus(id, result.data);
      if (!updatedBonus) {
        return res.status(404).json({ message: "レベルボーナスが見つかりませんでした" });
      }
      
      res.json(updatedBonus);
    } catch (error) {
      res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  });

  app.delete("/api/character-level-bonuses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "無効なIDです" });
      }
      
      const deleted = await storage.deleteCharacterLevelBonus(id);
      if (!deleted) {
        return res.status(404).json({ message: "レベルボーナスが見つかりませんでした" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  });

  // API routes for character awakening bonuses
  app.get("/api/character-awakening-bonuses", async (req, res) => {
    try {
      const characterId = req.query.characterId ? parseInt(req.query.characterId as string) : undefined;
      
      if (!characterId || isNaN(characterId)) {
        return res.status(400).json({ message: "キャラクターIDを指定してください" });
      }
      
      const bonuses = await storage.getCharacterAwakeningBonuses(characterId);
      res.json(bonuses);
    } catch (error) {
      res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  });

  app.post("/api/character-awakening-bonuses", async (req, res) => {
    try {
      console.log("Received character awakening bonus:", req.body);
      const result = insertCharacterAwakeningBonusSchema.safeParse(req.body);
      if (!result.success) {
        console.error("Validation error:", result.error.issues);
        return res.status(400).json({ 
          message: "入力エラー", 
          errors: result.error.issues 
        });
      }
      
      console.log("Validated data:", result.data);
      const newBonus = await storage.createCharacterAwakeningBonus(result.data);
      res.status(201).json(newBonus);
    } catch (error) {
      console.error("Server error:", error);
      res.status(500).json({ message: "サーバーエラーが発生しました", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.patch("/api/character-awakening-bonuses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "無効なIDです" });
      }
      
      // Validate partial schema
      const partialSchema = insertCharacterAwakeningBonusSchema.partial();
      const result = partialSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "入力エラー", 
          errors: result.error.issues 
        });
      }
      
      const updatedBonus = await storage.updateCharacterAwakeningBonus(id, result.data);
      if (!updatedBonus) {
        return res.status(404).json({ message: "覚醒ボーナスが見つかりませんでした" });
      }
      
      res.json(updatedBonus);
    } catch (error) {
      res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  });

  app.delete("/api/character-awakening-bonuses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "無効なIDです" });
      }
      
      const deleted = await storage.deleteCharacterAwakeningBonus(id);
      if (!deleted) {
        return res.status(404).json({ message: "覚醒ボーナスが見つかりませんでした" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  });

  // API routes for special abilities
  app.get("/api/special-abilities", async (_req, res) => {
    try {
      console.log("Fetching all special abilities");
      const abilities = await storage.getAllSpecialAbilities();
      console.log("Successfully fetched special abilities");
      res.json(abilities);
    } catch (error) {
      console.error("Error fetching special abilities:", error);
      res.status(500).json({ message: "サーバーエラーが発生しました", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.get("/api/special-abilities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "無効なIDです" });
      }
      
      const ability = await storage.getSpecialAbility(id);
      if (!ability) {
        return res.status(404).json({ message: "特殊能力が見つかりませんでした" });
      }
      
      res.json(ability);
    } catch (error) {
      res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  });

  app.post("/api/special-abilities", async (req, res) => {
    try {
      const result = insertSpecialAbilitySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "入力エラー", 
          errors: result.error.issues 
        });
      }
      
      const newAbility = await storage.createSpecialAbility(result.data);
      res.status(201).json(newAbility);
    } catch (error) {
      res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  });

  app.patch("/api/special-abilities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "無効なIDです" });
      }
      
      // Validate partial schema
      const partialSchema = insertSpecialAbilitySchema.partial();
      const result = partialSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "入力エラー", 
          errors: result.error.issues 
        });
      }
      
      const updatedAbility = await storage.updateSpecialAbility(id, result.data);
      if (!updatedAbility) {
        return res.status(404).json({ message: "特殊能力が見つかりませんでした" });
      }
      
      res.json(updatedAbility);
    } catch (error) {
      res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  });

  app.delete("/api/special-abilities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "無効なIDです" });
      }
      
      const deleted = await storage.deleteSpecialAbility(id);
      if (!deleted) {
        return res.status(404).json({ message: "特殊能力が見つかりませんでした" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  });

  // API routes for character special ability sets
  app.get("/api/character-special-ability-sets", async (req, res) => {
    try {
      const characterId = req.query.characterId ? parseInt(req.query.characterId as string) : undefined;
      const playerType = req.query.playerType as PlayerType | undefined;
      
      if (!characterId || isNaN(characterId)) {
        return res.status(400).json({ message: "キャラクターIDを指定してください" });
      }
      
      const sets = await storage.getCharacterSpecialAbilitySets(characterId, playerType);
      res.json(sets);
    } catch (error) {
      res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  });

  app.get("/api/character-special-ability-sets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "無効なIDです" });
      }
      
      const set = await storage.getCharacterSpecialAbilitySet(id);
      if (!set) {
        return res.status(404).json({ message: "特殊能力セットが見つかりませんでした" });
      }
      
      res.json(set);
    } catch (error) {
      res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  });

  app.post("/api/character-special-ability-sets", async (req, res) => {
    try {
      console.log("Received special ability set:", req.body);
      const result = insertCharacterSpecialAbilitySetSchema.safeParse(req.body);
      if (!result.success) {
        console.error("Validation error:", result.error.issues);
        return res.status(400).json({ 
          message: "入力エラー", 
          errors: result.error.issues 
        });
      }
      
      // 同じキャラクター・プレイヤータイプ・選択タイプの組み合わせが既に存在するか確認
      const existingSets = await storage.getCharacterSpecialAbilitySets(
        result.data.characterId, 
        result.data.playerType as PlayerType
      );
      
      const existingSet = existingSets.find(set => 
        set.choiceType === result.data.choiceType
      );
      
      if (existingSet) {
        return res.status(400).json({
          message: "既に同じルートの特殊能力セットが存在します",
          existingSet
        });
      }
      
      const newSet = await storage.createCharacterSpecialAbilitySet(result.data);
      res.status(201).json(newSet);
    } catch (error) {
      console.error("Server error:", error);
      res.status(500).json({ 
        message: "サーバーエラーが発生しました", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.patch("/api/character-special-ability-sets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "無効なIDです" });
      }
      
      // Validate partial schema
      const partialSchema = insertCharacterSpecialAbilitySetSchema.partial();
      const result = partialSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "入力エラー", 
          errors: result.error.issues 
        });
      }
      
      const updatedSet = await storage.updateCharacterSpecialAbilitySet(id, result.data);
      if (!updatedSet) {
        return res.status(404).json({ message: "特殊能力セットが見つかりませんでした" });
      }
      
      res.json(updatedSet);
    } catch (error) {
      res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  });

  app.delete("/api/character-special-ability-sets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "無効なIDです" });
      }
      
      const deleted = await storage.deleteCharacterSpecialAbilitySet(id);
      if (!deleted) {
        return res.status(404).json({ message: "特殊能力セットが見つかりませんでした" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  });

  // API routes for special ability set items
  app.post("/api/special-ability-set-items", async (req, res) => {
    try {
      console.log("Received special ability set item:", req.body);
      const result = insertSpecialAbilitySetItemSchema.safeParse(req.body);
      if (!result.success) {
        console.error("Validation error:", result.error.issues);
        return res.status(400).json({ 
          message: "入力エラー", 
          errors: result.error.issues 
        });
      }
      
      // 常にorderを1に設定（表示順は無視）
      result.data.order = 1;
      
      console.log("Validated data:", result.data);
      const newItem = await storage.addSpecialAbilityToSet(result.data);
      res.status(201).json(newItem);
    } catch (error) {
      console.error("Server error:", error);
      res.status(500).json({ 
        message: "サーバーエラーが発生しました", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  app.delete("/api/special-ability-set-items", async (req, res) => {
    try {
      const setId = parseInt(req.query.setId as string);
      const specialAbilityId = parseInt(req.query.specialAbilityId as string);
      
      if (isNaN(setId) || isNaN(specialAbilityId)) {
        return res.status(400).json({ message: "無効なIDです" });
      }
      
      const deleted = await storage.removeSpecialAbilityFromSet(setId, specialAbilityId);
      if (!deleted) {
        return res.status(404).json({ message: "特殊能力セット項目が見つかりませんでした" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  });

  // API routes for character friendship abilities
  app.get("/api/character-friendship-abilities", async (req, res) => {
    try {
      const characterId = req.query.characterId ? parseInt(req.query.characterId as string) : undefined;
      
      if (!characterId || isNaN(characterId)) {
        return res.status(400).json({ message: "キャラクターIDを指定してください" });
      }
      
      // 空の配列を返す（仮実装）- 今後実際のデータで置き換える
      // const abilities = await storage.getCharacterFriendshipAbilities(characterId);
      const abilities = [];
      res.json(abilities);
    } catch (error) {
      console.error("Error in character-friendship-abilities:", error);
      res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  });

  app.get("/api/character-friendship-abilities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "無効なIDです" });
      }
      
      const ability = await storage.getCharacterFriendshipAbility(id);
      if (!ability) {
        return res.status(404).json({ message: "友情特殊能力が見つかりませんでした" });
      }
      
      res.json(ability);
    } catch (error) {
      res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  });

  app.post("/api/character-friendship-abilities", async (req, res) => {
    try {
      const result = insertCharacterFriendshipAbilitySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "入力エラー", 
          errors: result.error.issues 
        });
      }
      
      const newAbility = await storage.createCharacterFriendshipAbility(result.data);
      res.status(201).json(newAbility);
    } catch (error) {
      res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  });

  app.patch("/api/character-friendship-abilities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "無効なIDです" });
      }
      
      // Validate partial schema
      const partialSchema = insertCharacterFriendshipAbilitySchema.partial();
      const result = partialSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "入力エラー", 
          errors: result.error.issues 
        });
      }
      
      const updatedAbility = await storage.updateCharacterFriendshipAbility(id, result.data);
      if (!updatedAbility) {
        return res.status(404).json({ message: "友情特殊能力が見つかりませんでした" });
      }
      
      res.json(updatedAbility);
    } catch (error) {
      res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  });

  app.delete("/api/character-friendship-abilities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "無効なIDです" });
      }
      
      const deleted = await storage.deleteCharacterFriendshipAbility(id);
      if (!deleted) {
        return res.status(404).json({ message: "友情特殊能力が見つかりませんでした" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
