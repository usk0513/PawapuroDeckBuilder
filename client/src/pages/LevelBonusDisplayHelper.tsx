import React from 'react';
import { Badge } from "@/components/ui/badge";

interface Level35RowProps {
  isNormalBonus?: boolean;
}

/**
 * Lv.35の通常ボーナスと固有ボーナス表示のためのヘルパーコンポーネント
 */
export const Level35Row: React.FC<Level35RowProps> = ({ isNormalBonus = true }) => {
  return (
    <div className="inline-flex items-center">
      Lv.35 {isNormalBonus ? (
        <Badge className="ml-2 bg-muted">通常ボーナス</Badge>
      ) : (
        <Badge className="ml-2 bg-blue-500 hover:bg-blue-600">固有ボーナス</Badge>
      )}
    </div>
  );
};