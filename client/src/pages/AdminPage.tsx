import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  CharacterType, 
  EventTiming, 
  BonusEffectType, 
  Rarity, 
  PlayerType,
  SpecialAbilityChoiceType,
  insertCharacterSchema, 
  insertCharacterLevelBonusSchema, 
  insertCharacterAwakeningBonusSchema,
  insertSpecialAbilitySchema,
  insertCharacterSpecialAbilitySetSchema,
  insertSpecialAbilitySetItemSchema
} from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Trash, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  positionOptions, 
  specialTrainingOptions, 
  eventTimingOptions, 
  uniqueBonusItems,
  characterRoleOptions,
  CharacterRole
} from "@/lib/constants";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// 管理者向けキャラクター作成スキーマ
const characterSchema = insertCharacterSchema.extend({});
type CharacterFormValues = z.infer<typeof characterSchema>;

// レベルボーナス登録用スキーマ
const levelBonusSchema = insertCharacterLevelBonusSchema.extend({});
type LevelBonusFormValues = z.infer<typeof levelBonusSchema>;

// 覚醒ボーナス登録用スキーマ
const awakeningBonusSchema = insertCharacterAwakeningBonusSchema.extend({});
type AwakeningBonusFormValues = z.infer<typeof awakeningBonusSchema>;

// 金特登録用スキーマ
const specialAbilitySchema = insertSpecialAbilitySchema.extend({});
type SpecialAbilityFormValues = z.infer<typeof specialAbilitySchema>;

// 金特セット登録用スキーマ
const characterSpecialAbilitySetSchema = insertCharacterSpecialAbilitySetSchema.extend({});
type CharacterSpecialAbilitySetFormValues = z.infer<typeof characterSpecialAbilitySetSchema>;

// 金特セットアイテム登録用スキーマ
// スキーマを修正：orderフィールドを不要にし、specialAbilityIdのみ必須に
const specialAbilitySetItemSchema = z.object({
  setId: z.number(),
  specialAbilityId: z.number(),
  customName: z.string().optional(),
});
type SpecialAbilitySetItemFormValues = z.infer<typeof specialAbilitySetItemSchema>;

