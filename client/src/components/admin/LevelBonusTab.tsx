import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Rarity, BonusEffectType } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { levelBonusSchema, LevelBonusFormValues } from "./adminTypes";
import { useLevelBonusAdmin } from "./hooks/useLevelBonusAdmin";
import { bonusEffectTypeOptions, formatEffectValue, isLv35UniqueBonus } from "./adminConstants";
import { uniqueBonusItems } from "@/lib/constants";

interface LevelBonusTabProps {
  selectedCharacter: number | null;
  selectedRarity: string;
  setSelectedRarity: (rarity: string) => void;
}

export default function LevelBonusTab({
  selectedCharacter,
  selectedRarity,
  setSelectedRarity
}: LevelBonusTabProps) {
  const {
    levelBonuses,
    isLoadingBonuses,
    levelBonusRarity,
    setLevelBonusRarity,
    levelBonusEffect,
    setLevelBonusEffect,
    levelBonusValue,
    setLevelBonusValue,
    isBatchSubmitting,
    createLevelBonusMutation,
    deleteLevelBonusMutation,
    handleBatchSubmit,
    handleSingleLevelSubmit
  } = useLevelBonusAdmin(selectedCharacter, selectedRarity);

  // レベルボーナス追加フォーム
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

  // トグルの状態管理
  const [levelSectionsState, setLevelSectionsState] = useState<Record<string, boolean>>({
    "starting": true, // 初期値
    "regular": true,  // レギュラー
    "special": true,  // 特殊
    "unique": true    // 固有
  });

  const isLevelBonusSubmitting = createLevelBonusMutation.isPending;
  const isLevelBonusDeleting = deleteLevelBonusMutation.isPending;

  // レベル一覧の生成
  const levelRanges = {
    starting: [1],               // 初期レベル
    regular: Array.from({ length: 9 }, (_, i) => i + 2), // レギュラーレベル (2-10)
    special: Array.from({ length: 25 }, (_, i) => i + 11), // 特殊レベル (11-35)
    unique: [35.5]               // 固有レベル (35.5)
  };

  // セクショントグルのハンドラー
  const toggleSection = (section: string) => {
    setLevelSectionsState(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // 表示するレベルをレアリティでフィルタリング
  const filteredBonuses = selectedRarity
    ? levelBonuses.filter((bonus: any) => bonus.rarity === selectedRarity)
    : levelBonuses;

  // 既に登録済みのレベルボーナスかどうかを判定
  const isLevelRegistered = (level: number, rarity?: string) => {
    // 35.5の場合は35として検索
    const searchLevel = level === 35.5 ? 35 : level;
    
    if (rarity) {
      return filteredBonuses.some(
        (bonus: any) => bonus.level === searchLevel && bonus.rarity === rarity
      );
    }
    
    return filteredBonuses.some(
      (bonus: any) => bonus.level === searchLevel && (!bonus.rarity || bonus.rarity === selectedRarity)
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* レベルボーナス検索・フィルタリング */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>レベルボーナスフィルター</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium mb-2">レアリティでフィルター</div>
                <Select
                  value={selectedRarity}
                  onValueChange={setSelectedRarity}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="すべてのレアリティ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">すべて</SelectItem>
                    {Object.values(Rarity).map(rarity => (
                      <SelectItem key={rarity} value={rarity}>{rarity}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">表示セクション</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={levelSectionsState.starting ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleSection("starting")}
                  >
                    初期
                  </Button>
                  <Button
                    variant={levelSectionsState.regular ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleSection("regular")}
                  >
                    レギュラー
                  </Button>
                  <Button
                    variant={levelSectionsState.special ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleSection("special")}
                  >
                    特殊
                  </Button>
                  <Button
                    variant={levelSectionsState.unique ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleSection("unique")}
                  >
                    固有
                  </Button>
                </div>
              </div>
              
              {isLoadingBonuses ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredBonuses.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">登録済みボーナス</h3>
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {filteredBonuses.map((bonus: any) => (
                      <div 
                        key={bonus.id} 
                        className="flex justify-between items-center p-2 border rounded-md"
                      >
                        <div>
                          <div className="font-medium">
                            Lv.{bonus.level === 35 && bonus.isUniqueBonus ? "35.5" : bonus.level}
                            {bonus.rarity && <span className="ml-1 text-xs">({bonus.rarity})</span>}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {bonus.effectType}: {formatEffectValue(
                              bonus.value, 
                              bonus.effectType, 
                              bonus.level
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteLevelBonusMutation.mutate(bonus.id)}
                          disabled={isLevelBonusDeleting}
                        >
                          {isLevelBonusDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  登録済みのレベルボーナスはありません
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* レベルボーナス登録 */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>レベルボーナス登録</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedCharacter ? (
              <div className="text-center py-4 text-muted-foreground">
                キャラクターを選択してください
              </div>
            ) : (
              <div className="space-y-6">
                <Form {...levelBonusForm}>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr>
                          <th className="border p-2 text-left">レベル</th>
                          <th className="border p-2 text-left">効果タイプ</th>
                          <th className="border p-2 text-left">値</th>
                          <th className="border p-2 text-left">レアリティ</th>
                          <th className="border p-2 text-left">アクション</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* 初期レベル (Lv.1) */}
                        {levelSectionsState.starting && levelRanges.starting.map(level => (
                          <tr key={`level-${level}`}>
                            <td className="border p-2 font-medium">Lv.{level}</td>
                            <td className="border p-2">
                              <Select
                                value={levelBonusEffect[level] || ""}
                                onValueChange={(value) => {
                                  setLevelBonusEffect((prev) => {
                                    const updated = { ...prev };
                                    updated[level] = value;
                                    return updated;
                                  });
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="効果タイプを選択" />
                                </SelectTrigger>
                                <SelectContent>
                                  {bonusEffectTypeOptions.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                      {option.group ? ` (${option.group})` : ""}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="border p-2">
                              {levelBonusEffect[level] === BonusEffectType.INITIAL_RATING ? (
                                <div className="space-y-2">
                                  <Input
                                    placeholder="0〜100の値を入力"
                                    value={levelBonusValue[level] || ""}
                                    onChange={(e) => {
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
                                    初期評価：0〜100の値を入力
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
                              {levelBonusEffect[level] === BonusEffectType.INITIAL_RATING && (
                                <div className="mb-2">
                                  <Select
                                    onValueChange={(value) => {
                                      levelBonusForm.setValue("rarity", value as string);
                                      
                                      setLevelBonusRarity((prev) => {
                                        const updated = { ...prev };
                                        updated[level] = value;
                                        return updated;
                                      });
                                    }}
                                    value={levelBonusRarity[level] || undefined}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="レアリティを選択" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {Object.values(Rarity).map(rarity => (
                                        <SelectItem key={rarity} value={rarity}>{rarity}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                            </td>
                            <td className="border p-2">
                              <Button
                                type="button"
                                size="sm"
                                disabled={
                                  !levelBonusEffect[level] ||
                                  !levelBonusValue[level] ||
                                  (levelBonusEffect[level] === BonusEffectType.INITIAL_RATING && !levelBonusRarity[level]) ||
                                  isLevelRegistered(level, levelBonusRarity[level]) ||
                                  isLevelBonusSubmitting
                                }
                                onClick={() => handleSingleLevelSubmit(level)}
                              >
                                {isLevelBonusSubmitting ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                ) : (
                                  <Plus className="h-4 w-4 mr-1" />
                                )}
                                追加
                              </Button>
                            </td>
                          </tr>
                        ))}
                        
                        {/* レギュラーレベル (2-10) */}
                        {levelSectionsState.regular && (
                          <>
                            <tr>
                              <td colSpan={5} className="bg-muted p-2 font-medium">
                                レギュラーレベル (2-10)
                              </td>
                            </tr>
                            {levelRanges.regular.map(level => (
                              <tr key={`level-${level}`}>
                                <td className="border p-2">Lv.{level}</td>
                                <td className="border p-2">
                                  <Select
                                    value={levelBonusEffect[level] || ""}
                                    onValueChange={(value) => {
                                      setLevelBonusEffect((prev) => {
                                        const updated = { ...prev };
                                        updated[level] = value;
                                        return updated;
                                      });
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="効果タイプを選択" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {bonusEffectTypeOptions.map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                          {option.label}
                                          {option.group ? ` (${option.group})` : ""}
                                        </SelectItem>
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
                                      
                                      setLevelBonusValue((prev) => {
                                        const updated = { ...prev };
                                        updated[level] = e.target.value;
                                        return updated;
                                      });
                                    }}
                                  />
                                </td>
                                <td className="border p-2">
                                  <Select
                                    onValueChange={(value) => {
                                      levelBonusForm.setValue("rarity", value as string);
                                      
                                      setLevelBonusRarity((prev) => {
                                        const updated = { ...prev };
                                        updated[level] = value;
                                        return updated;
                                      });
                                    }}
                                    value={levelBonusRarity[level] || undefined}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="レアリティを選択" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="">共通</SelectItem>
                                      {Object.values(Rarity).map(rarity => (
                                        <SelectItem key={rarity} value={rarity}>{rarity}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </td>
                                <td className="border p-2">
                                  <Button
                                    type="button"
                                    size="sm"
                                    disabled={
                                      !levelBonusEffect[level] ||
                                      !levelBonusValue[level] ||
                                      isLevelRegistered(level, levelBonusRarity[level]) ||
                                      isLevelBonusSubmitting
                                    }
                                    onClick={() => handleSingleLevelSubmit(level)}
                                  >
                                    {isLevelBonusSubmitting ? (
                                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                    ) : (
                                      <Plus className="h-4 w-4 mr-1" />
                                    )}
                                    追加
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </>
                        )}
                        
                        {/* 特殊レベル (11-35) */}
                        {levelSectionsState.special && (
                          <>
                            <tr>
                              <td colSpan={5} className="bg-muted p-2 font-medium">
                                特殊レベル (11-35)
                              </td>
                            </tr>
                            {levelRanges.special.map(level => (
                              <tr key={`level-${level}`}>
                                <td className="border p-2">Lv.{level}</td>
                                <td className="border p-2">
                                  <Select
                                    value={levelBonusEffect[level] || ""}
                                    onValueChange={(value) => {
                                      setLevelBonusEffect((prev) => {
                                        const updated = { ...prev };
                                        updated[level] = value;
                                        return updated;
                                      });
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="効果タイプを選択" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {bonusEffectTypeOptions.map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                          {option.label}
                                          {option.group ? ` (${option.group})` : ""}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </td>
                                <td className="border p-2">
                                  {level === 35 && levelBonusEffect[level] === BonusEffectType.UNIQUE_ITEM ? (
                                    <div className="space-y-2">
                                      <Select
                                        onValueChange={(value) => {
                                          // 選択した固有アイテム名の先頭に+を付ける
                                          const formattedValue = `+${value}`;
                                          
                                          // 画面表示は35.5だが、データベースには35として保存
                                          // 固有アイテムを選択した場合は固有アイテムタイプを設定
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
                                      <div className="text-xs text-muted-foreground">
                                        固有ボーナス：特殊アイテムでチームに追加効果を与えます
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
                                  <Select
                                    onValueChange={(value) => {
                                      levelBonusForm.setValue("rarity", value as string);
                                      
                                      setLevelBonusRarity((prev) => {
                                        const updated = { ...prev };
                                        updated[level] = value;
                                        return updated;
                                      });
                                    }}
                                    value={levelBonusRarity[level] || undefined}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="レアリティを選択" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="">共通</SelectItem>
                                      {Object.values(Rarity).map(rarity => (
                                        <SelectItem key={rarity} value={rarity}>{rarity}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </td>
                                <td className="border p-2">
                                  <Button
                                    type="button"
                                    size="sm"
                                    disabled={
                                      !levelBonusEffect[level] ||
                                      !levelBonusValue[level] ||
                                      isLevelRegistered(level, levelBonusRarity[level]) ||
                                      isLevelBonusSubmitting
                                    }
                                    onClick={() => handleSingleLevelSubmit(level)}
                                  >
                                    {isLevelBonusSubmitting ? (
                                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                    ) : (
                                      <Plus className="h-4 w-4 mr-1" />
                                    )}
                                    追加
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </>
                        )}
                        
                        {/* 固有レベル (35.5) */}
                        {levelSectionsState.unique && (
                          <>
                            <tr>
                              <td colSpan={5} className="bg-muted p-2 font-medium">
                                固有レベル (35.5)
                              </td>
                            </tr>
                            {levelRanges.unique.map(level => (
                              <tr key={`level-${level}`}>
                                <td className="border p-2">Lv.{level}</td>
                                <td className="border p-2">
                                  <div className="text-muted-foreground">
                                    固有アイテム (自動設定)
                                  </div>
                                </td>
                                <td className="border p-2">
                                  <div className="space-y-2">
                                    <Select
                                      onValueChange={(value) => {
                                        // 選択した固有アイテム名の先頭に+を付ける
                                        const formattedValue = `+${value}`;
                                        
                                        // 画面表示は35.5だが、データベースには35として保存
                                        // 固有アイテムを選択した場合は固有アイテムタイプを設定
                                        levelBonusForm.setValue("level", 35);
                                        levelBonusForm.setValue("effectType", BonusEffectType.UNIQUE_ITEM);
                                        levelBonusForm.setValue("value", formattedValue);
                                        
                                        setLevelBonusEffect((prev) => {
                                          const updated = { ...prev };
                                          updated[35] = BonusEffectType.UNIQUE_ITEM;
                                          return updated;
                                        });
                                        
                                        setLevelBonusValue((prev) => {
                                          const updated = { ...prev };
                                          updated[35] = formattedValue;
                                          return updated;
                                        });
                                      }}
                                      value={levelBonusValue[35]?.replace(/^\+/, "") || ""}
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
                                    <div className="text-xs text-muted-foreground">
                                      固有ボーナス：特殊アイテムでチームに追加効果を与えます
                                    </div>
                                  </div>
                                </td>
                                <td className="border p-2">
                                  <Select
                                    onValueChange={(value) => {
                                      levelBonusForm.setValue("rarity", value as string);
                                      
                                      setLevelBonusRarity((prev) => {
                                        const updated = { ...prev };
                                        updated[35] = value;
                                        return updated;
                                      });
                                    }}
                                    value={levelBonusRarity[35] || undefined}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="レアリティを選択" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="">共通</SelectItem>
                                      {Object.values(Rarity).map(rarity => (
                                        <SelectItem key={rarity} value={rarity}>{rarity}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </td>
                                <td className="border p-2">
                                  <Button
                                    type="button"
                                    size="sm"
                                    disabled={
                                      !levelBonusValue[35] ||
                                      isLevelRegistered(35, levelBonusRarity[35]) ||
                                      isLevelBonusSubmitting
                                    }
                                    onClick={() => {
                                      // 固有ボーナスの場合は常にUNIQUE_ITEMタイプで登録
                                      setLevelBonusEffect((prev) => {
                                        const updated = { ...prev };
                                        updated[35] = BonusEffectType.UNIQUE_ITEM;
                                        return updated;
                                      });
                                      
                                      handleSingleLevelSubmit(35);
                                    }}
                                  >
                                    {isLevelBonusSubmitting ? (
                                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                    ) : (
                                      <Plus className="h-4 w-4 mr-1" />
                                    )}
                                    追加
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Form>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}