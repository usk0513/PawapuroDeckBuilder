import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BonusEffectType } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatEffectValue } from "./adminConstants";
import { bonusEffectTypeOptions } from "./adminConstants";
import { awakeningBonusSchema, AwakeningBonusFormValues } from "./adminTypes";
import { useAwakeningBonusAdmin } from "./hooks/useAwakeningBonusAdmin";

interface AwakeningBonusTabProps {
  selectedCharacter: number | null;
}

export default function AwakeningBonusTab({
  selectedCharacter
}: AwakeningBonusTabProps) {
  const {
    awakeningBonuses,
    isLoadingAwakeningBonuses,
    awakeningEffect,
    setAwakeningEffect,
    awakeningValue,
    setAwakeningValue,
    awakeningType,
    setAwakeningType,
    createAwakeningBonusMutation,
    deleteAwakeningBonusMutation
  } = useAwakeningBonusAdmin(selectedCharacter);

  // 覚醒ボーナス追加フォーム
  const awakeningBonusForm = useForm<AwakeningBonusFormValues>({
    resolver: zodResolver(awakeningBonusSchema),
    defaultValues: {
      characterId: selectedCharacter || undefined,
      effectType: undefined,
      value: "",
      awakeningType: "initial",
      description: "",
    }
  });

  // 初期化: フォームのcharacterIdを更新
  React.useEffect(() => {
    if (selectedCharacter) {
      awakeningBonusForm.setValue("characterId", selectedCharacter);
    }
  }, [selectedCharacter, awakeningBonusForm]);
  
  // 覚醒タイプを自動設定 (初回覚醒が登録済みの場合は二回目覚醒を強制的に選択)
  React.useEffect(() => {
    if (awakeningBonuses && awakeningBonuses.length > 0) {
      // 初回覚醒が既に登録されているか確認
      const hasInitialAwakening = awakeningBonuses.some((bonus: any) => bonus.awakeningType === "initial");
      
      if (hasInitialAwakening) {
        // 初回覚醒が登録済みの場合、二回目覚醒を選択
        awakeningBonusForm.setValue("awakeningType", "second");
        setAwakeningType("second");
      }
    }
  }, [awakeningBonuses, awakeningBonusForm, setAwakeningType]);

  // 覚醒ボーナス追加処理
  const onAwakeningBonusSubmit = (values: AwakeningBonusFormValues) => {
    if (!selectedCharacter) return;
    
    const awakeningData = {
      ...values,
      characterId: selectedCharacter
    };
    
    createAwakeningBonusMutation.mutate(awakeningData);
  };
  
  const isAwakeningBonusSubmitting = createAwakeningBonusMutation.isPending;
  const isAwakeningBonusDeleting = deleteAwakeningBonusMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 覚醒ボーナス一覧 */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>覚醒ボーナス一覧</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingAwakeningBonuses ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : awakeningBonuses.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {awakeningBonuses.map((bonus: any) => (
                  <div
                    key={bonus.id}
                    className="flex justify-between items-center p-3 border rounded-md"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {bonus.awakeningType === "initial" ? "初回覚醒" : "二回目覚醒"}
                        </span>
                        {bonus.awakeningLevel && (
                          <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                            Lv.{bonus.awakeningLevel}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {bonus.effectType}: {formatEffectValue(
                          bonus.value, 
                          bonus.effectType, 
                          undefined, 
                          true
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteAwakeningBonusMutation.mutate(bonus.id)}
                      disabled={isAwakeningBonusDeleting}
                    >
                      {isAwakeningBonusDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                登録済みの覚醒ボーナスはありません
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* 覚醒ボーナス追加フォーム */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>覚醒ボーナス追加</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedCharacter ? (
              <div className="text-center py-4 text-muted-foreground">
                キャラクターを選択してください
              </div>
            ) : (
              <Form {...awakeningBonusForm}>
                <form onSubmit={awakeningBonusForm.handleSubmit(onAwakeningBonusSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={awakeningBonusForm.control}
                      name="awakeningType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>覚醒タイプ</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              setAwakeningType(value);
                            }}
                            value={field.value}
                            disabled={awakeningBonuses.some((bonus: any) => bonus.awakeningType === "initial")}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="覚醒タイプを選択" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="initial">初回覚醒</SelectItem>
                              <SelectItem value="second">二回目覚醒</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={awakeningBonusForm.control}
                      name="awakeningLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>覚醒レベル (オプション)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="例：50"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={awakeningBonusForm.control}
                      name="effectType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>効果タイプ</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              setAwakeningEffect(value);
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="効果タイプを選択" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {bonusEffectTypeOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                  {option.group ? ` (${option.group})` : ""}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={awakeningBonusForm.control}
                      name="value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>効果値</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="例：10"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e.target.value);
                                setAwakeningValue(e.target.value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={awakeningBonusForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>説明 (オプション)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="覚醒ボーナスの説明"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button
                    type="submit"
                    disabled={isAwakeningBonusSubmitting}
                    className="w-full"
                  >
                    {isAwakeningBonusSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="mr-2 h-4 w-4" />
                    )}
                    覚醒ボーナスを追加
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}