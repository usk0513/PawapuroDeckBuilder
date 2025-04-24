import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { apiRequest } from "@/lib/queryClient";
import { Position, Rarity, SpecialTraining, insertOwnedCharacterSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { levelOptions, awakeningOptions, rarityOptions, rarityColorMap, specialTrainingOptions } from "@/lib/constants";
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
        title: "キャラクター追加",
        description: "所持キャラクターに追加されました",
      });
      setSelectedCharacter(null);
      form.reset({
        userId: 1, // デモ用の固定ユーザーID
        characterId: 0,
        level: 1,
        awakening: 0,
        rarity: Rarity.N,
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

  const form = useForm<AddOwnedCharacterFormValues>({
    resolver: zodResolver(addOwnedCharacterSchema),
    defaultValues: {
      userId: 1, // デモ用の固定ユーザーID
      characterId: 0,
      level: 1,
      awakening: 0,
      rarity: Rarity.N,
    }
  });

  const handleSelectCharacter = (character: any) => {
    setSelectedCharacter(character);
    form.setValue("characterId", character.id);
  };

  const onSubmit = (values: AddOwnedCharacterFormValues) => {
    addOwnedCharacterMutation.mutate(values);
  };

  const isSubmitting = addOwnedCharacterMutation.isPending;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">所持キャラクター追加</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* キャラクター選択部分 */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>キャラクター選択</CardTitle>
              <CardDescription>
                所持コレクションに追加するキャラクターを選択してください
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingCharacters ? (
                <div className="flex justify-center my-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : characters && characters.length > 0 ? (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {characters.map((character: any) => (
                    <div
                      key={character.id}
                      onClick={() => handleSelectCharacter(character)}
                      className={`p-4 border rounded-lg cursor-pointer hover:bg-accent ${
                        selectedCharacter?.id === character.id ? "ring-2 ring-primary" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg">{character.name}</h3>
                          <div className="text-sm text-muted-foreground">
                            {character.position} | 評価: {character.rating}
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
                  キャラクターがまだ登録されていません。管理者に追加を依頼してください。
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 所持キャラクター追加フォーム */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>所持キャラクター設定</CardTitle>
              <CardDescription>
                選択したキャラクターのレベル、覚醒、レアリティを設定してください
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedCharacter ? (
                <div className="text-center py-8 text-muted-foreground">
                  左側からキャラクターを選択してください
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="mb-6">
                      <h3 className="font-bold text-xl">{selectedCharacter.name}</h3>
                      <p className="text-muted-foreground">{selectedCharacter.position}</p>
                      {selectedCharacter.specialTrainings && selectedCharacter.specialTrainings.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium mb-1">得意練習:</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedCharacter.specialTrainings.map((training: any) => (
                              <Badge key={String(training)} className="text-xs">
                                {String(training)}
                              </Badge>
                            ))}
                          </div>
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
                            defaultValue={field.value.toString()}
                            value={field.value.toString()}
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
                            defaultValue={field.value.toString()}
                            value={field.value.toString()}
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
                          <FormLabel>レアリティ</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="レアリティを選択" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.values(Rarity).map((rarity) => (
                                <SelectItem key={rarity} value={rarity}>
                                  <span style={{ color: rarityColorMap[rarity as Rarity] }}>
                                    {rarity}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      所持キャラクターに追加
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}