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
import { Loader2, Trash, X, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { positionOptions, specialTrainingOptions, eventTimingOptions, uniqueBonusItems } from "@/lib/constants";
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
const specialAbilitySetItemSchema = insertSpecialAbilitySetItemSchema.extend({});
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
  [BonusEffectType.BASE_KOTS_BREAKING]: "",
  // サポート時ボーナス（単位なし）
  [BonusEffectType.SUPPORT_AWAKENING_MAX]: "",
  [BonusEffectType.SUPPORT_EXPERIENCE_LIMIT_UP]: "",
  [BonusEffectType.FRIEND_STAMP_BONUS]: "",
  [BonusEffectType.SUPPORT_FAN_INCREASE]: ""
};

// 効果値の表示フォーマット
function formatEffectValue(value: string, effectType: string, level?: number, showUnit: boolean = true): string {
  // ユニークアイテムの場合
  if (level === 35.5) {
    return value; // ユニークアイテムはテキストそのまま表示
  }
  
  // %付きの効果タイプか数値の効果タイプかを判定
  const unit = showUnit ? (effectTypeUnits[effectType] || "") : "";
  
  return `${value}${unit}`;
}

export default function AdminPage() {
  const { toast } = useToast();
  
  // キャラクター関連の状態
  const [selectedCharacter, setSelectedCharacter] = useState<number | null>(null);
  const [selectedRarity, setSelectedRarity] = useState<string | null>(null);
  
  // レベルボーナス関連の状態
  const [levelBonusEffect, setLevelBonusEffect] = useState<Record<number, string>>({});
  const [levelBonusValue, setLevelBonusValue] = useState<Record<number, string>>({});
  const [levelBonusRarity, setLevelBonusRarity] = useState<Record<number, string>>({});
  
  // 覚醒ボーナス関連の状態
  const [awakeningEffect, setAwakeningEffect] = useState<string>("");
  const [awakeningValue, setAwakeningValue] = useState<string>("");
  const [awakeningType, setAwakeningType] = useState<string>("initial"); // 'initial' or 'second'
  
  // 金特関連の状態
  const [selectedSpecialAbility, setSelectedSpecialAbility] = useState<number | null>(null);
  const [selectedPlayerType, setSelectedPlayerType] = useState<PlayerType | string>("_all");
  const [selectedAbilitySetId, setSelectedAbilitySetId] = useState<number | null>(null);
  const [abilitySearchTerm, setAbilitySearchTerm] = useState<string>("");

  // キャラクターデータの取得
  const { data: characters = [], isLoading } = useQuery({
    queryKey: ["/api/characters"],
    queryFn: async () => {
      const res = await fetch("/api/characters");
      if (!res.ok) throw new Error("キャラクターデータの取得に失敗しました");
      return await res.json();
    }
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

  // フィルタリングされた金特
  const filteredSpecialAbilities = specialAbilities.filter((ability: any) => {
    // 選手タイプフィルター
    const matchesType = selectedPlayerType === "_all" || ability.playerType === selectedPlayerType;
    
    // 検索語句フィルター
    const searchTermLower = abilitySearchTerm.toLowerCase();
    const matchesSearch = !abilitySearchTerm || 
      ability.name.toLowerCase().includes(searchTermLower) || 
      (ability.description && ability.description.toLowerCase().includes(searchTermLower));
    
    return matchesType && matchesSearch;
  });

  // 金特セットアイテム追加ミューテーション
  const addSpecialAbilityToSetMutation = useMutation({
    mutationFn: async (data: SpecialAbilitySetItemFormValues) => {
      const res = await apiRequest("POST", "/api/special-ability-set-items", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "金特追加に失敗しました");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/character-special-ability-sets", selectedCharacter, selectedPlayerType]
      });
      toast({
        title: "金特追加",
        description: "金特がセットに追加されました",
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
      const res = await apiRequest("DELETE", `/api/special-ability-set-items/${setId}/${specialAbilityId}`);
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "金特削除に失敗しました");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/character-special-ability-sets", selectedCharacter, selectedPlayerType]
      });
      toast({
        title: "金特削除",
        description: "金特がセットから削除されました",
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
        description: `${data.playerType}の${data.choiceType}金特セットが作成されました`,
      });
      // 作成したセットを選択状態にする
      setSelectedAbilitySetId(data.id);
    },
    onError: (error: Error) => {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      });
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
      if (selectedAbilitySetId) {
        setSelectedAbilitySetId(null);
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
  
  // 金特セット用フォーム
  const specialAbilitySetForm = useForm<CharacterSpecialAbilitySetFormValues>({
    resolver: zodResolver(characterSpecialAbilitySetSchema),
    defaultValues: {
      characterId: selectedCharacter || undefined,
      playerType: PlayerType.PITCHER,
      choiceType: SpecialAbilityChoiceType.TYPE_A,
    }
  });
  
  // 金特セットアイテム用フォーム
  const specialAbilitySetItemForm = useForm<SpecialAbilitySetItemFormValues>({
    resolver: zodResolver(specialAbilitySetItemSchema),
    defaultValues: {
      setId: undefined,
      specialAbilityId: undefined,
      order: 1,
    }
  });

  // 金特セット送信ハンドラ
  const onSpecialAbilitySetSubmit = (values: CharacterSpecialAbilitySetFormValues) => {
    if (selectedCharacter) {
      values.characterId = selectedCharacter;
      createSpecialAbilitySetMutation.mutate(values);
    }
  };
  
  // 金特セットアイテム送信ハンドラ
  const onSpecialAbilitySetItemSubmit = (values: SpecialAbilitySetItemFormValues) => {
    addSpecialAbilityToSetMutation.mutate(values);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">管理者ページ</h1>
      
      <div className="space-y-6">
        <Tabs defaultValue="character">
          <TabsList className="mb-4">
            <TabsTrigger value="character">キャラクター</TabsTrigger>
            <TabsTrigger value="specialability">金特</TabsTrigger>
          </TabsList>
          
          <TabsContent value="specialability">
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 左側: 金特一覧 */}
                <div>
                  <h3 className="text-lg font-medium mb-4">金特一覧</h3>
                  {isLoadingSpecialAbilities ? (
                    <div className="flex justify-center my-4">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="border rounded-md p-4">
                      <div className="mb-4 space-y-2">
                        <Label htmlFor="ability-filter">金特タイプでフィルター</Label>
                        <div className="flex items-center space-x-2">
                          <Select
                            value={selectedPlayerType}
                            onValueChange={setSelectedPlayerType}
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
                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                          {filteredSpecialAbilities.map((ability: any) => (
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
                                    onSpecialAbilitySetItemSubmit({
                                      setId: selectedAbilitySetId,
                                      specialAbilityId: ability.id,
                                      order: 1
                                    });
                                  }}
                                >
                                  <PlusCircle className="h-4 w-4 mr-1" />
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
                
                {/* 右側: キャラクター金特セット登録 */}
                <div>
                  <h3 className="text-lg font-medium mb-4">キャラクター金特セット設定</h3>
                  
                  {!selectedCharacter ? (
                    <div className="text-center text-muted-foreground py-8 border rounded-md">
                      左側のキャラクター一覧からキャラクターを選択してください
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* タイプ選択 */}
                      <div>
                        <h4 className="text-sm font-medium mb-2">選手タイプ選択</h4>
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
                      
                      {selectedPlayerType && selectedPlayerType !== "_all" && (
                        <>
                          {/* 金特セット作成フォーム */}
                          <div className="border rounded-md p-4">
                            <h4 className="text-sm font-medium mb-2">金特セット作成</h4>
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
                                    values.playerType = selectedPlayerType as PlayerType;
                                    onSpecialAbilitySetSubmit(values);
                                  }}
                                  disabled={!specialAbilitySetForm.formState.isValid || selectedPlayerType === "_all"}
                                >
                                  金特セットを作成
                                </Button>
                              </form>
                            </Form>
                          </div>
                          
                          {/* 金特セット一覧 */}
                          <div>
                            <h4 className="text-sm font-medium mb-2">登録済み金特セット</h4>
                            {isLoadingSpecialAbilitySets ? (
                              <div className="flex justify-center my-4">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {specialAbilitySets.length === 0 ? (
                                  <div className="text-center text-muted-foreground py-4 border rounded-md">
                                    登録された金特セットはありません
                                  </div>
                                ) : (
                                  specialAbilitySets.map((set: any) => (
                                    <div 
                                      key={set.id}
                                      className={cn(
                                        "border rounded-md p-3",
                                        selectedAbilitySetId === set.id ? "border-primary" : ""
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
                                          set.abilities.map((ability: any) => (
                                            <div key={ability.id} className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                                              <div className="text-sm font-medium">{ability.name}</div>
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
                                          ))
                                        ) : (
                                          <div className="text-center text-muted-foreground py-2">
                                            金特が設定されていません
                                          </div>
                                        )}
                                      </div>
                                      
                                      {selectedAbilitySetId === set.id && (
                                        <div className="mt-4 pt-4 border-t">
                                          <h5 className="text-sm font-medium mb-2">金特追加方法</h5>
                                          <p className="text-sm text-muted-foreground mb-2">
                                            左側の金特一覧から追加したい金特を選び、「追加」ボタンをクリックしてください。
                                          </p>
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
      </div>
    </div>
  );
}