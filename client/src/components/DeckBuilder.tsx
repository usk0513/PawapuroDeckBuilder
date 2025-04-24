import React from "react";
import { Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import DeckSlot from "@/components/DeckSlot";
import { useDeck } from "@/contexts/DeckContext";
import { MAX_DECK_SIZE } from "@/lib/constants";
import { useDrop } from "react-dnd";
import { useToast } from "@/hooks/use-toast";

const DeckBuilder: React.FC = () => {
  const { 
    currentDeck, 
    deckCharacters, 
    clearDeck, 
    saveDeck, 
    addCharacterToDeck,
    isDeckFull 
  } = useDeck();
  
  const { toast } = useToast();
  
  // Set up drop target for the deck builder area
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: "character",
    drop: (item: { id: number }) => {
      if (!isDeckFull) {
        // Only add if not already in the deck
        const isAlreadyInDeck = deckCharacters.some(c => c.id === item.id);
        if (!isAlreadyInDeck) {
          addCharacterToDeck(item.id);
          return { added: true };
        }
        return { added: false };
      } else {
        toast({
          title: "デッキがいっぱいです",
          description: `デッキに最大${MAX_DECK_SIZE}キャラまで追加できます。`,
          variant: "destructive",
        });
        return { added: false };
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop() && !isDeckFull,
    }),
  }));
  
  const handleClearDeck = () => {
    if (window.confirm("デッキをクリアしますか？")) {
      clearDeck();
    }
  };
  
  const handleSaveDeck = async () => {
    await saveDeck();
  };
  
  // Create an array of all slots (filled or empty)
  const deckSlots = [];
  
  // First add all filled slots
  for (let i = 0; i < deckCharacters.length; i++) {
    deckSlots.push(
      <DeckSlot 
        key={`filled-${i}`} 
        character={deckCharacters[i]} 
        index={i} 
      />
    );
  }
  
  // Then add empty slots
  for (let i = deckCharacters.length; i < MAX_DECK_SIZE; i++) {
    deckSlots.push(
      <DeckSlot 
        key={`empty-${i}`} 
        index={i} 
      />
    );
  }
  
  return (
    <div 
      className={`bg-white rounded-xl shadow-md p-4 mb-6 ${isOver && canDrop ? 'ring-2 ring-[hsl(var(--gaming-blue))]' : ''}`}
      ref={drop}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-rounded font-bold text-xl text-gray-800">デッキビルダー</h2>
        <div className="flex space-x-2">
          <Button 
            variant="destructive" 
            size="sm"
            className="bg-[hsl(var(--gaming-red))] hover:bg-red-700"
            onClick={handleClearDeck}
            disabled={deckCharacters.length === 0}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            クリア
          </Button>
          <Button 
            variant="default" 
            size="sm"
            className="bg-[hsl(var(--gaming-blue))] hover:bg-blue-700"
            onClick={handleSaveDeck}
            disabled={deckCharacters.length === 0}
          >
            <Save className="mr-1 h-4 w-4" />
            保存
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        {deckSlots}
      </div>
      
      <div className="text-sm text-gray-500 text-center">
        {isOver && canDrop 
          ? "キャラクターをここにドロップ" 
          : "キャラクターをドラッグしてデッキに追加"
        }
      </div>
    </div>
  );
};

export default DeckBuilder;
