import React from "react";
import { Combo } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

interface ComboEffectProps {
  combo: Combo;
}

const ComboEffect: React.FC<ComboEffectProps> = ({ combo }) => {
  return (
    <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
      <div className="flex items-center mb-2">
        <Badge className="mr-2 bg-indigo-100 text-[hsl(var(--gaming-purple))] hover:bg-indigo-200">
          アクティブ
        </Badge>
        <h4 className="font-medium text-gray-800">{combo.name}</h4>
      </div>
      <p className="text-sm text-gray-600 mb-2">{combo.description}</p>
      <div className="flex flex-wrap gap-2 text-xs">
        {Object.entries(combo.effects).map(([effect, value], index) => (
          <span 
            key={index} 
            className={effect === "全ステータス" 
              ? "stat-pill bg-green-100 text-[hsl(var(--gaming-green))]" 
              : "stat-pill bg-blue-100 text-[hsl(var(--gaming-blue))]"}
          >
            {effect}+{value}{effect === "疲労回復" ? "%" : ""}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ComboEffect;
