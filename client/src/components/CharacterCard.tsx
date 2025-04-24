import React from "react";
import { Character, statColorMap, statNames, rarityColorMap } from "@/lib/constants";
import { useDeck } from "@/contexts/DeckContext";
import { Star, StarOff } from "lucide-react";
import { useDrag } from "react-dnd";

interface CharacterCardProps {
  character: Character;
  inDeck?: boolean;
}

const CharacterCard: React.FC<CharacterCardProps> = ({ character, inDeck = false }) => {
  const { addCharacterToDeck, removeCharacterFromDeck } = useDeck();
  
  // Configure drag and drop
  const [{ isDragging }, drag] = useDrag({
    type: "character",
    item: { id: character.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    // Added end monitor to avoid re-renders that cause issues
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      // We only process the drop in the deck builder's drop handler
      return;
    },
  });
  
  // Get top 3 stats for display
  const getTopStats = (character: Character) => {
    const allStats = [
      ...Object.entries(character.stats.pitching).map(([key, value]) => ({ key, value })),
      ...Object.entries(character.stats.batting).map(([key, value]) => ({ key, value }))
    ];
    
    return allStats
      .filter(stat => stat.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);
  };
  
  const topStats = getTopStats(character);
  
  // Get image bg color based on position
  const getBgColorClass = () => {
    switch (character.position) {
      case "投手": return "bg-blue-100";
      case "捕手": return "bg-purple-100";
      case "内野": return "bg-yellow-100";
      case "外野": return "bg-red-100";
      default: return "bg-gray-100";
    }
  };
  
  // Get rating stars
  const renderRatingStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= character.rating) {
        stars.push(<Star key={i} className="text-yellow-400 h-3.5 w-3.5" />);
      } else {
        stars.push(<StarOff key={i} className="text-gray-300 h-3.5 w-3.5" />);
      }
    }
    return stars;
  };
  
  const handleClick = () => {
    if (inDeck) {
      removeCharacterFromDeck(character.id);
    } else {
      addCharacterToDeck(character.id);
    }
  };
  
  return (
    <div 
      ref={drag}
      className={`character-card bg-white rounded-lg shadow-sm border border-gray-200 ${isDragging ? 'opacity-50' : ''}`}
      draggable
      onClick={inDeck ? handleClick : undefined}
    >
      <div className="flex p-3">
        <div className={`w-16 h-16 rounded-lg ${getBgColorClass()} flex items-center justify-center overflow-hidden mr-3`}>
          <div className="flex items-center justify-center w-full h-full text-2xl font-bold text-gray-600">
            {character.name.charAt(0)}
          </div>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-rounded font-bold text-gray-800">{character.name}</h3>
            <div className="flex space-x-1">
              <span className="stat-pill bg-[hsl(var(--gaming-blue))] text-white">Lv.{character.level}</span>
              {character.awakening > 0 && (
                <span className="stat-pill bg-[hsl(var(--gaming-purple))] text-white">覚醒{character.awakening}</span>
              )}
            </div>
          </div>
          <div className="flex justify-between mt-1 text-sm">
            <div className="flex items-center space-x-1">
              <span className="text-gray-600">{character.position}</span>
              <span 
                className={`stat-pill ${rarityColorMap[character.rarity]?.bg} ${rarityColorMap[character.rarity]?.text}`}
              >
                {character.rarity}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              {renderRatingStars()}
            </div>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-1 text-xs">
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
};

export default CharacterCard;
