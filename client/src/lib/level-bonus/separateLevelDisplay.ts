/**
 * レベル表示ユーティリティ
 */

/**
 * 表示用のレベルリストを生成する
 * レベル35は通常ボーナス(35)と固有ボーナス(35.5)に分けて表示
 */
export function getDisplayLevels(levels: number[]): number[] {
  const result: number[] = [];
  
  for (const level of levels) {
    if (level === 35) {
      // レベル35は通常と固有に分けて表示
      result.push(35);   // 通常ボーナス用
      result.push(35.5); // 固有ボーナス用
    } else {
      result.push(level);
    }
  }
  
  return result;
}

/**
 * 表示用レベルが通常ボーナスかどうかを判定
 */
export function isNormalBonus(level: number): boolean {
  return level === 35;
}

/**
 * 表示用レベルが固有ボーナスかどうかを判定
 */
export function isUniqueBonus(level: number): boolean {
  return level === 35.5;
}

/**
 * 表示用レベルから実際のDBに保存するレベルに変換
 */
export function getActualLevel(displayLevel: number): number {
  // 35.5は内部的には35として扱う
  return displayLevel === 35.5 ? 35 : displayLevel;
}