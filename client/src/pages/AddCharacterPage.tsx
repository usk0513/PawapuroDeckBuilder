import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { apiRequest } from "@/lib/queryClient";
import { insertOwnedCharacterSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { levelOptions, awakeningOptions, rarityOptions, rarityColorMap, specialTrainingOptions, eventTimingOptions } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

// 所持キャラクター追加スキーマ
const addOwnedCharacterSchema = insertOwnedCharacterSchema.extend({
  // ここで追加のバリデーションがあれば追加できます
});

type AddOwnedCharacterFormValues = z.infer<typeof addOwnedCharacterSchema>;

export default function AddCharacterPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCharacter, setSelectedCharacter] = useState<any>(null);

  // フォーム初期化
  const form = useForm<AddOwnedCharacterFormValues>({
    resolver: zodResolver(addOwnedCharacterSchema),
    defaultValues: {
      characterId: 0,
      userId: 1, // 仮のユーザーID
      level: 1,
      awakening: 0,
      rarity: "N",
    },
  });

  // すべてのキャラクターデータを取得
  const { data: characters, isLoading: isLoadingCharacters } = useQuery({
    queryKey: ["/api/characters"],
    queryFn: async () => {
      const res = await fetch("/api/characters");
      if (!res.ok) throw new Error("キャラクターデータの取得に失敗しました");
      return await res.json();
    }
  });

  // 所持キャラクター追加ミューテーション
  const addOwnedCharacterMutation = useMutation({
    mutationFn: async (data: AddOwnedCharacterFormValues) => {
      const res = await apiRequest("POST", "/api/owned-characters", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "キャラクター追加に失敗しました");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/owned-characters"] });
      toast({
        title: "キャラクターを追加しました",
        description: `${selectedCharacter?.name}を所持キャラクターに追加しました`,
      });
      form.reset();
      setSelectedCharacter(null);
    },
    onError: (error: Error) => {
      toast({
        title: "エラーが発生しました",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // レベルボーナスデータの取得
  const { data: levelBonuses, isLoading: isLoadingBonuses } = useQuery({
    queryKey: ["/api/character-level-bonuses", selectedCharacter?.id, form.watch("rarity")],
    queryFn: async () => {
      if (!selectedCharacter) return [];
      const characterId = selectedCharacter.id;
      const rarity = form.watch("rarity");
      const res = await fetch(`/api/character-level-bonuses?characterId=${characterId}&rarity=${rarity}`);
      if (!res.ok) throw new Error("レベルボーナスの取得に失敗しました");
      return await res.json();
    },
    enabled: !!selectedCharacter,
  });

  // 初期評価を取得
  const getInitialRating = () => {
    if (!levelBonuses || levelBonuses.length === 0) return null;
    // レベル1の初期評価ボーナスを探す
    const initialRatingBonus = levelBonuses.find(
      (bonus: any) => bonus.level === 1 && bonus.effectType === "初期評価"
    );
    return initialRatingBonus?.value || null;
  };

  // レアリティが変更されたときにレベルボーナスを再取得
  useEffect(() => {
    if (selectedCharacter) {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/character-level-bonuses", selectedCharacter.id, form.watch("rarity")]
      });
    }
  }, [form.watch("rarity"), selectedCharacter, queryClient]);

  // フォーム送信ハンドラ
  const onSubmit = (values: AddOwnedCharacterFormValues) => {
    addOwnedCharacterMutation.mutate(values);
  };

  // キャラクター選択ハンドラ
  const handleCharacterSelect = (character: any) => {
    setSelectedCharacter(character);
    form.setValue("characterId", character.id);
  };

  if (isLoadingCharacters) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2">キャラクターデータを読み込み中...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">キャラクター追加</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* キャラクター選択セクション */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>イベントキャラクター</CardTitle>
              <CardDescription>追加したいキャラクターを選択してください</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {characters?.map((character: any) => (
                  <div
                    key={character.id}
                    className={`cursor-pointer p-4 rounded-lg border transition-all ${
                      selectedCharacter?.id === character.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                    }`}
                    onClick={() => handleCharacterSelect(character)}
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-3 font-bold text-xl">
                        {character.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{character.name}</h3>
                        <div className="text-sm text-gray-600 flex items-center space-x-1">
                          <span>キャラ種別: {character.position}</span>
                          {character.eventTiming && (
                            <span className="ml-1">{character.eventTiming}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 得意練習 */}
                    {character.specialTrainings && character.specialTrainings.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {character.specialTrainings.map((training: any, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {String(training)}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* フォームセクション */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>キャラクター設定</CardTitle>
              <CardDescription>キャラクターのパラメータを設定してください</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedCharacter ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="mb-6">
                      <h3 className="text-xl font-bold mb-2">{selectedCharacter.name}</h3>
                      <div className="flex items-center space-x-2 text-sm mb-2">
                        <span className="bg-gray-100 px-2 py-1 rounded">{selectedCharacter.position}</span>
                        {selectedCharacter.eventTiming && (
                          <span className="bg-gray-100 px-2 py-1 rounded">{selectedCharacter.eventTiming}</span>
                        )}
                      </div>
                      
                      {/* 初期評価の表示 */}
                      {getInitialRating() && (
                        <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-blue-800">初期評価値:</span>
                            <span className="text-lg font-bold text-blue-800">{getInitialRating()}</span>
                          </div>
                          <div className="text-xs text-blue-600 mt-1">
                            * {form.watch("rarity")}レアリティの初期評価値です
                          </div>
                        </div>
                      )}
                      
                      {isLoadingBonuses && (
                        <div className="flex items-center justify-center py-2">
                          <Loader2 className="h-4 w-4 animate-spin text-blue-500 mr-2" />
                          <span className="text-sm text-blue-500">ボーナスデータを読み込み中...</span>
                        </div>
                      )}
                    </div>

                    <FormField
                      control={form.control}
                      name="level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>レベル</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            defaultValue={(field.value || 1).toString()}
                            value={(field.value || 1).toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="レベルを選択" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {levelOptions.map((level) => (
                                <SelectItem key={level.value} value={level.value.toString()}>
                                  {level.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="awakening"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>覚醒</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            defaultValue={(field.value || 0).toString()}
                            value={(field.value || 0).toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="覚醒レベルを選択" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {awakeningOptions.map((awakening) => (
                                <SelectItem key={awakening.value} value={awakening.value.toString()}>
                                  {awakening.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rarity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>レア度</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value || "N"}
                            value={field.value || "N"}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="レア度を選択" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {rarityOptions.map((rarity) => {
                                const color = rarityColorMap[rarity.value as keyof typeof rarityColorMap] || { bg: "bg-gray-100", text: "text-gray-800" };
                                return (
                                  <SelectItem key={rarity.value} value={rarity.value}>
                                    <span className={`${color.bg} ${color.text} px-2 py-0.5 rounded text-xs font-medium`}>
                                      {rarity.label}
                                    </span>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={addOwnedCharacterMutation.isPending}
                    >
                      {addOwnedCharacterMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      キャラクターを追加
                    </Button>
                  </form>
                </Form>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>左側のリストからキャラクターを選択してください</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}