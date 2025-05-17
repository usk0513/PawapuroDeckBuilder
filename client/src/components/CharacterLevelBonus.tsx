import React from 'react';
import { Badge } from "@/components/ui/badge";

interface LevelBonusRowProps {
  level: number;
  type: 'normal' | 'unique';
  children?: React.ReactNode;
}

/**
 * Lv.35の通常ボーナスと固有ボーナスを表示するコンポーネント
 */
export const LevelBonusRow: React.FC<LevelBonusRowProps> = ({ level, type, children }) => {
  return (
    <tr>
      <td className="border p-2 text-center font-medium">
        <div className="inline-flex items-center">
          Lv.{level} 
          {type === 'normal' ? (
            <Badge className="ml-2 bg-muted">通常ボーナス</Badge>
          ) : (
            <Badge className="ml-2 bg-blue-500 hover:bg-blue-600">固有ボーナス</Badge>
          )}
        </div>
      </td>
      {children}
    </tr>
  );
};