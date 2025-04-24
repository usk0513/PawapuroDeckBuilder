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

// modify the interface with any CRUD methods
// you might need

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private characters: Map<number, Character>;
  private decks: Map<number, Deck>;
  private combos: Map<number, Combo>;
  private userId: number;
  private characterId: number;
  private deckId: number;
  private comboId: number;

  constructor() {
    this.users = new Map();
    this.characters = new Map();
    this.decks = new Map();
    this.combos = new Map();
    
    // Starting IDs
    this.userId = 1;
    this.characterId = 1;
    this.deckId = 1;
    this.comboId = 1;
    
    // Initialize with some sample data
    this.initializeData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Character operations
  async getAllCharacters(): Promise<Character[]> {
    return Array.from(this.characters.values());
  }
  
  async getCharacter(id: number): Promise<Character | undefined> {
    return this.characters.get(id);
  }
  
  async createCharacter(character: InsertCharacter): Promise<Character> {
    const id = this.characterId++;
    const newCharacter: Character = { ...character, id };
    this.characters.set(id, newCharacter);
    return newCharacter;
  }
  
  async updateCharacter(id: number, character: Partial<InsertCharacter>): Promise<Character | undefined> {
    const existingCharacter = this.characters.get(id);
    if (!existingCharacter) {
      return undefined;
    }
    
    const updatedCharacter = { ...existingCharacter, ...character };
    this.characters.set(id, updatedCharacter);
    return updatedCharacter;
  }
  
  async deleteCharacter(id: number): Promise<boolean> {
    return this.characters.delete(id);
  }
  
  // Deck operations
  async getAllDecks(): Promise<Deck[]> {
    return Array.from(this.decks.values());
  }
  
  async getDeck(id: number): Promise<Deck | undefined> {
    return this.decks.get(id);
  }
  
  async createDeck(deck: InsertDeck): Promise<Deck> {
    const id = this.deckId++;
    const newDeck: Deck = { ...deck, id };
    this.decks.set(id, newDeck);
    return newDeck;
  }
  
  async updateDeck(id: number, deck: Partial<InsertDeck>): Promise<Deck | undefined> {
    const existingDeck = this.decks.get(id);
    if (!existingDeck) {
      return undefined;
    }
    
    const updatedDeck = { ...existingDeck, ...deck };
    this.decks.set(id, updatedDeck);
    return updatedDeck;
  }
  
  async deleteDeck(id: number): Promise<boolean> {
    return this.decks.delete(id);
  }
  
  // Combo operations
  async getAllCombos(): Promise<Combo[]> {
    return Array.from(this.combos.values());
  }
  
  async getCombo(id: number): Promise<Combo | undefined> {
    return this.combos.get(id);
  }
  
  async createCombo(combo: InsertCombo): Promise<Combo> {
    const id = this.comboId++;
    const newCombo: Combo = { ...combo, id };
    this.combos.set(id, newCombo);
    return newCombo;
  }
  
  // Initialize sample data
  private initializeData() {
    // Initialize some sample characters
    const sampleCharacters: InsertCharacter[] = [
      {
        name: "猪狩 守",
        position: "投手",
        rarity: "SR",
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
        position: "外野",
        rarity: "R",
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
        position: "投手",
        rarity: "PSR",
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
        position: "内野",
        rarity: "N",
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
        position: "捕手",
        rarity: "PR",
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
    
    sampleCharacters.forEach(character => {
      this.createCharacter(character);
    });
    
    // Initialize sample combos
    const sampleCombos: InsertCombo[] = [
      {
        name: "サクセスコンボ",
        description: "猪狩守と友沢亮の組み合わせにより発動",
        requiredCharacters: [1, 2], // IDs of 猪狩 守 and 友沢 亮
        effects: {
          "全ステータス": 1,
          "疲労回復": 5
        }
      }
    ];
    
    sampleCombos.forEach(combo => {
      this.createCombo(combo);
    });
    
    // Initialize a sample deck
    this.createDeck({
      name: "マイデッキ",
      characters: [1, 2] // IDs of 猪狩 守 and 友沢 亮
    });
  }
}

export const storage = new MemStorage();
