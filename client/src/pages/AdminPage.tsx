import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { apiRequest } from "@/lib/queryClient";
import { Position, Rarity, SpecialTraining, insertCharacterSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { positionOptions, specialTrainingOptions, statColorMap } from "@/lib/constants";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

// 管理者向けキャラクター作成スキーマ
const characterSchema = insertCharacterSchema.extend({
  // ここで追加のバリデーションがあれば追加できます
});

type CharacterFormValues = z.infer<typeof characterSchema>;

export default function AdminPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCharacter, setSelectedCharacter] = useState<number | null>(null);

  // キャラクターデータの取得
  const { data: characters, isLoading } = useQuery({
    queryKey: ["/api/characters"],
    queryFn: async () => {
      const res = await fetch("/api/characters");
      if (!res.ok) throw new Error("キャラクターデータの取得に失敗しました");
      return await res.json();
    }
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
      position: Position.PITCHER,
      rating: 3,
      specialTrainings: [],
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

  const handleEditCharacter = (character: any) => {
    setSelectedCharacter(character.id);
    form.reset({
      name: character.name,
      position: character.position,
      rating: character.rating,
      stats: character.stats,
      specialTrainings: character.specialTrainings || [],
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

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">管理者ページ</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* キャラクターフォーム */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>{selectedCharacter ? "キャラクター編集" : "新規キャラクター追加"}</CardTitle>
              <CardDescription>
                イベントキャラクターの情報を入力してください
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                            {Object.values(Position).map((position) => (
                              <SelectItem key={position} value={position}>
                                {position}
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
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>評価（1-5）</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={5}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">投手ステータス</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="stats.pitching.velocity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>球速</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                max={5}
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="stats.pitching.control"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>コントロール</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                max={5}
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="stats.pitching.stamina"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>スタミナ</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                max={5}
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="stats.pitching.breaking"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>変化球</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                max={5}
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">打者ステータス</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="stats.batting.contact"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ミート</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                max={5}
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="stats.batting.power"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>パワー</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                max={5}
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="stats.batting.speed"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>走力</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                max={5}
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="stats.batting.arm"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>肩力</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                max={5}
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="stats.batting.fielding"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>守備力</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                max={5}
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

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

                  <div className="flex gap-2 justify-end">
                    {selectedCharacter && (
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
                    )}
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {selectedCharacter ? "更新する" : "追加する"}
                    </Button>
                    {selectedCharacter && (
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
                    )}
                  </div>
                </form>
              </Form>
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
              ) : characters && characters.length > 0 ? (
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