// 効果タイプによる単位の定義
const effectTypeUnits: Record<string, string> = {
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
const isLv35UniqueBonus = (level: number): boolean => {
  return level === 35;
};

// 効果値に単位を自動で付加する関数
const formatEffectValue = (value: string, effectType?: string, level?: number, isAwakening?: boolean): string => {
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
const getBonusEffectTypeOptions = () => {
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
const bonusEffectTypeOptions = getBonusEffectTypeOptions();

// 友情特殊能力のフォーム用のスキーマとタイプ定義
type FriendshipAbilityFormValues = {
  characterId: number;
  playerType: PlayerType;
  name: string;
}

const friendshipAbilitySchema = z.object({
  characterId: z.number().min(1, "キャラクターを選択してください"),
  playerType: z.nativeEnum(PlayerType, { message: "プレイヤータイプを選択してください" }),
  name: z.string().min(1, "友情特殊能力名を入力してください"),
});

export default function AdminPage() {
  const { toast } = useToast();
  const [selectedCharacter, setSelectedCharacter] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>("character");
  const [selectedRarity, setSelectedRarity] = useState<string>("");
  const [levelBonusRarity, setLevelBonusRarity] = useState<Record<number, string>>({});
  const [levelBonusEffect, setLevelBonusEffect] = useState<Record<number, string>>({});
  const [levelBonusValue, setLevelBonusValue] = useState<Record<number, string>>({});
  const [isBatchSubmitting, setIsBatchSubmitting] = useState(false);
  
  // 覚醒ボーナス関連の状態
  const [awakeningEffect, setAwakeningEffect] = useState<string>("");
  const [awakeningValue, setAwakeningValue] = useState<string>("");
  const [awakeningType, setAwakeningType] = useState<string>("initial"); // 'initial' or 'second'
  
  // 友情特殊能力関連の状態
  const [friendshipPlayerType, setFriendshipPlayerType] = useState<PlayerType>(PlayerType.PITCHER);
  
  // 金特関連の状態
  const [selectedSpecialAbility, setSelectedSpecialAbility] = useState<number | null>(null);
  const [selectedPlayerType, setSelectedPlayerType] = useState<PlayerType | string>("_all");
  const [selectedAbilitySetId, setSelectedAbilitySetId] = useState<number | null>(null);
  const [abilitySearchTerm, setAbilitySearchTerm] = useState<string>("");
  const [characterSearchTerm, setCharacterSearchTerm] = useState<string>("");

  // キャラクターデータの取得
  const { data: characters = [], isLoading } = useQuery({
    queryKey: ["/api/characters"],
    queryFn: async () => {
      const res = await fetch("/api/characters");
      if (!res.ok) throw new Error("キャラクターデータの取得に失敗しました");
      return await res.json();
    }
  });

  // レベルボーナスデータの取得
  const { data: levelBonuses = [], isLoading: isLoadingBonuses } = useQuery({
    queryKey: ["/api/character-level-bonuses", selectedCharacter, selectedRarity],
    queryFn: async () => {
      if (!selectedCharacter) return [];
      let url = `/api/character-level-bonuses?characterId=${selectedCharacter}`;
      if (selectedRarity) {
        url += `&rarity=${selectedRarity}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error("レベルボーナスデータの取得に失敗しました");
      return await res.json();
    },
    enabled: !!selectedCharacter,
  });
  
  // 覚醒ボーナスデータの取得
  const { data: awakeningBonuses = [], isLoading: isLoadingAwakeningBonuses } = useQuery({
    queryKey: ["/api/character-awakening-bonuses", selectedCharacter],
    queryFn: async () => {
      if (!selectedCharacter) return [];
      try {
        const url = `/api/character-awakening-bonuses?characterId=${selectedCharacter}`;
        const res = await fetch(url);
        if (!res.ok) {
          console.error("覚醒ボーナスデータの取得に失敗しました: ", await res.text());
          return [];
        }
        return await res.json();
      } catch (error) {
        console.error("覚醒ボーナス取得エラー:", error);
        return [];
      }
    },
    enabled: !!selectedCharacter,
  });
  
  // 金特データの取得
  const { data: specialAbilities = [], isLoading: isLoadingSpecialAbilities } = useQuery({
    queryKey: ["/api/special-abilities"],
    queryFn: async () => {
      const res = await fetch("/api/special-abilities");
      if (!res.ok) throw new Error("金特データの取得に失敗しました");
      return await res.json();
    }
  });
  
  // 金特セットデータの取得
  const { data: specialAbilitySets = [], isLoading: isLoadingSpecialAbilitySets } = useQuery({
    queryKey: ["/api/character-special-ability-sets", selectedCharacter, selectedPlayerType],
    queryFn: async () => {
      if (!selectedCharacter) return [];
      let url = `/api/character-special-ability-sets?characterId=${selectedCharacter}`;
      if (selectedPlayerType) {
        url += `&playerType=${selectedPlayerType}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error("金特セットデータの取得に失敗しました");
      return await res.json();
    },
    enabled: !!selectedCharacter,
  });

  // キャラクター作成ミューテーション
  const createCharacterMutation = useMutation({
    mutationFn: async (data: CharacterFormValues) => {
      const res = await apiRequest("POST", "/api/characters", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "キャラクター作成に失敗しました");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/characters"] });
      toast({
        title: "キャラクター作成",
        description: "新しいキャラクターが作成されました",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // キャラクター更新ミューテーション
  const updateCharacterMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CharacterFormValues }) => {
      const res = await apiRequest("PATCH", `/api/characters/${id}`, data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "キャラクター更新に失敗しました");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/characters"] });
      toast({
        title: "キャラクター更新",
        description: "キャラクターが更新されました",
      });
      setSelectedCharacter(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // キャラクター削除ミューテーション
  const deleteCharacterMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/characters/${id}`);
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "キャラクター削除に失敗しました");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/characters"] });
      toast({
        title: "キャラクター削除",
        description: "キャラクターが削除されました",
      });
      if (selectedCharacter) {
        setSelectedCharacter(null);
        form.reset();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const form = useForm<CharacterFormValues>({
    resolver: zodResolver(characterSchema),
    defaultValues: {
      name: "",
      position: CharacterType.PITCHER,
      specialTrainings: [],
      eventTiming: undefined,
      stats: {
        pitching: {
          velocity: 0,
          control: 0,
          stamina: 0,
          breaking: 0,
        },
        batting: {
          contact: 0,
          power: 0,
          speed: 0,
          arm: 0,
          fielding: 0,
        }
      }
    }
  });

  // レベルボーナス用フォーム
  const levelBonusForm = useForm<LevelBonusFormValues>({
    resolver: zodResolver(levelBonusSchema),
    defaultValues: {
      characterId: selectedCharacter || undefined,
      level: 1,
      effectType: undefined,
      value: "",
      rarity: undefined,
      description: "",
    }
  });
  
  // 覚醒ボーナス用フォーム
  const awakeningBonusForm = useForm<AwakeningBonusFormValues>({
    resolver: zodResolver(awakeningBonusSchema),
    defaultValues: {
      characterId: selectedCharacter || undefined,
      effectType: undefined,
      value: "",
      awakeningType: "initial", // 'initial'(初回覚醒) or 'second'(2回目覚醒)
    }
  });
  
  // 金特用フォーム
  const specialAbilityForm = useForm<SpecialAbilityFormValues>({
    resolver: zodResolver(specialAbilitySchema),
    defaultValues: {
      name: "",
      playerType: PlayerType.PITCHER,
      description: "",
    }
  });
  
  // 金特セット用フォーム
  const specialAbilitySetForm = useForm<CharacterSpecialAbilitySetFormValues>({
    resolver: zodResolver(characterSpecialAbilitySetSchema),
    defaultValues: {
      characterId: selectedCharacter || undefined,
      playerType: PlayerType.PITCHER,
      choiceType: SpecialAbilityChoiceType.TYPE_A,
      name: "",
      description: ""
    },
    mode: 'onChange'
  });
  
  // 金特セットアイテム用フォーム
  const specialAbilitySetItemForm = useForm<SpecialAbilitySetItemFormValues>({
    resolver: zodResolver(specialAbilitySetItemSchema),
    defaultValues: {
      setId: undefined,
      specialAbilityId: undefined,
      customName: "",
    },
    mode: 'onChange'
  });
  
  // フォーム値変更時のデバッグ
  useEffect(() => {
    const subscription = awakeningBonusForm.watch((value, { name, type }) => {
      console.log("フォーム値変更:", name, value);
    });
    return () => subscription.unsubscribe();
  }, [awakeningBonusForm]);
  
  // 友情特殊能力用フォーム
  const friendshipAbilityForm = useForm<FriendshipAbilityFormValues>({
    resolver: zodResolver(friendshipAbilitySchema),
    defaultValues: {
      characterId: selectedCharacter || undefined,
      playerType: PlayerType.PITCHER,
      name: ""
    }
  });

  // 友情特殊能力データの取得
  const { data: friendshipAbilities = [], isLoading: isLoadingFriendshipAbilities } = useQuery({
    queryKey: ["/api/character-friendship-abilities", selectedCharacter],
    queryFn: async () => {
      if (!selectedCharacter) return [];
      try {
        const url = `/api/character-friendship-abilities?characterId=${selectedCharacter}`;
        const res = await fetch(url);
        if (!res.ok) {
          console.error("友情特殊能力データの取得に失敗しました: ", await res.text());
          return [];
        }
        return await res.json();
      } catch (error) {
        console.error("友情特殊能力取得エラー:", error);
        return [];
      }
    },
    enabled: !!selectedCharacter,
  });

  // 初期化: フォームのcharacterIdを更新
  useEffect(() => {
    if (selectedCharacter) {
      awakeningBonusForm.setValue("characterId", selectedCharacter);
      friendshipAbilityForm.setValue("characterId", selectedCharacter);
      console.log("キャラクターIDを設定:", selectedCharacter);
    }
  }, [selectedCharacter, awakeningBonusForm, friendshipAbilityForm]);
  
  // 覚醒タイプを自動設定 (初回覚醒が登録済みの場合は二回目覚醒を強制的に選択)
  useEffect(() => {
    if (awakeningBonuses && awakeningBonuses.length > 0) {
      // 初回覚醒が既に登録されているか確認
      const hasInitialAwakening = awakeningBonuses.some((bonus: { awakeningType: string }) => bonus.awakeningType === "initial");
      
      if (hasInitialAwakening) {
        // 初回覚醒が登録済みの場合、二回目覚醒を選択
        awakeningBonusForm.setValue("awakeningType", "second");
      }
    }
  }, [awakeningBonuses, awakeningBonusForm]);
  
  // 金特セットフォームのキャラクターIDとプレイヤータイプを更新
  useEffect(() => {
    if (selectedCharacter) {
      specialAbilitySetForm.setValue("characterId", selectedCharacter);
    }
    if (selectedPlayerType && selectedPlayerType !== "_all" && selectedPlayerType !== "") {
      specialAbilitySetForm.setValue("playerType", selectedPlayerType);
    }
  }, [selectedCharacter, selectedPlayerType, specialAbilitySetForm]);
  
  // レベルボーナス追加ミューテーション
  const createLevelBonusMutation = useMutation({
    mutationFn: async (data: LevelBonusFormValues) => {
      const res = await apiRequest("POST", "/api/character-level-bonuses", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "レベルボーナス追加に失敗しました");
      }
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/character-level-bonuses", selectedCharacter, selectedRarity] 
      });
      
      const rarityText = data.rarity ? `（${data.rarity}専用）` : "";
      toast({
        title: "レベルボーナス追加",
        description: `Lv.${data.level}の${data.effectType}${rarityText}ボーナスが追加されました`,
      });
      
      // クリア - 効果タイプと値を完全に削除
      setLevelBonusEffect((prev) => {
        const updated = { ...prev };
        delete updated[data.level]; // 効果タイプを完全に削除
        return updated;
      });
      setLevelBonusValue((prev) => {
        const updated = { ...prev };
        delete updated[data.level]; // 値を完全に削除
        return updated;
      });
      
      // フォームリセット
      levelBonusForm.reset({
        characterId: selectedCharacter || undefined,
        level: data.level, // 同じレベルを保持
        effectType: undefined,
        value: "",
        description: "",
        rarity: undefined
      });
    },
    onError: (error: Error) => {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // レベルボーナス削除ミューテーション
  const deleteLevelBonusMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/character-level-bonuses/${id}`);
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "レベルボーナス削除に失敗しました");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/character-level-bonuses", selectedCharacter, selectedRarity]
      });
      toast({
        title: "レベルボーナス削除",
        description: "レベルボーナスが削除されました",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // 覚醒ボーナス追加ミューテーション
  const createAwakeningBonusMutation = useMutation({
    mutationFn: async (data: AwakeningBonusFormValues) => {
      // 値に+を付ける。すでに付いていない場合のみ。
      const modifiedData = {
        ...data,
        value: data.value && !data.value.startsWith('+') ? `+${data.value}` : data.value
      };
      
      const res = await apiRequest("POST", "/api/character-awakening-bonuses", modifiedData);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "覚醒ボーナス追加に失敗しました");
      }
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/character-awakening-bonuses", selectedCharacter] 
      });
      
      const awakeningTypeText = data.awakeningType === "initial" ? "初回覚醒" : "二回目覚醒";
      toast({
        title: "覚醒ボーナス追加",
        description: `${awakeningTypeText}の${data.effectType}ボーナスが追加されました`,
      });
      
      // クリア
      setAwakeningEffect("");
      setAwakeningValue("");
      
      // フォームリセット
      awakeningBonusForm.reset({
        characterId: selectedCharacter || undefined,
        effectType: undefined,
        value: "",
        awakeningType: data.awakeningType,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // 覚醒ボーナス削除ミューテーション
  const deleteAwakeningBonusMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/character-awakening-bonuses/${id}`);
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "覚醒ボーナス削除に失敗しました");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/character-awakening-bonuses", selectedCharacter]
      });
      toast({
        title: "覚醒ボーナス削除",
        description: "覚醒ボーナスが削除されました",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // 友情特殊能力追加ミューテーション
  const createFriendshipAbilityMutation = useMutation({
    mutationFn: async (data: FriendshipAbilityFormValues) => {
      const res = await apiRequest("POST", "/api/character-friendship-abilities", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "友情特殊能力追加に失敗しました");
      }
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/character-friendship-abilities", selectedCharacter] 
      });
      
      toast({
        title: "友情特殊能力追加",
        description: `${data.playerType}用の友情特殊能力が追加されました`,
      });
      
      // フォームリセット
      friendshipAbilityForm.reset({
        characterId: selectedCharacter || undefined,
        playerType: data.playerType,
        name: "",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // 友情特殊能力削除ミューテーション
  const deleteFriendshipAbilityMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/character-friendship-abilities/${id}`);
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "友情特殊能力削除に失敗しました");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/character-friendship-abilities", selectedCharacter]
      });
      toast({
        title: "友情特殊能力削除",
        description: "友情特殊能力が削除されました",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // 金特作成ミューテーション
  const createSpecialAbilityMutation = useMutation({
    mutationFn: async (data: SpecialAbilityFormValues) => {
      const res = await apiRequest("POST", "/api/special-abilities", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "金特作成に失敗しました");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/special-abilities"] });
      toast({
        title: "金特作成",
        description: "新しい金特が作成されました",
      });
      specialAbilityForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // 金特削除ミューテーション
  const deleteSpecialAbilityMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/special-abilities/${id}`);
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "金特削除に失敗しました");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/special-abilities"] });
      toast({
        title: "金特削除",
        description: "金特が削除されました",
      });
      setSelectedSpecialAbility(null);
    },
    onError: (error: Error) => {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // 金特セット作成ミューテーション
  const createSpecialAbilitySetMutation = useMutation({
    mutationFn: async (data: CharacterSpecialAbilitySetFormValues) => {
      const res = await apiRequest("POST", "/api/character-special-ability-sets", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "金特セット作成に失敗しました");
      }
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/character-special-ability-sets", selectedCharacter, selectedPlayerType] 
      });
      toast({
        title: "金特セット作成",
        description: `${data.choiceType}の金特セットが作成されました`,
      });
      setSelectedAbilitySetId(data.id);
      specialAbilitySetForm.reset({
        characterId: selectedCharacter || undefined,
        playerType: data.playerType,
        choiceType: data.choiceType,
        name: "",
        description: ""
      });
    },
    onError: (error: Error) => {
      // エラーメッセージに"既に同じルート"という文字列が含まれる場合は特別なエラーメッセージを表示
      if (error.message.includes("既に同じルート")) {
        toast({
          title: "重複エラー",
          description: "同じキャラクター・タイプ・ルートの組み合わせの金特セットは一つしか作成できません",
          variant: "destructive",
        });
      } else {
        toast({
          title: "エラー",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  });
  
  // 金特セット削除ミューテーション
  const deleteSpecialAbilitySetMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/character-special-ability-sets/${id}`);
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "金特セット削除に失敗しました");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/character-special-ability-sets", selectedCharacter, selectedPlayerType]
      });
      toast({
        title: "金特セット削除",
        description: "金特セットが削除されました",
      });
      setSelectedAbilitySetId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // 金特セットアイテム追加ミューテーション
  const addSpecialAbilityToSetMutation = useMutation({
    mutationFn: async (data: SpecialAbilitySetItemFormValues) => {
      const res = await apiRequest("POST", "/api/special-ability-set-items", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "金特セットへの金特追加に失敗しました");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/character-special-ability-sets", selectedCharacter, selectedPlayerType] 
      });
      toast({
        title: "金特追加",
        description: "金特セットに金特が追加されました",
      });
      specialAbilitySetItemForm.reset({
        setId: selectedAbilitySetId || undefined,
        specialAbilityId: undefined,
        customName: ""
      });
    },
    onError: (error: Error) => {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // 金特セットアイテム削除ミューテーション
  const removeSpecialAbilityFromSetMutation = useMutation({
    mutationFn: async ({ setId, specialAbilityId }: { setId: number; specialAbilityId: number }) => {
      const res = await apiRequest("DELETE", 
        `/api/special-ability-set-items?setId=${setId}&specialAbilityId=${specialAbilityId}`);
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "金特セットからの金特削除に失敗しました");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/character-special-ability-sets", selectedCharacter, selectedPlayerType]
      });
      toast({
        title: "金特削除",
        description: "金特セットから金特が削除されました",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const onLevelBonusSubmit = (values: LevelBonusFormValues & { _resetSingleLevel?: number }) => {
    // characterIdを現在選択中のキャラクターIDに設定
    if (selectedCharacter) {
      // カスタム属性を除外してAPIに送信（APIで処理されない属性のため）
      const { _resetSingleLevel, ...apiData } = values;
      
      const data = {
        ...apiData,
        characterId: selectedCharacter
      };
      createLevelBonusMutation.mutate(data);
      
      // 個別レベル追加の場合は、そのレベルだけをリセット
      if (_resetSingleLevel !== undefined) {
        const levelToReset = _resetSingleLevel;
        
        // 該当レベルの入力値だけをリセット
        setLevelBonusEffect((prev) => {
          const updated = { ...prev };
          delete updated[levelToReset]; // 効果タイプの選択状態をクリア
          return updated;
        });
        
        setLevelBonusValue((prev) => {
          const updated = { ...prev };
          delete updated[levelToReset]; // 値を完全に削除
          return updated;
        });
        
        // フォーム値はリセットしない（他のレベルの入力に影響するため）
      } 
      // 「まとめて追加」の場合は全てリセット
      else {
        // 送信後にフォームを完全にリセット
        levelBonusForm.reset({
          characterId: selectedCharacter,
          level: values.level, // levelだけは保持
          effectType: undefined,
          value: "",
          description: "",
          rarity: undefined,
        });
        
        // 関連する状態変数もリセット - 画面表示を完全にクリア
        const level = values.level;
        setLevelBonusEffect((prev) => {
          const updated = { ...prev };
          delete updated[level]; // 効果タイプの選択状態をクリア
          return updated;
        });
        
        setLevelBonusValue((prev) => {
          const updated = { ...prev };
          delete updated[level]; // 値を完全に削除
          return updated;
        });
        
        setLevelBonusRarity((prev) => {
          const updated = { ...prev };
          // レアリティの選択状態は保持 (共通/SR/PSR)
          return updated;
        });
      }
    }
  };
  
  // すべてのレベルボーナスをまとめて追加する関数
  const submitAllLevelBonuses = async () => {
    if (!selectedCharacter) return;
    
    setIsBatchSubmitting(true);
    const levels = [1, 5, 10, 15, 20, 25, 30, 35, 37, 40, 42, 45, 50];
    
    // 入力されているレベルボーナスを収集
    const bonusesToSubmit: Array<{level: number, effectType: string, value: string, rarity?: string}> = [];
    
    levels.forEach(level => {
      const effectType = levelBonusEffect[level];
      const value = levelBonusValue[level];
      
      if (effectType && value) {
        const bonus = {
          level,
          effectType,
          value,
          characterId: selectedCharacter,
          description: "",
        };
        
        // 特定レベルでのレアリティを強制設定
        if (level === 37) {
          Object.assign(bonus, { rarity: Rarity.SR });
        } else if (level === 42 || level === 50) {
          Object.assign(bonus, { rarity: Rarity.PSR });
        } 
        // それ以外の場合はユーザが選択したレアリティを使用
        else if (levelBonusRarity[level] && levelBonusRarity[level] !== "common") {
          Object.assign(bonus, { rarity: levelBonusRarity[level] });
        }
        
        bonusesToSubmit.push(bonus);
      }
    });
    
    if (bonusesToSubmit.length === 0) {
      setIsBatchSubmitting(false);
      toast({
        title: "入力エラー",
        description: "追加するレベルボーナスが入力されていません",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // 順番に処理
      for (const bonus of bonusesToSubmit) {
        await new Promise<void>((resolve) => {
          createLevelBonusMutation.mutate(bonus as LevelBonusFormValues, {
            onSuccess: () => {
              resolve();
            },
            onError: (error) => {
              toast({
                title: `Lv.${bonus.level}のボーナス追加エラー`,
                description: error.message,
                variant: "destructive",
              });
              resolve();
            }
          });
        });
      }
      
      // すべて送信後にフォームをリセット
      setLevelBonusRarity(prev => ({}));
      setLevelBonusEffect(prev => ({}));
      setLevelBonusValue(prev => ({}));
      
      toast({
        title: "レベルボーナス一括追加",
        description: `${bonusesToSubmit.length}件のレベルボーナスを追加しました`,
      });
    } finally {
      setIsBatchSubmitting(false);
    }
  };
  
  // 金特作成時の送信処理
  const onSpecialAbilitySubmit = (values: SpecialAbilityFormValues) => {
    createSpecialAbilityMutation.mutate(values);
  };
  
  // 金特のフィルタリング
  const filteredSpecialAbilities = specialAbilities.filter((ability) => {
    // タイプでフィルタリング（タイプが選択されている場合）
    const matchesType = selectedPlayerType === "" || selectedPlayerType === "_all" || 
                        ability.playerType === selectedPlayerType;
    
    // 検索語句でフィルタリング
    const matchesSearch = 
      abilitySearchTerm === "" || 
      ability.name.toLowerCase().includes(abilitySearchTerm.toLowerCase()) ||
      (ability.description && ability.description.toLowerCase().includes(abilitySearchTerm.toLowerCase()));
    
    return matchesType && matchesSearch;
  });
  
  // 金特セット作成時の送信処理
  const onSpecialAbilitySetSubmit = (values: CharacterSpecialAbilitySetFormValues) => {
    if (!selectedCharacter) {
      toast({
        title: "エラー",
        description: "キャラクターを選択してください",
        variant: "destructive",
      });
      return;
    }
    if (!selectedPlayerType || selectedPlayerType === "_all" || selectedPlayerType === "") {
      toast({
        title: "エラー",
        description: "プレイヤータイプを選択してください",
        variant: "destructive",
      });
      return;
    }

    // 選択中のキャラクター名を取得
    const characterName = characters.find(c => c.id === selectedCharacter)?.name || "";
    
    // 名前を自動的に設定 (必須フィールド)
    if (!values.name) {
      values.name = `${characterName}の${values.choiceType}`;
    }

    // フォームの値をコンソールに表示
    console.log("送信される金特セット:", {
      ...values,
      characterId: selectedCharacter,
      playerType: selectedPlayerType
    });

    const data = {
      ...values,
      characterId: selectedCharacter,
      playerType: selectedPlayerType
    };
    createSpecialAbilitySetMutation.mutate(data);
  };
  
  // 金特セットアイテム追加時の送信処理
  const onSpecialAbilitySetItemSubmit = (values: Partial<SpecialAbilitySetItemFormValues>) => {
    if (selectedAbilitySetId) {
      // オリジナル変化球でカスタム名が未設定の場合、送信前にチェック
      if (values.specialAbilityId) {
        const selectedAbility = specialAbilities.find(ability => ability.id === values.specialAbilityId);
        if (selectedAbility && selectedAbility.name.includes("オリジナル変化球") && !values.customName) {
          // カスタム名が未入力の場合はプロンプトを表示
          const customName = prompt(`${selectedAbility.name}のカスタム名を入力してください:`, "");
          if (customName === null) {
            return; // キャンセルされた場合は処理を中止
          }
          values.customName = customName;
        }
      }

      // 必須フィールドのみ含める（orderは除外）
      // nullやundefinedをチェックして型安全にする
      const data: SpecialAbilitySetItemFormValues = {
        specialAbilityId: values.specialAbilityId || 0, // 0は代替値（実際には使用されない）
        setId: selectedAbilitySetId,
        customName: values.customName
      };
      addSpecialAbilityToSetMutation.mutate(data);
    }
  };
  
  const handleEditCharacter = (character: any) => {
    setSelectedCharacter(character.id);
    setActiveTab("character");
    setSelectedRarity(""); // レアリティフィルタをリセット
    setLevelBonusRarity({}); // レアリティ選択をリセット
    setLevelBonusEffect({}); // 効果タイプ選択をリセット
    setLevelBonusValue({}); // 効果値をリセット
    
    // 状態変数のクリア
    setAwakeningEffect("");
    setAwakeningValue("");
    setSelectedPlayerType("_all");
    setSelectedAbilitySetId(null);
    
    // キャラクター編集フォームの初期化
    form.reset({
      name: character.name,
      position: character.position,
      stats: character.stats,
      specialTrainings: character.specialTrainings || [],
      eventTiming: character.eventTiming,
      role: character.role || CharacterRole.GUARD,
    });
    
    // レベルボーナスフォームの初期化
    levelBonusForm.reset({
      characterId: character.id,
      level: 1,
      effectType: undefined,
      value: "",
      description: "",
      rarity: undefined,
    });
    
    // 覚醒ボーナスフォームの初期化
    awakeningBonusForm.reset({
      characterId: character.id,
      effectType: undefined,
      value: "",
      awakeningType: "initial",
    });
  };

  const onSubmit = (values: CharacterFormValues) => {
    if (selectedCharacter) {
      updateCharacterMutation.mutate({
        id: selectedCharacter,
        data: values
      });
    } else {
      createCharacterMutation.mutate(values);
    }
  };


  
  // 覚醒ボーナス送信ハンドラ
  const onAwakeningBonusSubmit = (values: AwakeningBonusFormValues) => {
    console.log("覚醒ボーナス送信：", values);
    if (selectedCharacter) {
      // characterIdがない場合は追加する
      if (!values.characterId) {
        values.characterId = selectedCharacter;
      }
      
      const data = {
        ...values,
        characterId: selectedCharacter,
        description: "", // 空の説明を追加して互換性を保つ
        awakeningLevel: 1 // 覚醒レベルを追加（データベース互換性のため）
      };
      console.log("覚醒ボーナス送信データ：", data);
      
      // ボタンクリックでフォーム送信を行わずに直接ミューテーションを呼び出す
      createAwakeningBonusMutation.mutate(data, {
        onSuccess: (newBonus) => {
          console.log("覚醒ボーナス登録成功：", newBonus);
          // 保存した覚醒タイプを保持
          const currentAwakeningType = awakeningBonusForm.getValues("awakeningType");
          // フォームリセット（覚醒タイプは維持）
          awakeningBonusForm.reset({ 
            characterId: selectedCharacter,
            awakeningType: currentAwakeningType, 
            effectType: undefined, 
            value: "" 
          });
          
          toast({
            title: "覚醒ボーナスが登録されました",
            description: `${newBonus.effectType}：${newBonus.value}${effectTypeUnits[newBonus.effectType] || ""}`,
          });
        },
        onError: (error) => {
          console.error("覚醒ボーナス登録エラー：", error);
          toast({
            title: "登録エラー",
            description: "覚醒ボーナスの登録に失敗しました",
            variant: "destructive",
          });
        }
      });
    } else {
      toast({
        title: "エラー",
        description: "キャラクターが選択されていません",
        variant: "destructive",
      });
    }
  };
  
  const isSubmitting = createCharacterMutation.isPending || updateCharacterMutation.isPending;
  const isDeleting = deleteCharacterMutation.isPending;
  const isLevelBonusSubmitting = createLevelBonusMutation.isPending;
  const isLevelBonusDeleting = deleteLevelBonusMutation.isPending;
  const isAwakeningBonusSubmitting = createAwakeningBonusMutation.isPending;
  const isAwakeningBonusDeleting = deleteAwakeningBonusMutation.isPending;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">管理者ページ</h1>
      {/* キャラクター検索とドロップダウン */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>イベントキャラクター選択</CardTitle>
          <CardDescription>
            編集したいキャラクターを選択するか、新規作成してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative w-full sm:w-auto flex-1">
              <Input
                placeholder="キャラクター名で検索..."
                value={characterSearchTerm}
                onChange={(e) => setCharacterSearchTerm(e.target.value)}
                className="pr-10 w-full"
              />
              {characterSearchTerm && (
                <Button
                  variant="ghost"
                  className="absolute right-0 top-0 h-full aspect-square p-0 hover:bg-transparent"
                  onClick={() => setCharacterSearchTerm("")}
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </Button>
              )}
            </div>
            <Select
              value={selectedCharacter ? String(selectedCharacter) : "new"}
              onValueChange={(value) => {
                if (value === "new") {
                  setSelectedCharacter(null);
                  form.reset({
                    name: "",
                    position: "",
                    specialTrainings: [],
                    eventTiming: "",
                    role: CharacterRole.GUARD,
                  });
                } else if (value) {
                  const character = characters.find(c => c.id === parseInt(value));
                  if (character) {
                    handleEditCharacter(character);
                  }
                }
              }}
            >
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue placeholder="キャラクターを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">新規キャラクター作成</SelectItem>
                {characters
                  .filter(character => 
                    !characterSearchTerm || 
                    character.name.toLowerCase().includes(characterSearchTerm.toLowerCase())
                  )
                  .map((character: any) => (
                    <SelectItem key={character.id} value={String(character.id)}>
                      {character.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {selectedCharacter && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (window.confirm(`${characters.find(c => c.id === selectedCharacter)?.name}を削除しますか？`)) {
                    deleteCharacterMutation.mutate(selectedCharacter);
                  }
                }}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Trash className="h-4 w-4 mr-2" />
                )}
                削除
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-8">
        {/* キャラクター情報と編集フォーム */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>{selectedCharacter ? "キャラクター編集" : "新規キャラクター追加"}</CardTitle>
              <CardDescription>
                イベントキャラクターの情報を入力してください
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedCharacter ? (
                // 新規キャラクター追加フォーム
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>名前</FormLabel>
                          <FormControl>
                            <Input placeholder="キャラクター名" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>キャラ種別</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="キャラ種別を選択" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {positionOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">得意練習</h3>
                      <FormField
                        control={form.control}
                        name="specialTrainings"
                        render={({ field }) => (
                          <FormItem>
                            <div className="mb-4">
                              <FormLabel>キャラクターの得意練習を選択してください</FormLabel>
                              <FormDescription>
                                複数選択可能です
                              </FormDescription>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              {specialTrainingOptions.map((option) => {
                                const isChecked = field.value?.includes(option.value);
                                return (
                                  <div
                                    key={option.value}
                                    className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 cursor-pointer hover:bg-muted/50"
                                    onClick={() => {
                                      // チェックボックスの状態を切り替える
                                      if (isChecked) {
                                        // チェックを外す
                                        field.onChange(
                                          field.value?.filter(
                                            (value) => value !== option.value
                                          )
                                        );
                                      } else {
                                        // チェックを入れる
                                        field.onChange([...(field.value || []), option.value]);
                                      }
                                    }}
                                  >
                                    <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-primary shadow">
                                      {isChecked && (
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          viewBox="0 0 24 24"
                                          width="16"
                                          height="16"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="3"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className="text-primary"
                                        >
                                          <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                      )}
                                    </div>
                                    <span className="font-normal">{option.label}</span>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {field.value && Array.isArray(field.value) && field.value.map((value) => (
                                <Badge 
                                  key={value as string} 
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {value as React.ReactNode}
                                  <button
                                    type="button"
                                    className="ml-1 hover:text-destructive"
                                    onClick={() => {
                                      field.onChange(
                                        field.value?.filter((v) => v !== value)
                                      );
                                    }}
                                  >
                                    ×
                                  </button>
                                </Badge>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">イベント発生タイミング</h3>
                      <FormField
                        control={form.control}
                        name="eventTiming"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>イベントの発生タイミングを選択してください</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value as string | undefined}
                                className="flex flex-col space-y-1"
                              >
                                {eventTimingOptions.map((option) => (
                                  <FormItem key={option.value} className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value={option.value} />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      {option.label}
                                    </FormLabel>
                                  </FormItem>
                                ))}
                              </RadioGroup>
                            </FormControl>
                            <FormDescription>
                              キャラクターイベントが発生するタイミング（前イベント・後イベント）
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">キャラクター役割</h3>
                      <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>キャラクターの役割を選択してください</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="役割を選択" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {characterRoleOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              キャラクターのデッキ配置における役割
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        追加する
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                // キャラクター編集フォーム（タブ付き）
                <Tabs
                  defaultValue="character"
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-5 mb-4">
                    <TabsTrigger value="character">基本情報</TabsTrigger>
                    <TabsTrigger value="levelbonus">レベルボーナス</TabsTrigger>
                    <TabsTrigger value="awakening">覚醒ボーナス</TabsTrigger>
                    <TabsTrigger value="friendship">友情特殊能力</TabsTrigger>
                    <TabsTrigger value="specialability">金特</TabsTrigger>
                  </TabsList>

                  <TabsContent value="character">
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>名前</FormLabel>
                              <FormControl>
                                <Input placeholder="キャラクター名" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="position"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>キャラ種別</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="キャラ種別を選択" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {positionOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">得意練習</h3>
                          <FormField
                            control={form.control}
                            name="specialTrainings"
                            render={({ field }) => (
                              <FormItem>
                                <div className="mb-4">
                                  <FormLabel>キャラクターの得意練習を選択してください</FormLabel>
                                  <FormDescription>
                                    複数選択可能です
                                  </FormDescription>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  {specialTrainingOptions.map((option) => {
                                    const isChecked = field.value?.includes(option.value);
                                    return (
                                      <div
                                        key={option.value}
                                        className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 cursor-pointer hover:bg-muted/50"
                                        onClick={() => {
                                          // チェックボックスの状態を切り替える
                                          if (isChecked) {
                                            // チェックを外す
                                            field.onChange(
                                              field.value?.filter(
                                                (value) => value !== option.value
                                              )
                                            );
                                          } else {
                                            // チェックを入れる
                                            field.onChange([...(field.value || []), option.value]);
                                          }
                                        }}
                                      >
                                        <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-primary shadow">
                                          {isChecked && (
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              viewBox="0 0 24 24"
                                              width="16"
                                              height="16"
                                              fill="none"
                                              stroke="currentColor"
                                              strokeWidth="3"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              className="text-primary"
                                            >
                                              <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                          )}
                                        </div>
                                        <span className="font-normal">{option.label}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {field.value && Array.isArray(field.value) && field.value.map((value) => (
                                    <Badge 
                                      key={value as string} 
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {value as React.ReactNode}
                                      <button
                                        type="button"
                                        className="ml-1 hover:text-destructive"
                                        onClick={() => {
                                          field.onChange(
                                            field.value?.filter((v) => v !== value)
                                          );
                                        }}
                                      >
                                        ×
                                      </button>
                                    </Badge>
                                  ))}
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">イベント発生タイミング</h3>
                          <FormField
                            control={form.control}
                            name="eventTiming"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel>イベントの発生タイミングを選択してください</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    value={field.value as string | undefined}
                                    className="flex flex-col space-y-1"
                                  >
                                    {eventTimingOptions.map((option) => (
                                      <FormItem key={option.value} className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                          <RadioGroupItem value={option.value} />
                                        </FormControl>
                                        <FormLabel className="font-normal cursor-pointer">
                                          {option.label}
                                        </FormLabel>
                                      </FormItem>
                                    ))}
                                  </RadioGroup>
                                </FormControl>
                                <FormDescription>
                                  キャラクターイベントが発生するタイミング（前イベント・後イベント）
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">キャラクター役割</h3>
                          <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>キャラクターの役割を選択してください</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="役割を選択" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {characterRoleOptions.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormDescription>
                                  キャラクターのデッキ配置における役割
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="flex gap-2 justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setSelectedCharacter(null);
                              form.reset();
                            }}
                          >
                            キャンセル
                          </Button>
                          <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            更新する
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            disabled={isDeleting}
                            onClick={() => {
                              if (window.confirm("本当に削除しますか？")) {
                                deleteCharacterMutation.mutate(selectedCharacter);
                              }
                            }}
                          >
                            {isDeleting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </TabsContent>
                  
                  <TabsContent value="levelbonus">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">レベルボーナス一括登録</h3>
                        
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-medium">レアリティフィルタ</h4>
                            <div className="text-sm">
                              表示中: <Badge variant="secondary">{selectedRarity || "すべて"}</Badge>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              variant={selectedRarity === "" ? "default" : "outline"} 
                              size="sm"
                              onClick={() => setSelectedRarity("")}
                            >
                              すべて
                            </Button>
                            {Object.values(Rarity).map((rarity) => (
                              <Button
                                key={rarity}
                                variant={selectedRarity === rarity ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedRarity(rarity)}
                              >
                                {rarity}
                              </Button>
                            ))}
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <Button
                            type="button"
                            onClick={submitAllLevelBonuses}
                            disabled={isBatchSubmitting}
                            className="w-full"
                          >
                            {isBatchSubmitting ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            全入力項目をまとめて追加
                          </Button>
                        </div>
                        
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr>
                                <th className="border p-2 bg-muted">レベル</th>
                                <th className="border p-2 bg-muted">レア度</th>
                                <th className="border p-2 bg-muted">効果タイプ</th>
                                <th className="border p-2 bg-muted">効果値</th>
                                <th className="border p-2 bg-muted">操作</th>
                                <th className="border p-2 bg-muted">登録済みボーナス</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[1, 5, 10, 15, 20, 25, 30, 35, 35.5, 37, 40, 42, 45, 50]
                                .filter(level => {
                                  // レアリティフィルタが設定されている場合のレベル制限
                                  if (selectedRarity) {
                                    // SR専用レベルは、SRレアリティのみ表示
                                    if (level === 37 && selectedRarity !== Rarity.SR) {
                                      return false;
                                    }
                                    // PSR専用レベルは、PSRレアリティのみ表示
                                    if ((level === 42 || level === 50) && selectedRarity !== Rarity.PSR) {
                                      return false;
                                    }
                                  }
                                  
                                  // 常に全レベルを表示する
                                  return true;
                                })
                                .map((level) => (
                                <tr key={level}>
                                  <td className="border p-2 text-center font-medium">
                                    {level === 35.5 ? (
                                      <div className="inline-flex items-center">
                                        Lv.35 <Badge className="ml-2 bg-blue-500 hover:bg-blue-600">固有ボーナス</Badge>
                                      </div>
                                    ) : level === 35 ? (
                                      <div className="inline-flex items-center">
                                        Lv.35 <Badge className="ml-2 bg-muted">通常ボーナス</Badge>
                                      </div>
                                    ) : (
                                      <div className="inline-flex items-center">
                                        Lv.{level}
                                        {level === 37 && <Badge className="ml-2">SR専用</Badge>}
                                        {(level === 42 || level === 50) && <Badge className="ml-2">PSR専用</Badge>}
                                      </div>
                                    )}
                                  </td>
                                  <td className="border p-2">
                                    {/* 特定のレベルではレアリティを固定する */}
                                    {level === 37 ? (
                                      <div className="text-center text-sm text-muted-foreground">
                                        SR専用
                                      </div>
                                    ) : (level === 42 || level === 50) ? (
                                      <div className="text-center text-sm text-muted-foreground">
                                        PSR専用
                                      </div>
                                    ) : (
                                      <Select
                                        onValueChange={(value) => {
                                          levelBonusForm.setValue("level", level);
                                          levelBonusForm.setValue("rarity", value || undefined);
                                          setLevelBonusRarity({
                                            ...levelBonusRarity,
                                            [level]: value
                                          });
                                        }}
                                        value={levelBonusRarity[level] || "common"}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="共通" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="common">共通</SelectItem>
                                          {Object.values(Rarity).map((rarity) => (
                                            <SelectItem key={rarity} value={rarity}>
                                              {rarity}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    )}
                                  </td>
                                  <td className="border p-2">
                                    <Select
                                      onValueChange={(value) => {
                                        levelBonusForm.setValue("level", level);
                                        levelBonusForm.setValue("effectType", value);
                                        setLevelBonusEffect({
                                          ...levelBonusEffect,
                                          [level]: value
                                        });
                                      }}
                                      value={levelBonusEffect[level] || undefined}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="効果タイプを選択" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {/* グループごとにオプションを表示 */}
                                        {Array.from(new Set(bonusEffectTypeOptions.map(option => option.group))).map(group => {
                                          if (!group) return null;
                                          return (
                                            <div key={group}>
                                              {/* グループ名のヘッダー */}
                                              <div className="px-2 py-1.5 text-sm font-semibold bg-muted/50">
                                                {group}
                                              </div>
                                              {/* グループに属するオプションをフィルタリングして表示 */}
                                              {bonusEffectTypeOptions
                                                .filter(option => option.group === group)
                                                .map(option => (
                                                  <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                  </SelectItem>
                                                ))
                                              }
                                            </div>
                                          );
                                        })}
                                      </SelectContent>
                                    </Select>
                                  </td>
                                  <td className="border p-2">
                                    {level === 35.5 ? (
                                      <div className="space-y-2">
                                        {/* 効果タイプが固有アイテムの場合のみドロップダウン表示、それ以外はテキスト入力 */}
                                        {levelBonusEffect[level] === BonusEffectType.UNIQUE_ITEM ? (
                                          <Select
                                            onValueChange={(value) => {
                                              // 選択した固有アイテム名の先頭に+を付ける
                                              const formattedValue = `+${value}`;
                                              
                                              // 画面表示は35.5だが、データベースには35として保存
                                              levelBonusForm.setValue("level", 35);
                                              levelBonusForm.setValue("effectType", BonusEffectType.UNIQUE_ITEM);
                                              levelBonusForm.setValue("value", formattedValue);
                                              
                                              setLevelBonusValue((prev) => {
                                                const updated = { ...prev };
                                                updated[level] = formattedValue;
                                                return updated;
                                              });
                                            }}
                                            value={levelBonusValue[level]?.replace(/^\+/, "") || ""}
                                          >
                                            <SelectTrigger>
                                              <SelectValue placeholder="固有ボーナスを選択" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {uniqueBonusItems.map(item => (
                                                <SelectItem key={item.value} value={item.value}>
                                                  {item.label}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        ) : (
                                          <Input 
                                            placeholder="数値のみ入力"
                                            value={levelBonusValue[level] || ""}
                                            onChange={(e) => {
                                              // 画面表示は35.5だが、データベースには35として保存
                                              levelBonusForm.setValue("level", 35);
                                              levelBonusForm.setValue("value", e.target.value);
                                              
                                              setLevelBonusValue((prev) => {
                                                const updated = { ...prev };
                                                updated[level] = e.target.value;
                                                return updated;
                                              });
                                            }}
                                          />
                                        )}
                                        <div className="text-xs text-muted-foreground">
                                          固有ボーナス：特殊アイテムでチームに追加効果を与えます
                                        </div>
                                      </div>
                                    ) : level === 35 ? (
                                      <div className="space-y-2">
                                        <Input 
                                          placeholder="通常ボーナス値を入力"
                                          value={levelBonusValue[level] || ""}
                                          onChange={(e) => {
                                            // 通常ボーナスは+をつけない
                                            const value = e.target.value;
                                            
                                            levelBonusForm.setValue("level", level);
                                            levelBonusForm.setValue("value", value);
                                            
                                            setLevelBonusValue((prev) => {
                                              const updated = { ...prev };
                                              updated[level] = value;
                                              return updated;
                                            });
                                          }}
                                        />
                                        <div className="text-xs text-muted-foreground">
                                          通常ボーナス：値をそのまま設定します
                                        </div>
                                      </div>
                                    ) : (
                                      <Input 
                                        placeholder="数値のみ入力"
                                        value={levelBonusValue[level] || ""}
                                        onChange={(e) => {
                                          levelBonusForm.setValue("level", level);
                                          levelBonusForm.setValue("value", e.target.value);
                                          
                                          setLevelBonusValue((prev) => {
                                            const updated = { ...prev };
                                            updated[level] = e.target.value;
                                            return updated;
                                          });
                                        }}
                                      />
                                    )}
                                  </td>
                                  <td className="border p-2">
                                    {/* 初期評価の場合はレアリティ選択を表示 */}
                                    {levelBonusForm.getValues("level") === level && 
                                     levelBonusForm.getValues("effectType") === BonusEffectType.INITIAL_RATING && (
                                      <div className="mb-2">
                                        <Select
                                          onValueChange={(value) => {
                                            levelBonusForm.setValue("rarity", value as string);
                                          }}
                                          value={levelBonusForm.getValues("rarity") || undefined}
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder="レアリティを選択" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value={Rarity.SR}>SR</SelectItem>
                                            <SelectItem value={Rarity.PSR}>PSR</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    )}
                                    <Button 
                                      type="button" 
                                      size="sm"
                                      disabled={isLevelBonusSubmitting}
                                      onClick={() => {
                                        // level 35.5は内部的には35として保存する
                                        const actualLevel = level === 35.5 ? 35 : level;
                                        levelBonusForm.setValue("level", actualLevel);
                                        levelBonusForm.setValue("description", "");
                                        
                                        // 特定のレベルではレアリティを自動設定
                                        if (actualLevel === 37) {
                                          levelBonusForm.setValue("rarity", Rarity.SR);
                                        } else if (actualLevel === 42 || actualLevel === 50) {
                                          levelBonusForm.setValue("rarity", Rarity.PSR);
                                        }
                                        
                                        // 初期評価の場合はレアリティチェック
                                        if (levelBonusForm.getValues("effectType") === BonusEffectType.INITIAL_RATING && 
                                            !levelBonusForm.getValues("rarity")) {
                                          toast({
                                            title: "入力エラー",
                                            description: "初期評価の場合はレアリティを選択してください",
                                            variant: "destructive",
                                          });
                                          return;
                                        }
                                        
                                        // 現在のレベルに対応する効果タイプと効果値のみを取得
                                        const currentEffectType = levelBonusEffect[level];
                                        const currentValue = levelBonusValue[level];
                                        
                                        if (currentEffectType && currentValue) {
                                          // フォームの値をセット
                                          levelBonusForm.setValue("effectType", currentEffectType);
                                          levelBonusForm.setValue("value", currentValue);
                                          
                                          // 効果値にフォーマットを適用しない状態でAPI送信
                                          const formValues = levelBonusForm.getValues();
                                          const actualLevel = level === 35.5 ? 35 : level;
                                          
                                          // 既に同じレベルと効果タイプのボーナスが登録済みかチェック
                                          const existingBonus = levelBonuses.find(b => 
                                            b.characterId === selectedCharacter &&
                                            b.level === actualLevel && 
                                            b.effectType === currentEffectType && 
                                            (b.rarity === formValues.rarity || 
                                              (!b.rarity && !formValues.rarity))
                                          );
                                          
                                          if (existingBonus) {
                                            toast({
                                              title: "登録エラー",
                                              description: "同じレベルと効果タイプの組み合わせは既に登録されています。別の効果タイプを選択するか、既存のボーナスを削除してください。",
                                              variant: "destructive",
                                            });
                                            return;
                                          }
                                          
                                          // 個別のレベルだけをリセットするため、次のステップで
                                          // レベルを変数に保存しておく
                                          const currentLevel = level;
                                          
                                          // レベル情報をカスタム属性として追加
                                          formValues._singleLevel = currentLevel;
                                          
                                          // APIリクエスト実行
                                          createLevelBonusMutation.mutate({
                                            ...formValues,
                                            level: actualLevel, // 35.5の場合は35に変換
                                          });
                                          
                                          // 追加後に該当レベルの入力値だけをリセット
                                          setLevelBonusEffect((prev) => {
                                            const updated = { ...prev };
                                            delete updated[currentLevel]; // 効果タイプの選択状態をクリア
                                            return updated;
                                          });
                                          
                                          setLevelBonusValue((prev) => {
                                            const updated = { ...prev };
                                            delete updated[currentLevel]; // 値を完全に削除
                                            return updated;
                                          });
                                        } else {
                                          // 現在のレベルに対応する効果タイプまたは効果値が設定されていない場合のエラー
                                          const missingFields = [];
                                          if (!currentEffectType) missingFields.push("効果タイプ");
                                          if (!currentValue) missingFields.push("効果値");
                                          
                                          toast({
                                            title: "入力エラー",
                                            description: `Lv.${level === 35.5 ? "35.5" : level} の${missingFields.join("と")}を入力してください`,
                                            variant: "destructive",
                                          });
                                        }
                                      }}
                                    >
                                      {isLevelBonusSubmitting && levelBonusForm.getValues("level") === level ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                      ) : null}
                                      追加
                                    </Button>
                                  </td>
                                  {/* 登録済みデータ */}
                                  <td className="border p-2">
                                    {isLoadingBonuses ? (
                                      <div className="flex justify-center">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      </div>
                                    ) : levelBonuses && levelBonuses.filter(b => 
                                      // 現在選択中のキャラクターのボーナスのみ表示
                                      b.characterId === selectedCharacter &&
                                      // 表示レベルに合わせて絞り込み
                                      // レベル35.5と35の特殊対応
                                      (level === 35.5 
                                        ? (b.level === 35 && b.value.startsWith("+")) 
                                        : level === 35 
                                          ? (b.level === 35 && !b.value.startsWith("+"))
                                          : b.level === level)
                                      // レアリティフィルタ
                                      && (!selectedRarity || !b.rarity || b.rarity === selectedRarity)
                                    ).length > 0 ? (
                                      <div className="space-y-2 text-sm">
                                        {levelBonuses.filter(b => 
                                          // 現在選択中のキャラクターのボーナスのみ表示
                                          b.characterId === selectedCharacter &&
                                          // 表示レベルに合わせて絞り込み
                                          // レベル35.5と35の特殊対応
                                          (level === 35.5 
                                            ? (b.level === 35 && b.value.startsWith("+")) 
                                            : level === 35 
                                              ? (b.level === 35 && !b.value.startsWith("+"))
                                              : b.level === level)
                                          // レアリティフィルタ
                                          && (!selectedRarity || !b.rarity || b.rarity === selectedRarity)
                                        ).map((bonus: any) => (
                                          <div key={bonus.id} className="flex justify-between items-center">
                                            <div>
                                              <div className="font-medium flex items-center">
                                                <span>{bonus.effectType}</span>
                                                {bonus.rarity && (
                                                  <Badge className="ml-2" variant="outline">
                                                    {bonus.rarity}専用
                                                  </Badge>
                                                )}
                                              </div>
                                              <div>
                                                {formatEffectValue(bonus.value, bonus.effectType, bonus.level)}
                                              </div>
                                            </div>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-6 w-6 p-0"
                                              onClick={() => {
                                                if (window.confirm("このボーナスを削除しますか？")) {
                                                  deleteLevelBonusMutation.mutate(bonus.id);
                                                }
                                              }}
                                              disabled={isLevelBonusDeleting}
                                            >
                                              {isLevelBonusDeleting ? (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                              ) : (
                                                <Trash className="h-3 w-3 text-destructive" />
                                              )}
                                            </Button>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="text-sm text-muted-foreground italic">
                                        未登録
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="friendship">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">友情特殊能力管理</h3>
                        
                        {isLoadingFriendshipAbilities ? (
                          <div className="flex justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {/* 既存の友情特殊能力一覧 */}
                            <Card>
                              <CardHeader className="pb-3">
                                <CardTitle>設定済み友情特殊能力</CardTitle>
                                <CardDescription>
                                  キャラクターごとに投手用・野手用の友情特殊能力を設定できます
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                {friendshipAbilities && friendshipAbilities.length > 0 ? (
                                  <div className="space-y-4">
                                    {friendshipAbilities.map((ability: any) => (
                                      <div 
                                        key={ability.id}
                                        className="flex justify-between items-center p-3 border rounded"
                                      >
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <Badge variant="outline">
                                              {ability.playerType}
                                            </Badge>
                                            <span className="font-medium">{ability.name}</span>
                                          </div>
                                          {ability.description && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                              {ability.description}
                                            </p>
                                          )}
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => {
                                            if (window.confirm("本当に削除しますか？")) {
                                              deleteFriendshipAbilityMutation.mutate(ability.id);
                                            }
                                          }}
                                        >
                                          <Trash className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-4 text-muted-foreground">
                                    友情特殊能力がまだ登録されていません
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                            
                            {/* 新規友情特殊能力追加フォーム */}
                            <Card>
                              <CardHeader>
                                <CardTitle>友情特殊能力追加</CardTitle>
                                <CardDescription>
                                  キャラクターの友情特殊能力を追加します
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <form 
                                  onSubmit={friendshipAbilityForm.handleSubmit((data) => {
                                    createFriendshipAbilityMutation.mutate(data);
                                  })}
                                  className="space-y-4"
                                >
                                  <div className="grid grid-cols-1 gap-4">
                                    <div>
                                      <Label htmlFor="playerType">プレイヤータイプ</Label>
                                      <Select
                                        value={friendshipAbilityForm.watch("playerType")}
                                        onValueChange={(value) => {
                                          friendshipAbilityForm.setValue("playerType", value as PlayerType);
                                          setFriendshipPlayerType(value as PlayerType);
                                        }}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="プレイヤータイプを選択" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value={PlayerType.PITCHER}>{PlayerType.PITCHER}</SelectItem>
                                          <SelectItem value={PlayerType.BATTER}>{PlayerType.BATTER}</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      {friendshipAbilityForm.formState.errors.playerType && (
                                        <p className="text-sm text-destructive mt-1">
                                          {friendshipAbilityForm.formState.errors.playerType.message}
                                        </p>
                                      )}
                                    </div>
                                    
                                    <div>
                                      <Label htmlFor="name">友情特殊能力名</Label>
                                      <Input
                                        id="name"
                                        placeholder="例: 守備職人や球速アップなど"
                                        {...friendshipAbilityForm.register("name")}
                                      />
                                      {friendshipAbilityForm.formState.errors.name && (
                                        <p className="text-sm text-destructive mt-1">
                                          {friendshipAbilityForm.formState.errors.name.message}
                                        </p>
                                      )}
                                    </div>
                                    

                                  </div>
                                  
                                  <div className="flex justify-end">
                                    <Button
                                      type="submit"
                                      disabled={createFriendshipAbilityMutation.isPending}
                                    >
                                      {createFriendshipAbilityMutation.isPending ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      ) : null}
                                      追加する
                                    </Button>
                                  </div>
                                </form>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="awakening">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">覚醒ボーナス登録</h3>
                        
                        <div className="mb-4">
                          <h4 className="text-sm font-medium mb-2">覚醒ボーナス設定</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            SR（PSR）キャラの覚醒時に適用されるボーナスを設定します。
                            SR: 1回覚醒可能、PSR: 2回覚醒可能。
                          </p>
                          
                          <Form {...awakeningBonusForm}>
                            <form className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <FormField
                                  control={awakeningBonusForm.control}
                                  name="awakeningType"
                                  render={({ field }) => {
                                    // 初回覚醒ボーナスが既に登録されているか確認
                                    const hasInitialAwakening = awakeningBonuses && awakeningBonuses.some(bonus => bonus.awakeningType === "initial");
                                    
                                    return (
                                      <FormItem>
                                        <FormLabel>覚醒タイプ</FormLabel>
                                        {hasInitialAwakening ? (
                                          // 初回覚醒が登録済みの場合は変更不可の固定表示にする
                                          <div>
                                            <Input 
                                              value="二回目覚醒 (PSRのみ)" 
                                              readOnly 
                                              disabled
                                              className="bg-muted"
                                            />
                                            <FormDescription className="text-amber-500 font-medium">
                                              初回覚醒は既に登録済みです。二回目覚醒のみ追加可能です。
                                            </FormDescription>
                                          </div>
                                        ) : (
                                          // 通常のセレクト表示
                                          <>
                                            <Select
                                              onValueChange={field.onChange}
                                              defaultValue={field.value}
                                              value={field.value}
                                            >
                                              <FormControl>
                                                <SelectTrigger>
                                                  <SelectValue placeholder="覚醒タイプを選択" />
                                                </SelectTrigger>
                                              </FormControl>
                                              <SelectContent>
                                                <SelectItem value="initial">初回覚醒</SelectItem>
                                                <SelectItem value="second">二回目覚醒 (PSRのみ)</SelectItem>
                                              </SelectContent>
                                            </Select>
                                            <FormDescription>
                                              Lv10まで開放したときの効果を入力します
                                            </FormDescription>
                                          </>
                                        )}
                                        <FormMessage />
                                      </FormItem>
                                    );
                                  }}
                                />
                                
                                <FormField
                                  control={awakeningBonusForm.control}
                                  name="effectType"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>効果タイプ</FormLabel>
                                      <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value as string | undefined}
                                        value={field.value as string | undefined}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="効果タイプを選択" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {Object.entries(getBonusEffectTypeOptions().reduce((groups, option) => {
                                            if (!groups[option.group || '']) {
                                              groups[option.group || ''] = [];
                                            }
                                            groups[option.group || ''].push(option);
                                            return groups;
                                          }, {} as Record<string, typeof bonusEffectTypeOptions>)).map(([group, options]) => (
                                            <div key={group}>
                                              <div className="px-2 py-1.5 text-xs font-semibold bg-muted">
                                                {group}
                                              </div>
                                              {options.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                  {option.label}
                                                </SelectItem>
                                              ))}
                                            </div>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              
                              <FormField
                                control={awakeningBonusForm.control}
                                name="value"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>効果値</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="+なしで数値のみ入力（例: 10）" 
                                        {...field} 
                                        onChange={(e) => {
                                          // 入力値からプラス記号を取り除く
                                          let value = e.target.value.replace(/^\+/, '');
                                          
                                          // 数値のみ受け付ける
                                          if (/^[0-9]*$/.test(value) || value === '') {
                                            field.onChange(value);
                                          }
                                        }}
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      入力値は自動的に追加効果（+付き）として表示されます
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <Button 
                                type="button" 
                                disabled={isAwakeningBonusSubmitting}
                                onClick={() => {
                                  const values = awakeningBonusForm.getValues();
                                  console.log("直接ボタンクリックによる送信:", values);
                                  
                                  // 既に同じ覚醒タイプのボーナスが登録済みかチェック
                                  const existingBonus = awakeningBonuses.find(b => 
                                    b.characterId === selectedCharacter &&
                                    b.awakeningType === values.awakeningType
                                  );
                                  
                                  if (existingBonus) {
                                    toast({
                                      title: "登録エラー",
                                      description: `${values.awakeningType === "initial" ? "初回覚醒" : "二回目覚醒"}のボーナスは既に登録されています。既存のボーナスを削除してから再度登録してください。`,
                                      variant: "destructive",
                                    });
                                    return;
                                  }
                                  
                                  onAwakeningBonusSubmit(values);
                                }}
                              >
                                {isAwakeningBonusSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                覚醒ボーナスを追加
                              </Button>
                            </form>
                          </Form>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-4">登録済み覚醒ボーナス</h3>
                        
                        {isLoadingAwakeningBonuses ? (
                          <div className="flex justify-center my-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {awakeningBonuses.length === 0 ? (
                              <div className="text-center text-muted-foreground py-4">
                                登録された覚醒ボーナスはありません
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 gap-2">
                                {awakeningBonuses.map((bonus) => (
                                  <div key={bonus.id} className="border p-2 rounded-lg flex justify-between items-center">
                                    <div>
                                      <div className="flex items-center space-x-2">
                                        <Badge variant="outline" className="text-xs">
                                          {bonus.awakeningType === "initial" ? "初回覚醒" : "二回目覚醒"}
                                        </Badge>
                                        <span className="font-medium">Lv.10まで開放時</span>
                                      </div>
                                      <div className="text-sm">
                                        {bonus.effectType}: {formatEffectValue(bonus.value, bonus.effectType, undefined, true)}
                                      </div>

                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        if (window.confirm("このボーナスを削除しますか？")) {
                                          deleteAwakeningBonusMutation.mutate(bonus.id);
                                        }
                                      }}
                                      disabled={isAwakeningBonusDeleting}
                                    >
                                      {isAwakeningBonusDeleting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Trash className="h-4 w-4 text-destructive" />
                                      )}
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="specialability">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* 左側: 金特一覧 (2カラム分使用) */}
                        <div className="lg:col-span-2">
                          <h3 className="text-lg font-medium mb-4">金特一覧</h3>
                            {isLoadingSpecialAbilities ? (
                              <div className="flex justify-center my-4">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                              </div>
                            ) : (
                              <div className="border rounded-md p-3">
                                {selectedAbilitySetId ? (
                                  <div className="bg-primary/5 p-3 rounded-md mb-4">
                                    <h4 className="text-sm font-semibold mb-1">金特の追加方法</h4>
                                    <p className="text-sm text-muted-foreground">
                                      下記の金特リストから任意の金特を見つけ、「追加」ボタンを押すと選択中のセットに追加されます
                                    </p>
                                  </div>
                                ) : (
                                  <div className="bg-amber-50 p-3 rounded-md mb-4 border border-amber-200">
                                    <h4 className="text-sm font-semibold mb-1 text-amber-800">注意</h4>
                                    <p className="text-sm text-amber-700">
                                      金特の追加には、先に右側で「キャラクター」「タイプ」「ルート」を選択して金特セットを作成し、
                                      「編集」ボタンをクリックする必要があります
                                    </p>
                                  </div>
                                )}
                                
                                <div className="mb-4 space-y-2">
                                  <Label htmlFor="ability-filter">金特タイプでフィルター</Label>
                                  <div className="flex items-center space-x-2">
                                    <Select
                                      value={selectedPlayerType}
                                      onValueChange={(value) => setSelectedPlayerType(value as PlayerType | "")}
                                    >
                                      <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="全てのタイプ" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="_all">全てのタイプ</SelectItem>
                                        <SelectItem value={PlayerType.PITCHER}>{PlayerType.PITCHER}</SelectItem>
                                        <SelectItem value={PlayerType.BATTER}>{PlayerType.BATTER}</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Input 
                                      id="ability-search"
                                      placeholder="金特を検索..." 
                                      className="flex-1"
                                      value={abilitySearchTerm}
                                      onChange={(e) => {
                                        setAbilitySearchTerm(e.target.value);
                                        // 検索時にタイプフィルターをクリア
                                        if (e.target.value) {
                                          setSelectedPlayerType("_all");
                                        }
                                      }}
                                    />
                                  </div>
                                </div>

                                {filteredSpecialAbilities.length === 0 ? (
                                  <div className="text-center text-muted-foreground py-4">
                                    条件に一致する金特はありません
                                  </div>
                                ) : (
                                  <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                                    {filteredSpecialAbilities.map((ability) => (
                                      <div 
                                        key={ability.id} 
                                        className={cn(
                                          "flex justify-between items-center p-2 rounded-md",
                                          selectedSpecialAbility === ability.id ? "bg-muted" : "hover:bg-muted/50 cursor-pointer"
                                        )}
                                        onClick={() => setSelectedSpecialAbility(ability.id)}
                                      >
                                        <div>
                                          <div className="font-medium">{ability.name}</div>
                                          <div className="text-xs text-muted-foreground flex items-center">
                                            <Badge variant="outline" className="mr-2">
                                              {ability.playerType}
                                            </Badge>
                                            {ability.description}
                                          </div>
                                        </div>
                                        {selectedAbilitySetId && (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (selectedAbilitySetId) {
                                                // オリジナル変化球の場合はカスタム名入力ダイアログを表示
                                                if (ability.name.includes("オリジナル変化球")) {
                                                  const customName = prompt(`${ability.name}のカスタム名を入力してください:`, "");
                                                  if (customName !== null) {
                                                    onSpecialAbilitySetItemSubmit({
                                                      setId: selectedAbilitySetId,
                                                      specialAbilityId: ability.id,
                                                      customName
                                                    });
                                                  }
                                                } else {
                                                  // 通常の金特
                                                  onSpecialAbilitySetItemSubmit({
                                                    setId: selectedAbilitySetId,
                                                    specialAbilityId: ability.id
                                                  });
                                                }
                                              }
                                            }}
                                          >
                                            追加
                                          </Button>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        
                        {/* 右側: キャラクター金特セット登録 (2カラム分使用) */}
                        <div className="lg:col-span-2">
                          <h3 className="text-lg font-medium mb-4">キャラクター金特セット設定</h3>
                          
                          {!selectedCharacter ? (
                            <div className="text-center text-muted-foreground py-8 border rounded-md">
                              <h4 className="text-sm font-semibold mb-2">ステップ 1</h4>
                              左側のキャラクター一覧からキャラクターを選択してください
                            </div>
                          ) : (
                            <div className="space-y-6">
                              {/* タイプ選択 */}
                              <div className="border rounded-md p-4 bg-muted/20">
                                <h4 className="text-sm font-semibold mb-2">ステップ 1: キャラクター選択</h4>
                                <p className="text-sm text-muted-foreground mb-2">選択中: <span className="font-medium text-foreground">{characters.find(c => c.id === selectedCharacter)?.name}</span></p>
                              </div>
                              
                              <div className="border rounded-md p-4">
                                <h4 className="text-sm font-semibold mb-2">ステップ 2: 選手タイプ選択</h4>
                                <div className="flex space-x-2">
                                  <Button
                                    variant={selectedPlayerType === PlayerType.PITCHER ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => {
                                      setSelectedPlayerType(PlayerType.PITCHER);
                                      setSelectedAbilitySetId(null);
                                    }}
                                  >
                                    投手
                                  </Button>
                                  <Button
                                    variant={selectedPlayerType === PlayerType.BATTER ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => {
                                      setSelectedPlayerType(PlayerType.BATTER);
                                      setSelectedAbilitySetId(null);
                                    }}
                                  >
                                    野手
                                  </Button>
                                </div>
                              </div>
                              
                              {selectedPlayerType && (
                                <>
                                  {/* 金特セット作成フォーム */}
                                  <div className="border rounded-md p-4">
                                    <h4 className="text-sm font-semibold mb-2">ステップ 3: 金特セット作成</h4>
                                    <Form {...specialAbilitySetForm}>
                                      <form className="space-y-4">
                                        <FormField
                                          control={specialAbilitySetForm.control}
                                          name="choiceType"
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel>ルートタイプ</FormLabel>
                                              <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                value={field.value}
                                              >
                                                <FormControl>
                                                  <SelectTrigger>
                                                    <SelectValue placeholder="ルートを選択" />
                                                  </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                  <SelectItem value={SpecialAbilityChoiceType.TYPE_A}>Aルート</SelectItem>
                                                  <SelectItem value={SpecialAbilityChoiceType.TYPE_B}>Bルート</SelectItem>
                                                  <SelectItem value={SpecialAbilityChoiceType.TYPE_C}>Cルート</SelectItem>
                                                </SelectContent>
                                              </Select>
                                              <FormDescription>
                                                成功パターンのルートを選択
                                              </FormDescription>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
                                        
                                        <Button 
                                          type="button" 
                                          onClick={() => {
                                            const values = specialAbilitySetForm.getValues();
                                            values.playerType = selectedPlayerType;
                                            onSpecialAbilitySetSubmit(values);
                                          }}
                                        >
                                          金特セットを作成
                                        </Button>
                                      </form>
                                    </Form>
                                  </div>
                                  
                                  {/* 金特セット一覧 */}
                                  <div className="border rounded-md p-4">
                                    <h4 className="text-sm font-semibold mb-2">ステップ 4: 金特セットを選択・編集</h4>
                                    {isLoadingSpecialAbilitySets ? (
                                      <div className="flex justify-center my-4">
                                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                      </div>
                                    ) : (
                                      <div className="space-y-4">
                                        {specialAbilitySets.length === 0 ? (
                                          <div className="text-center text-muted-foreground py-4 border rounded-md">
                                            まだ登録された金特セットはありません。<br />
                                            上記フォームから新しい金特セットを作成してください。
                                          </div>
                                        ) : (
                                          specialAbilitySets.map((set) => (
                                            <div 
                                              key={set.id}
                                              className={cn(
                                                "border rounded-md p-3",
                                                selectedAbilitySetId === set.id ? "border-primary bg-muted/20" : ""
                                              )}
                                            >
                                              <div className="flex justify-between items-center mb-2">
                                                <div className="flex items-center">
                                                  <Badge className="mr-2">{set.playerType}</Badge>
                                                  <Badge variant="outline">{set.choiceType}</Badge>
                                                </div>
                                                <div className="flex space-x-2">
                                                  <Button
                                                    variant={selectedAbilitySetId === set.id ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => setSelectedAbilitySetId(set.id)}
                                                  >
                                                    {selectedAbilitySetId === set.id ? "編集中" : "編集"}
                                                  </Button>
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                      if (window.confirm("この金特セットを削除しますか？")) {
                                                        deleteSpecialAbilitySetMutation.mutate(set.id);
                                                      }
                                                    }}
                                                  >
                                                    <Trash className="h-4 w-4 text-destructive" />
                                                  </Button>
                                                </div>
                                              </div>
                                              
                                              <div className="space-y-2">
                                                {/* 金特一覧 */}
                                                {set.abilities && set.abilities.length > 0 ? (
                                                  set.abilities.map((ability) => {
                                                    // ここでsetItemsからこの金特に対応するアイテムを検索
                                                    const setItem = set.setItems?.find(item => item.specialAbilityId === ability.id);
                                                    const isOriginalPitch = ability.name.includes("オリジナル変化球");
                                                    const customName = setItem?.customName;

                                                    return (
                                                      <div key={ability.id} className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                                                        <div className="text-sm font-medium">
                                                          {isOriginalPitch && customName ? (
                                                            <>
                                                              <span className="text-primary">{customName}</span>
                                                              <span className="text-xs text-muted-foreground ml-1">({ability.name})</span>
                                                            </>
                                                          ) : (
                                                            ability.name
                                                          )}
                                                        </div>
                                                        <Button
                                                          variant="ghost"
                                                          size="sm"
                                                          onClick={() => {
                                                            if (window.confirm("この金特をセットから削除しますか？")) {
                                                              removeSpecialAbilityFromSetMutation.mutate({
                                                                setId: set.id,
                                                                specialAbilityId: ability.id
                                                              });
                                                            }
                                                          }}
                                                        >
                                                          <X className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                      </div>
                                                    );
                                                  })
                                                ) : (
                                                  <div className="text-center text-muted-foreground py-2">
                                                    金特が設定されていません
                                                  </div>
                                                )}
                                              </div>
                                              
                                              {/* 金特追加フォーム (選択中の場合のみ表示) */}
                                              {selectedAbilitySetId === set.id && (
                                                <div className="mt-4 pt-4 border-t">
                                                  <h5 className="text-sm font-semibold mb-2">ステップ 5: 金特を追加</h5>
                                                  <div className="bg-primary/5 p-3 rounded-md mb-3">
                                                    <p className="text-sm text-muted-foreground mb-1">
                                                      <span className="font-medium">方法1:</span> 左側の金特一覧から金特を選び「追加」ボタンをクリックする
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                      <span className="font-medium">方法2:</span> 以下のドロップダウンから選択する
                                                    </p>
                                                  </div>
                                                  <Form {...specialAbilitySetItemForm}>
                                                    <form className="space-y-4">
                                                      <FormField
                                                        control={specialAbilitySetItemForm.control}
                                                        name="specialAbilityId"
                                                        render={({ field }) => (
                                                          <FormItem>
                                                            <Select
                                                              onValueChange={(value) => field.onChange(Number(value))}
                                                              value={field.value?.toString()}
                                                            >
                                                              <FormControl>
                                                                <SelectTrigger>
                                                                  <SelectValue placeholder="金特を選択" />
                                                                </SelectTrigger>
                                                              </FormControl>
                                                              <SelectContent>
                                                                {specialAbilities
                                                                  .filter(ability => ability.playerType === set.playerType)
                                                                  .map((ability) => (
                                                                    <SelectItem key={ability.id} value={ability.id.toString()}>
                                                                      {ability.name}
                                                                    </SelectItem>
                                                                  ))}
                                                              </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                          </FormItem>
                                                        )}
                                                      />
                                                      
                                                      {/* 選択した金特が「オリジナル変化球」の場合、カスタム名入力欄を表示 */}
                                                      {specialAbilitySetItemForm.watch("specialAbilityId") && 
                                                        specialAbilities.find(ability => 
                                                          ability.id === specialAbilitySetItemForm.watch("specialAbilityId") && 
                                                          ability.name.includes("オリジナル変化球")
                                                        ) && (
                                                          <FormField
                                                            control={specialAbilitySetItemForm.control}
                                                            name="customName"
                                                            render={({ field }) => (
                                                              <FormItem>
                                                                <FormLabel>変化球名</FormLabel>
                                                                <FormControl>
                                                                  <Input 
                                                                    placeholder="オリジナル変化球の名前を入力" 
                                                                    {...field} 
                                                                  />
                                                                </FormControl>
                                                                <FormDescription>
                                                                  例: 「魔球」「エグザムライザー」など
                                                                </FormDescription>
                                                                <FormMessage />
                                                              </FormItem>
                                                            )}
                                                          />
                                                        )
                                                      }

                                                      {/* 表示順フィールドを削除 */}
                                                      
                                                      <Button 
                                                        type="button" 
                                                        onClick={() => onSpecialAbilitySetItemSubmit(specialAbilitySetItemForm.getValues())}
                                                      >
                                                        金特を追加
                                                      </Button>
                                                    </form>
                                                  </Form>
                                                </div>
                                              )}
                                            </div>
                                          ))
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}