import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CharacterType, EventTiming, BonusEffectType, Rarity, insertCharacterSchema, insertCharacterLevelBonusSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { positionOptions, specialTrainingOptions, eventTimingOptions } from "@/lib/constants";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// 管理者向けキャラクター作成スキーマ
const characterSchema = insertCharacterSchema.extend({});
type CharacterFormValues = z.infer<typeof characterSchema>;

// レベルボーナス登録用スキーマ
const levelBonusSchema = insertCharacterLevelBonusSchema.extend({});
type LevelBonusFormValues = z.infer<typeof levelBonusSchema>;

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

};

// 効果値に単位を自動で付加する関数
const formatEffectValue = (value: string, effectType?: string): string => {
  if (!effectType) return value;
  const unit = effectTypeUnits[effectType] || "";
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

export default function AdminPage() {
  const { toast } = useToast();
  const [selectedCharacter, setSelectedCharacter] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>("character");
  const [selectedRarity, setSelectedRarity] = useState<string>("");
  const [levelBonusRarity, setLevelBonusRarity] = useState<Record<number, string>>({});
  const [levelBonusEffect, setLevelBonusEffect] = useState<Record<number, string>>({});
  const [levelBonusValue, setLevelBonusValue] = useState<Record<number, string>>({});
  const [isBatchSubmitting, setIsBatchSubmitting] = useState(false);

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
      
      // クリア
      setLevelBonusEffect({
        ...levelBonusEffect,
        [data.level]: ""
      });
      setLevelBonusValue({
        ...levelBonusValue,
        [data.level]: ""
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
  
  const onLevelBonusSubmit = (values: LevelBonusFormValues) => {
    // characterIdを現在選択中のキャラクターIDに設定
    if (selectedCharacter) {
      const data = {
        ...values,
        characterId: selectedCharacter
      };
      createLevelBonusMutation.mutate(data);
      
      // 送信後にフォームを完全にリセット
      levelBonusForm.reset({
        characterId: selectedCharacter,
        level: values.level, // levelだけは保持
        effectType: undefined,
        value: "",
        description: "",
        rarity: undefined,
      });
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
      setLevelBonusRarity({});
      setLevelBonusEffect({});
      setLevelBonusValue({});
      
      toast({
        title: "レベルボーナス一括追加",
        description: `${bonusesToSubmit.length}件のレベルボーナスを追加しました`,
      });
    } finally {
      setIsBatchSubmitting(false);
    }
  };
  
  const handleEditCharacter = (character: any) => {
    setSelectedCharacter(character.id);
    setActiveTab("character");
    setSelectedRarity(""); // レアリティフィルタをリセット
    setLevelBonusRarity({}); // レアリティ選択をリセット
    setLevelBonusEffect({}); // 効果タイプ選択をリセット
    setLevelBonusValue({}); // 効果値をリセット
    
    // キャラクター編集フォームの初期化
    form.reset({
      name: character.name,
      position: character.position,
      stats: character.stats,
      specialTrainings: character.specialTrainings || [],
      eventTiming: character.eventTiming,
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

  const isSubmitting = createCharacterMutation.isPending || updateCharacterMutation.isPending;
  const isDeleting = deleteCharacterMutation.isPending;
  const isLevelBonusSubmitting = createLevelBonusMutation.isPending;
  const isLevelBonusDeleting = deleteLevelBonusMutation.isPending;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">管理者ページ</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                          <FormLabel>ポジション</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="ポジションを選択" />
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
                              {specialTrainingOptions.map((option) => (
                                <FormItem
                                  key={option.value}
                                  className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(option.value)}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          field.onChange([...(field.value || []), option.value]);
                                        } else {
                                          field.onChange(
                                            field.value?.filter(
                                              (value) => value !== option.value
                                            )
                                          );
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {option.label}
                                  </FormLabel>
                                </FormItem>
                              ))}
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
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="character">基本情報</TabsTrigger>
                    <TabsTrigger value="levelbonus">レベルボーナス</TabsTrigger>
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
                              <FormLabel>ポジション</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="ポジションを選択" />
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
                                  {specialTrainingOptions.map((option) => (
                                    <FormItem
                                      key={option.value}
                                      className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(option.value)}
                                          onCheckedChange={(checked) => {
                                            if (checked) {
                                              field.onChange([...(field.value || []), option.value]);
                                            } else {
                                              field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== option.value
                                                )
                                              );
                                            }
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        {option.label}
                                      </FormLabel>
                                    </FormItem>
                                  ))}
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
                          <h4 className="text-sm font-medium mb-2">レアリティフィルタ</h4>
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
                              </tr>
                            </thead>
                            <tbody>
                              {[1, 5, 10, 15, 20, 25, 30, 35, 37, 40, 42, 45, 50].map((level) => (
                                <tr key={level}>
                                  <td className="border p-2 text-center font-medium">
                                    Lv.{level}
                                    {level === 37 && <Badge className="ml-2">SR専用</Badge>}
                                    {(level === 42 || level === 50) && <Badge className="ml-2">PSR専用</Badge>}
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
                                        {/* グループ化するために一意なグループ名を収集 */}
                                        {Array.from(new Set(bonusEffectTypeOptions.map(option => option.group))).map(group => (
                                          <React.Fragment key={group}>
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
                                          </React.Fragment>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </td>
                                  <td className="border p-2">
                                    <Input 
                                      placeholder="数値のみ入力" 
                                      value={levelBonusValue[level] || ""}
                                      onChange={(e) => {
                                        levelBonusForm.setValue("level", level);
                                        levelBonusForm.setValue("value", e.target.value);
                                        setLevelBonusValue({
                                          ...levelBonusValue,
                                          [level]: e.target.value
                                        });
                                      }}
                                    />
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
                                        levelBonusForm.setValue("level", level);
                                        levelBonusForm.setValue("description", "");
                                        
                                        // 特定のレベルではレアリティを自動設定
                                        if (level === 37) {
                                          levelBonusForm.setValue("rarity", Rarity.SR);
                                        } else if (level === 42 || level === 50) {
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
                                        
                                        if (levelBonusForm.getValues("effectType") && levelBonusForm.getValues("value")) {
                                          // 効果値にフォーマットを適用しない状態でAPI送信
                                          onLevelBonusSubmit(levelBonusForm.getValues());
                                          // 送信後にフォームをリセット
                                          setLevelBonusEffect({
                                            ...levelBonusEffect,
                                            [level]: undefined
                                          });
                                          setLevelBonusValue({
                                            ...levelBonusValue,
                                            [level]: ""
                                          });
                                          levelBonusForm.setValue("effectType", "");
                                          levelBonusForm.setValue("value", "");
                                          levelBonusForm.setValue("rarity", undefined);
                                        } else {
                                          toast({
                                            title: "入力エラー",
                                            description: "効果タイプと効果値を入力してください",
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
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-4">登録済みレベルボーナス</h3>
                        {isLoadingBonuses ? (
                          <div className="flex justify-center my-4">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          </div>
                        ) : levelBonuses && levelBonuses.length > 0 ? (
                          <div>
                            <div className="mb-4">
                              <h4 className="text-sm font-medium mb-2">表示中のレア度: {selectedRarity || "すべて"}</h4>
                            </div>
                            <div className="space-y-3">
                              {levelBonuses.map((bonus: any) => (
                                <div key={bonus.id} className="flex justify-between items-center p-3 border rounded-md">
                                  <div>
                                    <div className="font-medium flex items-center">
                                      <span>Lv.{bonus.level} - {bonus.effectType}</span>
                                      {bonus.rarity && (
                                        <Badge className="ml-2" variant="outline">
                                          {bonus.rarity}専用
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="text-sm">
                                      {formatEffectValue(bonus.value, bonus.effectType)}
                                      {bonus.description && (
                                        <span className="text-muted-foreground ml-2">
                                          {bonus.description}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      if (window.confirm("このボーナスを削除しますか？")) {
                                        deleteLevelBonusMutation.mutate(bonus.id);
                                      }
                                    }}
                                    disabled={isLevelBonusDeleting}
                                  >
                                    {isLevelBonusDeleting ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash className="h-4 w-4 text-destructive" />
                                    )}
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-6 text-muted-foreground">
                            レベルボーナスが登録されていません
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>

        {/* キャラクター一覧 */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>イベントキャラクター一覧</CardTitle>
              <CardDescription>
                作成したキャラクターの一覧です。編集するにはキャラクターをクリックしてください。
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center my-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : characters.length > 0 ? (
                <div className="space-y-4">
                  {characters.map((character: any) => (
                    <div
                      key={character.id}
                      onClick={() => handleEditCharacter(character)}
                      className={`p-4 border rounded-lg cursor-pointer hover:bg-accent ${
                        selectedCharacter === character.id ? "ring-2 ring-primary" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg">{character.name}</h3>
                          <div className="text-sm text-muted-foreground">
                            {character.position}
                            {character.eventTiming && ` | ${character.eventTiming}`}
                          </div>
                          {character.specialTrainings && character.specialTrainings.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {character.specialTrainings.map((training: any) => (
                                <Badge key={String(training)} variant="outline" className="text-xs">
                                  {String(training)}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  キャラクターがまだ登録されていません
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}