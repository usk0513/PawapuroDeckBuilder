import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { 
  Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Character, Position, positionOptions } from "@/lib/constants";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ArrowLeft, PlusCircle, Pencil, Trash2 } from "lucide-react";

// フォームバリデーションスキーマ
const characterSchema = z.object({
  name: z.string().min(1, "名前は必須です"),
  position: z.nativeEnum(Position, {
    errorMap: () => ({ message: "ポジションを選択してください" }),
  }),
  rating: z.coerce.number().min(1).max(5),
  stats: z.object({
    pitching: z.object({
      velocity: z.coerce.number().min(0).max(100),
      control: z.coerce.number().min(0).max(100),
      stamina: z.coerce.number().min(0).max(100),
      breaking: z.coerce.number().min(0).max(100),
    }),
    batting: z.object({
      contact: z.coerce.number().min(0).max(100),
      power: z.coerce.number().min(0).max(100),
      speed: z.coerce.number().min(0).max(100),
      arm: z.coerce.number().min(0).max(100),
      fielding: z.coerce.number().min(0).max(100),
    }),
  }),
});

type CharacterFormValues = z.infer<typeof characterSchema>;

const AdminPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  
  // キャラクター一覧を取得
  const { data: characters = [], isLoading } = useQuery<Character[]>({
    queryKey: ['/api/characters'],
  });
  
  // キャラクター追加・更新のミューテーション
  const createCharacterMutation = useMutation({
    mutationFn: async (data: CharacterFormValues) => {
      const res = await apiRequest("POST", "/api/characters", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/characters'] });
      setIsFormDialogOpen(false);
      toast({
        title: "成功",
        description: "キャラクターが追加されました",
      });
    },
    onError: (error) => {
      toast({
        title: "エラー",
        description: `キャラクターの追加に失敗しました: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // キャラクター更新のミューテーション
  const updateCharacterMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CharacterFormValues }) => {
      const res = await apiRequest("PATCH", `/api/characters/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/characters'] });
      setIsFormDialogOpen(false);
      setSelectedCharacter(null);
      toast({
        title: "成功",
        description: "キャラクターが更新されました",
      });
    },
    onError: (error) => {
      toast({
        title: "エラー",
        description: `キャラクターの更新に失敗しました: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // キャラクター削除のミューテーション
  const deleteCharacterMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/characters/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/characters'] });
      setIsDeleteDialogOpen(false);
      setSelectedCharacter(null);
      toast({
        title: "成功",
        description: "キャラクターが削除されました",
      });
    },
    onError: (error) => {
      toast({
        title: "エラー",
        description: `キャラクターの削除に失敗しました: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // フォーム初期化
  const form = useForm<CharacterFormValues>({
    resolver: zodResolver(characterSchema),
    defaultValues: {
      name: "",
      position: Position.PITCHER,
      rating: 3,
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
        },
      },
    },
  });
  
  // キャラクター編集用にフォームにデータをセット
  const handleEditCharacter = (character: Character) => {
    setSelectedCharacter(character);
    form.reset({
      name: character.name,
      position: character.position as Position,
      rating: character.rating,
      stats: character.stats,
    });
    setIsFormDialogOpen(true);
  };
  
  // 新規キャラクター追加用にフォームをリセット
  const handleAddCharacter = () => {
    setSelectedCharacter(null);
    form.reset({
      name: "",
      position: Position.PITCHER,
      rating: 3,
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
        },
      },
    });
    setIsFormDialogOpen(true);
  };
  
  // フォーム送信処理
  const onSubmit = (values: CharacterFormValues) => {
    if (selectedCharacter) {
      // 更新
      updateCharacterMutation.mutate({ id: selectedCharacter.id, data: values });
    } else {
      // 新規追加
      createCharacterMutation.mutate(values);
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setLocation("/")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            戻る
          </Button>
          <h1 className="text-2xl font-bold">イベントキャラクター管理</h1>
        </div>
        <Button 
          onClick={handleAddCharacter}
          className="bg-[hsl(var(--gaming-blue))]"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          新規キャラクター追加
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>キャラクター一覧</CardTitle>
          <CardDescription>登録されているイベントキャラクターを管理します</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">読み込み中...</div>
          ) : characters.length === 0 ? (
            <div className="text-center py-4">登録されているキャラクターがありません</div>
          ) : (
            <Table>
              <TableCaption>登録キャラクター一覧</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>名前</TableHead>
                  <TableHead>ポジション</TableHead>
                  <TableHead>評価</TableHead>
                  <TableHead className="text-right">アクション</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {characters.map((character) => (
                  <TableRow key={character.id}>
                    <TableCell>{character.id}</TableCell>
                    <TableCell className="font-medium">{character.name}</TableCell>
                    <TableCell>{character.position}</TableCell>
                    <TableCell>{character.rating}★</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCharacter(character)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => {
                            setSelectedCharacter(character);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* キャラクター追加・編集ダイアログ */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedCharacter ? "キャラクターを編集" : "新規キャラクターを追加"}
            </DialogTitle>
            <DialogDescription>
              キャラクター情報を入力してください。
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="ポジションを選択" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {positionOptions.map((position) => (
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
                      <FormLabel>評価（星の数）</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">投手能力</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="stats.pitching.velocity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>球速</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" max="100" {...field} />
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
                          <Input type="number" min="0" max="100" {...field} />
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
                          <Input type="number" min="0" max="100" {...field} />
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
                          <Input type="number" min="0" max="100" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">打撃・野手能力</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="stats.batting.contact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ミート</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" max="100" {...field} />
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
                          <Input type="number" min="0" max="100" {...field} />
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
                          <Input type="number" min="0" max="100" {...field} />
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
                          <Input type="number" min="0" max="100" {...field} />
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
                          <Input type="number" min="0" max="100" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsFormDialogOpen(false)}
                >
                  キャンセル
                </Button>
                <Button 
                  type="submit"
                  className="bg-[hsl(var(--gaming-blue))]"
                  disabled={form.formState.isSubmitting}
                >
                  {selectedCharacter ? "更新する" : "追加する"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* 削除確認ダイアログ */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>キャラクターを削除</DialogTitle>
            <DialogDescription>
              本当に「{selectedCharacter?.name}」を削除しますか？
              この操作は元に戻せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedCharacter) {
                  deleteCharacterMutation.mutate(selectedCharacter.id);
                }
              }}
              disabled={deleteCharacterMutation.isPending}
            >
              削除する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;