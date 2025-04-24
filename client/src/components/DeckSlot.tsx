import React from "react";
import { statColorMap, statNames, rarityColorMap, Character as UICharacter } from "@/lib/constants";
import { PlusCircle, X } from "lucide-react";
import { useDeck } from "@/contexts/DeckContext";
import { useDrop } from "react-dnd";
import { Badge } from "@/components/ui/badge";

interface DeckSlotProps {
  character?: UICharacter;
  index: number;
}

const DeckSlot: React.FC<DeckSlotProps> = ({ character, index }) => {
  const { addCharacterToDeck, removeCharacterFromDeck, isDeckFull } = useDeck();
  
  // Set up drop target for empty slots
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: "character",
    drop: (item: { id: number }) => {
      if (!character) {
        addCharacterToDeck(item.id);
        return { added: true };
      }
      return { added: false };
    },
    canDrop: () => !character && !isDeckFull,
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop() && !character && !isDeckFull,
    }),
  }));
  
  // Get top 2 stats for display
  const getTopStats = (character: UICharacter) => {
    const allStats = [
      ...Object.entries(character.stats.pitching).map(([key, value]) => ({ key, value })),
      ...Object.entries(character.stats.batting).map(([key, value]) => ({ key, value }))
    ];
    
    return allStats
      .filter(stat => stat.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 2);
  };
  
  const handleRemove = () => {
    if (character) {
      removeCharacterFromDeck(character.id);
    }
  };
  
  // Get background color based on character position
  const getBgColorClass = (position?: string) => {
    if (!position) return "";
    
    switch (position) {
      case "投手": return "bg-blue-100";
      case "捕手": return "bg-purple-100";
      case "内野": return "bg-yellow-100";
      case "外野": return "bg-red-100";
      default: return "bg-gray-100";
    }
  };
  
  if (character) {
    // Filled slot
    const topStats = getTopStats(character);
    
    return (
      <div className="deck-slot bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div className="flex">
          <div className={`w-14 h-14 rounded-lg ${getBgColorClass(character.position)} flex items-center justify-center overflow-hidden mr-3`}>
            <div className="flex items-center justify-center w-full h-full text-xl font-bold text-gray-600">
              {character.name.charAt(0)}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h3 className="font-rounded font-bold text-gray-800">{character.name}</h3>
              <button 
                className="text-gray-400 hover:text-[hsl(var(--gaming-red))]"
                onClick={handleRemove}
                aria-label="キャラクターを削除"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center space-x-1 mt-1 text-xs">
              <span className="stat-pill bg-[hsl(var(--gaming-blue))] text-white">Lv.{character.level}</span>
              {character.awakening > 0 && (
                <span className="stat-pill bg-[hsl(var(--gaming-purple))] text-white">覚醒{character.awakening}</span>
              )}
              <span 
                className={`stat-pill ${rarityColorMap[character.rarity]?.bg} ${rarityColorMap[character.rarity]?.text}`}
              >
                {character.rarity}
              </span>
              <span className="text-gray-600">{character.position}</span>
              {character.eventTiming && (
                <span className="text-gray-600 text-xs ml-1">{character.eventTiming}</span>
              )}
            </div>
            {/* 得意練習の表示 */}
            {character.specialTrainings && character.specialTrainings.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1 mb-2">
                {character.specialTrainings.map((training: any, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {String(training)}
                  </Badge>
                ))}
              </div>
            )}
            
            {/* トップステータスの表示 */}
            <div className="mt-2 flex flex-wrap gap-1 text-xs">
              {topStats.map((stat, index) => (
                <span 
                  key={index} 
                  className={`stat-pill ${statColorMap[stat.key as keyof typeof statColorMap]?.bg} ${statColorMap[stat.key as keyof typeof statColorMap]?.text}`}
                >
                  {statNames[stat.key as keyof typeof statNames]}+{stat.value}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Empty slot
  return (
    <div 
      ref={drop}
      className={`deck-slot border-2 border-dashed rounded-lg p-3 flex flex-col items-center justify-center
        ${isOver && canDrop ? 'border-[hsl(var(--gaming-blue))] bg-blue-50' : 'border-gray-300'}
      `}
    >
      <PlusCircle className="text-3xl text-gray-400 mb-2 h-6 w-6" />
      <p className="text-gray-500 text-sm">ここにキャラをドラッグ</p>
    </div>
  );
};

export default DeckSlot;
