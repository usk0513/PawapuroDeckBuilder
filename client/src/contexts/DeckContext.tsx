import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Character, Deck, Combo, MAX_DECK_SIZE } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

interface DeckContextType {
  currentDeck: Deck | null;
  deckCharacters: Character[];
  availableCombos: Combo[];
  activeCombos: Combo[];
  isDeckEmpty: boolean;
  isDeckFull: boolean;
  isLoading: boolean;
  addCharacterToDeck: (characterId: number) => void;
  removeCharacterFromDeck: (characterId: number) => void;
  clearDeck: () => void;
  saveDeck: () => Promise<void>;
  loadDeck: (deckId: number) => Promise<void>;
  calculateStats: () => Record<string, number>;
  getActiveCombos: () => Combo[];
}

const DeckContext = createContext<DeckContextType | undefined>(undefined);

export const DeckProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [currentDeck, setCurrentDeck] = useState<Deck | null>(null);
  
  // Fetch all characters
  const { data: characters = [], isLoading: charactersLoading } = useQuery<Character[]>({
    queryKey: ['/api/characters'],
  });
  
  // Fetch all combos
  const { data: combos = [], isLoading: combosLoading } = useQuery<Combo[]>({
    queryKey: ['/api/combos'],
  });
  
  // Fetch decks
  const { data: decks = [], isLoading: decksLoading } = useQuery<Deck[]>({
    queryKey: ['/api/decks'],
  });
  
  // Initialize deck if none exist
  useEffect(() => {
    if (!decksLoading && decks.length > 0 && !currentDeck) {
      setCurrentDeck(decks[0]);
    }
  }, [decks, decksLoading, currentDeck]);
  
  // Mutations for deck operations
  const createDeckMutation = useMutation({
    mutationFn: async (newDeck: Omit<Deck, 'id'>) => {
      const res = await apiRequest('POST', '/api/decks', newDeck);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/decks'] });
      toast({
        title: "デッキを保存しました",
        description: "新しいデッキが正常に保存されました。",
      });
    },
    onError: (error) => {
      toast({
        title: "エラー",
        description: `デッキの保存に失敗しました: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  const updateDeckMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<Deck> }) => {
      const res = await apiRequest('PATCH', `/api/decks/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/decks'] });
      toast({
        title: "デッキを更新しました",
        description: "デッキが正常に更新されました。",
      });
    },
    onError: (error) => {
      toast({
        title: "エラー",
        description: `デッキの更新に失敗しました: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Get characters in the current deck
  const deckCharacters = currentDeck 
    ? characters.filter(char => currentDeck.characters.includes(char.id)) 
    : [];
  
  // Compute deck state
  const isDeckEmpty = deckCharacters.length === 0;
  const isDeckFull = deckCharacters.length >= MAX_DECK_SIZE;
  const isLoading = charactersLoading || combosLoading || decksLoading;
  
  // Add character to deck
  const addCharacterToDeck = (characterId: number) => {
    if (isDeckFull) {
      toast({
        title: "デッキがいっぱいです",
        description: `デッキに最大${MAX_DECK_SIZE}キャラまで追加できます。`,
        variant: "destructive",
      });
      return;
    }
    
    if (!currentDeck) {
      // Create a new deck if none exists
      setCurrentDeck({
        id: -1, // Temporary ID until saved
        name: "マイデッキ",
        characters: [characterId]
      });
    } else {
      // Add to existing deck if character isn't already in it
      if (!currentDeck.characters.includes(characterId)) {
        setCurrentDeck({
          ...currentDeck,
          characters: [...currentDeck.characters, characterId]
        });
      }
    }
  };
  
  // Remove character from deck
  const removeCharacterFromDeck = (characterId: number) => {
    if (currentDeck) {
      setCurrentDeck({
        ...currentDeck,
        characters: currentDeck.characters.filter(id => id !== characterId)
      });
    }
  };
  
  // Clear all characters from deck
  const clearDeck = () => {
    if (currentDeck) {
      setCurrentDeck({
        ...currentDeck,
        characters: []
      });
    }
  };
  
  // Save current deck
  const saveDeck = async () => {
    if (!currentDeck) return;
    
    try {
      if (currentDeck.id === -1) {
        // Save as new deck
        await createDeckMutation.mutateAsync({
          name: currentDeck.name,
          characters: currentDeck.characters
        });
      } else {
        // Update existing deck
        await updateDeckMutation.mutateAsync({
          id: currentDeck.id,
          data: { characters: currentDeck.characters }
        });
      }
    } catch (error) {
      console.error("Failed to save deck:", error);
    }
  };
  
  // Load deck by ID
  const loadDeck = async (deckId: number) => {
    try {
      const foundDeck = decks.find(d => d.id === deckId);
      if (foundDeck) {
        setCurrentDeck(foundDeck);
        toast({
          title: "デッキを読み込みました",
          description: `「${foundDeck.name}」が読み込まれました。`,
        });
      }
    } catch (error) {
      console.error("Failed to load deck:", error);
      toast({
        title: "エラー",
        description: "デッキの読み込みに失敗しました。",
        variant: "destructive",
      });
    }
  };
  
  // Calculate combined stats of all characters in deck
  const calculateStats = () => {
    const totalStats: Record<string, number> = {
      velocity: 0,
      control: 0,
      stamina: 0,
      breaking: 0,
      contact: 0,
      power: 0,
      speed: 0,
      arm: 0,
      fielding: 0
    };
    
    // Sum all character stats
    deckCharacters.forEach(char => {
      // Pitching stats
      totalStats.velocity += char.stats.pitching.velocity;
      totalStats.control += char.stats.pitching.control;
      totalStats.stamina += char.stats.pitching.stamina;
      totalStats.breaking += char.stats.pitching.breaking;
      
      // Batting stats
      totalStats.contact += char.stats.batting.contact;
      totalStats.power += char.stats.batting.power;
      totalStats.speed += char.stats.batting.speed;
      totalStats.arm += char.stats.batting.arm;
      totalStats.fielding += char.stats.batting.fielding;
    });
    
    // Add combo effects
    const activeComboEffects = getActiveCombos();
    activeComboEffects.forEach(combo => {
      Object.entries(combo.effects).forEach(([stat, value]) => {
        // Skip non-numeric stats like "疲労回復"
        if (stat === "全ステータス" && typeof value === "number") {
          // Apply to all stats
          Object.keys(totalStats).forEach(statKey => {
            totalStats[statKey] += value;
          });
        } else if (stat in totalStats && typeof value === "number") {
          totalStats[stat] += value;
        }
      });
    });
    
    return totalStats;
  };
  
  // Get combos that are active with the current deck
  const getActiveCombos = () => {
    return combos.filter(combo => {
      // Check if all required characters are in the deck
      const hasAllRequiredCharacters = combo.requiredCharacters.every(
        charId => currentDeck?.characters.includes(charId)
      );
      return hasAllRequiredCharacters;
    });
  };
  
  const availableCombos = combos;
  const activeCombos = getActiveCombos();
  
  const value = {
    currentDeck,
    deckCharacters,
    availableCombos,
    activeCombos,
    isDeckEmpty,
    isDeckFull,
    isLoading,
    addCharacterToDeck,
    removeCharacterFromDeck,
    clearDeck,
    saveDeck,
    loadDeck,
    calculateStats,
    getActiveCombos
  };
  
  return <DeckContext.Provider value={value}>{children}</DeckContext.Provider>;
};

export const useDeck = () => {
  const context = useContext(DeckContext);
  if (context === undefined) {
    throw new Error("useDeck must be used within a DeckProvider");
  }
  return context;
};
