import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCharacterSchema, insertDeckSchema, insertOwnedCharacterSchema } from "@shared/schema";
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

  const httpServer = createServer(app);
  return httpServer;
}
