import React from 'react';
import { Badge } from "@/components/ui/badge";

/**
 * レベル35の通常ボーナスと固有ボーナスの表示方法を修正するヘルパーコンポーネント
 */
export const Level35Normal: React.FC = () => (
  <div className="inline-flex items-center">
    Lv.35 <Badge className="ml-2 bg-muted">通常ボーナス</Badge>
  </div>
);

export const Level35Unique: React.FC = () => (
  <div className="inline-flex items-center">
    Lv.35 <Badge className="ml-2 bg-blue-500 hover:bg-blue-600">固有ボーナス</Badge>
  </div>
);

/**
 * 使用方法の説明:
 * 
 * 現在のAdminPage.tsxにある以下のようなコード:
 * 
 * {level === 35 ? (
 *   <>
 *     <div className="inline-flex items-center mb-1">
 *       Lv.35 <Badge className="ml-2 bg-muted">通常ボーナス</Badge>
 *     </div>
 *     <div className="inline-flex items-center">
 *       Lv.35 <Badge className="ml-2 bg-blue-500 hover:bg-blue-600">固有ボーナス</Badge>
 *     </div>
 *   </>
 * ) : (
 * 
 * を以下のように別々の行に分けて表示します:
 * 
 * レベル35を含むリストを変更:
 * 
 * const displayLevels = [1, 5, 10, ..., 35, ...].flatMap(level => 
 *   level === 35 ? [35, 35.5] : [level]
 * );
 * 
 * 表示ロジックを変更:
 * 
 * {level === 35 ? (
 *   <Level35Normal />
 * ) : level === 35.5 ? (
 *   <Level35Unique />
 * ) : (
 *   <div className="inline-flex items-center">
 *     Lv.{level}
 *     {level === 37 && <Badge className="ml-2">SR専用</Badge>}
 *     {(level === 42 || level === 50) && <Badge className="ml-2">PSR専用</Badge>}
 *   </div>
 * )}
 */