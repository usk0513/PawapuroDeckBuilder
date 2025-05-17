import { BonusEffectType } from "@shared/schema";

// 効果タイプによる単位の定義
export const effectTypeUnits: Record<string, string> = {
  [BonusEffectType.INITIAL_RATING]: "",  // 数値(0~100)
  [BonusEffectType.TAG_BONUS]: "%",
  [BonusEffectType.KOTS_EVENT_BONUS]: "%",
  [BonusEffectType.MATCH_EXPERIENCE_BONUS]: "%",
  [BonusEffectType.TRAINING_RATE_UP]: "%",
  [BonusEffectType.TRAINING_EFFECT_UP]: "%",
  [BonusEffectType.KOTS_EVENT_RATE_UP]: "%",
  [BonusEffectType.MOTIVATION_EFFECT_UP]: "%",
  [BonusEffectType.TRAINING_STAMINA_CONSUMPTION_DOWN]: "%",
  [BonusEffectType.EVENT_STAMINA_RECOVERY_UP]: "%",
  [BonusEffectType.EVENT_BONUS]: "%",
  [BonusEffectType.KOTS_LEVEL_BONUS]: "",  // 数値(1~5)
  [BonusEffectType.LIMIT_UP_MEET]: "",  // 数値(1~100)
  [BonusEffectType.LIMIT_UP_POWER]: "",
  [BonusEffectType.LIMIT_UP_SPEED]: "",
  [BonusEffectType.LIMIT_UP_ARM]: "",
  [BonusEffectType.LIMIT_UP_FIELDING]: "",
  [BonusEffectType.LIMIT_UP_CATCHING]: "",
  [BonusEffectType.LIMIT_UP_VELOCITY]: "",
  [BonusEffectType.LIMIT_UP_CONTROL]: "",
  [BonusEffectType.LIMIT_UP_STAMINA]: "",
  [BonusEffectType.BASE_BONUS_STRENGTH]: "",
  [BonusEffectType.BASE_BONUS_AGILITY]: "",
  [BonusEffectType.BASE_BONUS_TECHNIQUE]: "",
  [BonusEffectType.BASE_BONUS_CHANGE]: "",
  [BonusEffectType.BASE_BONUS_MENTAL]: "",
  [BonusEffectType.REFORM_STRENGTH_AGILITY]: "",
  [BonusEffectType.REFORM_RUNNING_MENTAL]: "",
  [BonusEffectType.REFORM_CONTROL_CHANGE]: "",
  [BonusEffectType.REFORM_STAMINA_CHANGE]: "",
  // 基礎コツボーナス（単位なし）
  [BonusEffectType.BASE_KOTS_MEET]: "",
  [BonusEffectType.BASE_KOTS_POWER]: "",
  [BonusEffectType.BASE_KOTS_SPEED]: "",
  [BonusEffectType.BASE_KOTS_ARM]: "",
  [BonusEffectType.BASE_KOTS_FIELDING]: "",
  [BonusEffectType.BASE_KOTS_CATCHING]: "",
  [BonusEffectType.BASE_KOTS_VELOCITY]: "",
  [BonusEffectType.BASE_KOTS_CONTROL]: "",
  [BonusEffectType.BASE_KOTS_STAMINA]: "",
  // サポートデッキ専用効果
  [BonusEffectType.MAX_AWAKENINGS]: "回",
  [BonusEffectType.EXPERIENCE_POINT_CAP_UP]: "点",
  // Lv35専用固有アイテム効果
  [BonusEffectType.UNIQUE_ITEM]: "",
};

// LV35の固有ボーナスかどうかを判定する関数
export const isLv35UniqueBonus = (level: number): boolean => {
  return level === 35;
};

// 効果値に単位を自動で付加する関数
export const formatEffectValue = (value: string, effectType?: string, level?: number, isAwakening?: boolean): string => {
  if (!effectType) return value;
  const unit = effectTypeUnits[effectType] || "";
  
  // 1. 値が既に+で始まる場合は追加効果として表示
  if (value.startsWith("+")) {
    return `${value}${unit}`;
  }
  
  // 2. 覚醒ボーナスの場合は+を付けて表示
  if (isAwakening) {
    return `+${value}${unit}`;
  }
  
  // 3. LV35固有ボーナスの場合は+を付けて表示
  if (level === 35 && effectType === BonusEffectType.UNIQUE_ITEM) {
    return `+${value}${unit}`;
  }
  
  // 4. それ以外は通常の値として表示
  return `${value}${unit}`;
};

