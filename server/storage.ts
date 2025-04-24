import { 
  users, 
  type User, 
  type InsertUser, 
  characters, 
  type Character, 
  type InsertCharacter,
  decks,
  type Deck,
  type InsertDeck,
  combos,
  type Combo,
  type InsertCombo,
  Position,
  Rarity
} from "@shared/schema";
import { db, pool } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Character operations
  getAllCharacters(): Promise<Character[]>;
  getCharacter(id: number): Promise<Character | undefined>;
  createCharacter(character: InsertCharacter): Promise<Character>;
  updateCharacter(id: number, character: Partial<InsertCharacter>): Promise<Character | undefined>;
  deleteCharacter(id: number): Promise<boolean>;
  
  // Deck operations
  getAllDecks(): Promise<Deck[]>;
  getDeck(id: number): Promise<Deck | undefined>;
  createDeck(deck: InsertDeck): Promise<Deck>;
  updateDeck(id: number, deck: Partial<InsertDeck>): Promise<Deck | undefined>;
  deleteDeck(id: number): Promise<boolean>;
  
  // Combo operations
  getAllCombos(): Promise<Combo[]>;
  getCombo(id: number): Promise<Combo | undefined>;
  createCombo(combo: InsertCombo): Promise<Combo>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Character operations
  async getAllCharacters(): Promise<Character[]> {
    return db.select().from(characters);
  }
  
  async getCharacter(id: number): Promise<Character | undefined> {
    const [character] = await db.select().from(characters).where(eq(characters.id, id));
    return character;
  }
  
  async createCharacter(character: InsertCharacter): Promise<Character> {
    const [newCharacter] = await db.insert(characters).values(character).returning();
    return newCharacter;
  }
  
  async updateCharacter(id: number, character: Partial<InsertCharacter>): Promise<Character | undefined> {
    const [updatedCharacter] = await db
      .update(characters)
      .set(character)
      .where(eq(characters.id, id))
      .returning();
    
    return updatedCharacter;
  }
  
  async deleteCharacter(id: number): Promise<boolean> {
    const result = await db.delete(characters).where(eq(characters.id, id));
    return !!result;
  }
  
  // Deck operations
  async getAllDecks(): Promise<Deck[]> {
    return db.select().from(decks);
  }
  
  async getDeck(id: number): Promise<Deck | undefined> {
    const [deck] = await db.select().from(decks).where(eq(decks.id, id));
    return deck;
  }
  
  async createDeck(deck: InsertDeck): Promise<Deck> {
    const [newDeck] = await db.insert(decks).values(deck).returning();
    return newDeck;
  }
  
  async updateDeck(id: number, deck: Partial<InsertDeck>): Promise<Deck | undefined> {
    const [updatedDeck] = await db
      .update(decks)
      .set(deck)
      .where(eq(decks.id, id))
      .returning();
    
    return updatedDeck;
  }
  
  async deleteDeck(id: number): Promise<boolean> {
    const result = await db.delete(decks).where(eq(decks.id, id));
    return !!result;
  }
  
  // Combo operations
  async getAllCombos(): Promise<Combo[]> {
    return db.select().from(combos);
  }
  
  async getCombo(id: number): Promise<Combo | undefined> {
    const [combo] = await db.select().from(combos).where(eq(combos.id, id));
    return combo;
  }
  
  async createCombo(combo: InsertCombo): Promise<Combo> {
    const [newCombo] = await db.insert(combos).values(combo).returning();
    return newCombo;
  }

  // Initialize sample data for development purposes
  async initializeData(): Promise<void> {
    try {
      // First check if tables exist
      try {
        // Use the pool directly to check if the characters table exists
        const tableExists = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'characters'
          );
        `);
        
        if (!tableExists.rows[0].exists) {
          console.log("Characters table doesn't exist yet, skipping initialization");
          return;
        }
      } catch (error) {
        console.log("Error checking if tables exist, skipping initialization:", error);
        return;
      }

      // Check if there's already data in the database
      const result = await pool.query("SELECT COUNT(*) FROM characters");
      const count = Number(result.rows[0].count || 0);
      
      if (count > 0) {
        // Data already exists, skip initialization
        console.log("Database already initialized with sample data");
        return;
      }
      
      console.log("Initializing database with sample data");

      // Initialize some sample characters
      const sampleCharacters: InsertCharacter[] = [
        {
          name: "猪狩 守",
          position: Position.PITCHER,
          rarity: Rarity.SR,
          level: 5,
          awakening: 3,
          rating: 3,
          stats: {
            pitching: { velocity: 3, control: 2, stamina: 2, breaking: 0 },
            batting: { contact: 0, power: 0, speed: 0, arm: 0, fielding: 0 }
          },
          owned: true
        },
        {
          name: "友沢 亮",
          position: Position.OUTFIELD,
          rarity: Rarity.R,
          level: 4,
          awakening: 2,
          rating: 4,
          stats: {
            pitching: { velocity: 0, control: 0, stamina: 0, breaking: 0 },
            batting: { contact: 3, power: 0, speed: 3, arm: 2, fielding: 0 }
          },
          owned: true
        },
        {
          name: "猪狩 進",
          position: Position.PITCHER,
          rarity: Rarity.PSR,
          level: 5,
          awakening: 4,
          rating: 5,
          stats: {
            pitching: { velocity: 4, control: 4, stamina: 0, breaking: 3 },
            batting: { contact: 0, power: 0, speed: 0, arm: 0, fielding: 0 }
          },
          owned: true
        },
        {
          name: "佐藤 寿也",
          position: Position.INFIELD,
          rarity: Rarity.N,
          level: 3,
          awakening: 1,
          rating: 2,
          stats: {
            pitching: { velocity: 0, control: 0, stamina: 0, breaking: 0 },
            batting: { contact: 1, power: 3, speed: 0, arm: 0, fielding: 2 }
          },
          owned: true
        },
        {
          name: "六道 聖",
          position: Position.CATCHER,
          rarity: Rarity.PR,
          level: 4,
          awakening: 2,
          rating: 3,
          stats: {
            pitching: { velocity: 0, control: 0, stamina: 0, breaking: 0 },
            batting: { contact: 0, power: 0, speed: 0, arm: 2, fielding: 3 }
          },
          owned: true
        }
      ];
      
      // Insert sample characters
      const createdCharacters = await db.insert(characters).values(sampleCharacters).returning();
      
      // Initialize sample combos
      const sampleCombos: InsertCombo[] = [
        {
          name: "サクセスコンボ",
          description: "猪狩守と友沢亮の組み合わせにより発動",
          requiredCharacters: [createdCharacters[0].id, createdCharacters[1].id],
          effects: {
            "全ステータス": 1,
            "疲労回復": 5
          }
        }
      ];
      
      await db.insert(combos).values(sampleCombos);
      
      // Initialize a sample deck
      await db.insert(decks).values({
        name: "マイデッキ",
        characters: [createdCharacters[0].id, createdCharacters[1].id]
      });
      
      console.log("Sample data initialization complete");
    } catch (error) {
      console.error("Error initializing sample data:", error);
    }
  }
}

export const storage = new DatabaseStorage();

// Initialize the sample data when the module loads
storage.initializeData().catch(err => {
  console.error("Error initializing sample data:", err);
});