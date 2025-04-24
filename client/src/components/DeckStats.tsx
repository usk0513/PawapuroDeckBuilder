import React from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatsDetail from "@/components/StatsDetail";
import ComboEffect from "@/components/ComboEffect";
import { useDeck } from "@/contexts/DeckContext";
import { MAX_DECK_SIZE } from "@/lib/constants";

const DeckStats: React.FC = () => {
  const { 
    deckCharacters, 
    activeCombos,
    calculateStats 
  } = useDeck();
  
  const totalStats = calculateStats();
  
  // Calculate category totals
  const pitchingTotal = totalStats.velocity + totalStats.control + totalStats.stamina + totalStats.breaking;
  const battingTotal = totalStats.contact + totalStats.power + totalStats.speed;
  const fieldingTotal = totalStats.arm + totalStats.fielding;
  const speedTotal = totalStats.speed;
  
  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-rounded font-bold text-xl text-gray-800">デッキステータス</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-600">
            キャラ {deckCharacters.length}/{MAX_DECK_SIZE}
          </span>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
          <h3 className="text-[hsl(var(--gaming-blue))] font-medium text-sm mb-1">投手能力</h3>
          <div className="flex justify-between">
            <span className="text-xl font-bold text-gray-800">+{pitchingTotal}</span>
            <span className="text-sm text-green-600">+{pitchingTotal > 0 ? Math.floor(pitchingTotal / 2) : 0}</span>
          </div>
        </div>
        <div className="bg-red-50 rounded-lg p-3 border border-red-100">
          <h3 className="text-[hsl(var(--gaming-red))] font-medium text-sm mb-1">打撃能力</h3>
          <div className="flex justify-between">
            <span className="text-xl font-bold text-gray-800">+{battingTotal}</span>
            <span className="text-sm text-green-600">+{battingTotal > 0 ? Math.floor(battingTotal / 2) : 0}</span>
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-3 border border-green-100">
          <h3 className="text-[hsl(var(--gaming-green))] font-medium text-sm mb-1">守備能力</h3>
          <div className="flex justify-between">
            <span className="text-xl font-bold text-gray-800">+{fieldingTotal}</span>
            <span className="text-sm text-green-600">+{fieldingTotal > 0 ? Math.floor(fieldingTotal / 2) : 0}</span>
          </div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-100">
          <h3 className="text-yellow-600 font-medium text-sm mb-1">走力</h3>
          <div className="flex justify-between">
            <span className="text-xl font-bold text-gray-800">+{speedTotal}</span>
            <span className="text-sm text-green-600">+{speedTotal > 0 ? Math.floor(speedTotal / 2) : 0}</span>
          </div>
        </div>
      </div>
      
      {/* Detailed Stats */}
      <div className="mb-4">
        <h3 className="font-rounded font-bold text-lg text-gray-800 mb-3">詳細ステータス</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pitcher Stats */}
          <StatsDetail 
            title="投手能力" 
            titleColor="text-[hsl(var(--gaming-blue))]"
            stats={[
              { name: "球速", value: totalStats.velocity, color: "bg-[hsl(var(--gaming-blue))]" },
              { name: "制球", value: totalStats.control, color: "bg-[hsl(var(--gaming-blue))]" },
              { name: "スタミナ", value: totalStats.stamina, color: "bg-[hsl(var(--gaming-blue))]" },
              { name: "変化球", value: totalStats.breaking, color: "bg-[hsl(var(--gaming-blue))]" }
            ]}
          />
          
          {/* Batter Stats */}
          <StatsDetail 
            title="打者能力" 
            titleColor="text-[hsl(var(--gaming-red))]"
            stats={[
              { name: "ミート", value: totalStats.contact, color: "bg-[hsl(var(--gaming-red))]" },
              { name: "パワー", value: totalStats.power, color: "bg-[hsl(var(--gaming-red))]" },
              { name: "走力", value: totalStats.speed, color: "bg-[hsl(var(--gaming-red))]" },
              { name: "肩力", value: totalStats.arm, color: "bg-[hsl(var(--gaming-red))]" },
              { name: "守備", value: totalStats.fielding, color: "bg-[hsl(var(--gaming-red))]" }
            ]}
          />
        </div>
      </div>
      
      {/* Combination Effects */}
      <div>
        <h3 className="font-rounded font-bold text-lg text-gray-800 mb-3">コンボ効果</h3>
        
        {activeCombos.length > 0 ? (
          <div className="space-y-3">
            {activeCombos.map(combo => (
              <ComboEffect key={combo.id} combo={combo} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
            デッキに特定の組み合わせを追加することで、コンボ効果が発動します。
          </div>
        )}
      </div>
    </div>
  );
};

export default DeckStats;