// BonusEffectTypeの選択肢を整理して表示するための関数
export const getBonusEffectTypeOptions = () => {
  // グループ分けするための定義
  const groups = {
    basic: {
      title: "基本効果",
      items: [
        BonusEffectType.INITIAL_RATING,
        BonusEffectType.TAG_BONUS,
        BonusEffectType.KOTS_EVENT_BONUS,
        BonusEffectType.MATCH_EXPERIENCE_BONUS,
        BonusEffectType.TRAINING_RATE_UP,
        BonusEffectType.TRAINING_EFFECT_UP,
        BonusEffectType.KOTS_EVENT_RATE_UP,
        BonusEffectType.MOTIVATION_EFFECT_UP,
        BonusEffectType.TRAINING_STAMINA_CONSUMPTION_DOWN,
        BonusEffectType.EVENT_STAMINA_RECOVERY_UP,
        BonusEffectType.EVENT_BONUS,
        BonusEffectType.KOTS_LEVEL_BONUS,
      ]
    },
    limit: {
      title: "能力上限効果",
      items: [
        BonusEffectType.LIMIT_UP_MEET,
        BonusEffectType.LIMIT_UP_POWER,
        BonusEffectType.LIMIT_UP_SPEED,
        BonusEffectType.LIMIT_UP_ARM,
        BonusEffectType.LIMIT_UP_FIELDING,
        BonusEffectType.LIMIT_UP_CATCHING,
        BonusEffectType.LIMIT_UP_VELOCITY,
        BonusEffectType.LIMIT_UP_CONTROL,
        BonusEffectType.LIMIT_UP_STAMINA,
      ]
    },
    baseBonus: {
      title: "基礎ボーナス",
      items: [
        BonusEffectType.BASE_BONUS_STRENGTH,
        BonusEffectType.BASE_BONUS_AGILITY,
        BonusEffectType.BASE_BONUS_TECHNIQUE,
        BonusEffectType.BASE_BONUS_CHANGE,
        BonusEffectType.BASE_BONUS_MENTAL,
      ]
    },
    reform: {
      title: "練習改革効果",
      items: [
        BonusEffectType.REFORM_STRENGTH_AGILITY,
        BonusEffectType.REFORM_RUNNING_MENTAL,
        BonusEffectType.REFORM_CONTROL_CHANGE,
        BonusEffectType.REFORM_STAMINA_CHANGE,
      ]
    },
    baseKots: {
      title: "基礎コツ効果",
      items: [
        BonusEffectType.BASE_KOTS_MEET,
        BonusEffectType.BASE_KOTS_POWER,
        BonusEffectType.BASE_KOTS_SPEED,
        BonusEffectType.BASE_KOTS_ARM,
        BonusEffectType.BASE_KOTS_FIELDING,
        BonusEffectType.BASE_KOTS_CATCHING,
        BonusEffectType.BASE_KOTS_VELOCITY,
        BonusEffectType.BASE_KOTS_CONTROL,
        BonusEffectType.BASE_KOTS_STAMINA,
      ]
    },
    support: {
      title: "サポートデッキ専用効果",
      items: [
        BonusEffectType.MAX_AWAKENINGS,
        BonusEffectType.EXPERIENCE_POINT_CAP_UP,
      ]
    },
    uniqueItem: {
      title: "固有アイテム効果",
      items: [
        BonusEffectType.UNIQUE_ITEM,
      ]
    }
  };

  const options: { label: string; value: string; group?: string }[] = [];
  
  // グループごとにオプションを追加
  Object.entries(groups).forEach(([groupKey, group]) => {
    group.items.forEach(item => {
      options.push({
        value: item,
        label: item,
        group: group.title
      });
    });
  });
  
  return options;
};

// BonusEffectTypeの選択肢
export const bonusEffectTypeOptions = getBonusEffectTypeOptions();