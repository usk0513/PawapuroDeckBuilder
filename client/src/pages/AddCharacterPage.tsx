import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import { 
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage 
} from "@/components/ui/form";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Character, Rarity, rarityOptions, levelOptions, awakeningOptions } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Bookmark, Plus } from "lucide-react";

// フォームバリデーションスキーマ
const addOwnedCharacterSchema = z.object({
  characterId: z.number({
    required_error: "キャラクターを選択してください",
    invalid_type_error: "キャラクターを選択してください"
  }),
  level: z.coerce.number().min(1).max(5),
  awakening: z.coerce.number().min(0).max(5),
  rarity: z.nativeEnum(Rarity, {
    errorMap: () => ({ message: "レアリティを選択してください" }),
  }),
});

type AddOwnedCharacterFormValues = z.infer<typeof addOwnedCharacterSchema>;

const AddCharacterPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  
  // キャラクター一覧を取得
  const { data: allCharacters = [], isLoading: isLoadingCharacters } = useQuery<Character[]>({
    queryKey: ['/api/characters'],
  });
  
  // 所持キャラクター一覧を取得
  const { data: ownedCharacters = [], isLoading: isLoadingOwnedCharacters } = useQuery<Character[]>({
    queryKey: ['/api/owned-characters'],
  });
  
  // 所持キャラクター追加のミューテーション
  const addOwnedCharacterMutation = useMutation({
    mutationFn: async (data: AddOwnedCharacterFormValues) => {
      const res = await apiRequest("POST", "/api/owned-characters", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owned-characters'] });
      setIsDialogOpen(false);
      toast({
        title: "成功",
        description: "キャラクターが所持リストに追加されました",
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
  
  // フォーム初期化
  const form = useForm<AddOwnedCharacterFormValues>({
    resolver: zodResolver(addOwnedCharacterSchema),
    defaultValues: {
      level: 1,
      awakening: 0,
      rarity: Rarity.N,
    },
  });
  
  // キャラクター選択時に詳細情報をセット
  const handleSelectCharacter = (character: Character) => {
    setSelectedCharacter(character);
    form.setValue("characterId", character.id);
    setIsDialogOpen(true);
  };
  
  // フォーム送信処理
  const onSubmit = (values: AddOwnedCharacterFormValues) => {
    addOwnedCharacterMutation.mutate(values);
  };
  
  // すでに所持しているキャラクターのIDリスト
  const ownedCharacterIds = ownedCharacters.map(c => c.id);
  
  // 所持していないキャラクターのリスト（追加候補）
  const availableCharacters = allCharacters.filter(c => !ownedCharacterIds.includes(c.id));
  
  // ポジション別に背景色のクラスを取得
  const getPositionBgClass = (position: string) => {
    switch (position) {
      case "投手": return "bg-blue-100";
      case "捕手": return "bg-purple-100";
      case "内野": return "bg-yellow-100";
      case "外野": return "bg-red-100";
      default: return "bg-gray-100";
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
          <h1 className="text-2xl font-bold">イベントキャラクター登録</h1>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 追加候補のキャラクター一覧 */}
        <Card>
          <CardHeader>
            <CardTitle>登録可能なキャラクター</CardTitle>
            <CardDescription>所持していないキャラクターの一覧です</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingCharacters || isLoadingOwnedCharacters ? (
              <div className="text-center py-4">読み込み中...</div>
            ) : availableCharacters.length === 0 ? (
              <div className="text-center py-4">登録可能なキャラクターがありません</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {availableCharacters.map((character) => (
                  <div 
                    key={character.id}
                    className="border rounded-lg overflow-hidden cursor-pointer hover:border-[hsl(var(--gaming-blue))] transition-colors"
                    onClick={() => handleSelectCharacter(character)}
                  >
                    <div className="flex p-3">
                      <div className={`w-12 h-12 rounded-lg ${getPositionBgClass(character.position)} flex items-center justify-center overflow-hidden mr-3`}>
                        <div className="flex items-center justify-center w-full h-full text-xl font-bold text-gray-600">
                          {character.name.charAt(0)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{character.name}</h3>
                        <div className="flex justify-between mt-1 text-xs text-gray-600">
                          <span>{character.position}</span>
                          <span>{character.rating}★</span>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="ml-2 self-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectCharacter(character);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* 既に所持しているキャラクター一覧 */}
        <Card>
          <CardHeader>
            <CardTitle>所持キャラクター</CardTitle>
            <CardDescription>あなたが所持しているキャラクターの一覧です</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingOwnedCharacters ? (
              <div className="text-center py-4">読み込み中...</div>
            ) : ownedCharacters.length === 0 ? (
              <div className="text-center py-4">所持キャラクターがありません</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ownedCharacters.map((character) => (
                  <div 
                    key={character.id}
                    className="border rounded-lg overflow-hidden"
                  >
                    <div className="flex p-3">
                      <div className={`w-12 h-12 rounded-lg ${getPositionBgClass(character.position)} flex items-center justify-center overflow-hidden mr-3`}>
                        <div className="flex items-center justify-center w-full h-full text-xl font-bold text-gray-600">
                          {character.name.charAt(0)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{character.name}</h3>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">Lv.{character.level}</span>
                          {character.awakening > 0 && (
                            <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full">覚醒{character.awakening}</span>
                          )}
                          <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">{character.rarity}</span>
                        </div>
                      </div>
                      <div className="ml-2 self-center">
                        <Bookmark className="h-4 w-4 text-[hsl(var(--gaming-blue))]" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* キャラクター追加ダイアログ */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>キャラクターを所持リストに追加</DialogTitle>
            <DialogDescription>
              {selectedCharacter?.name} のレベル、覚醒、レアリティを設定してください。
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>レベル</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="レベルを選択" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {levelOptions.map((level) => (
                          <SelectItem key={level} value={level.toString()}>
                            レベル {level}
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
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="覚醒レベルを選択" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {awakeningOptions.map((awakening) => (
                          <SelectItem key={awakening} value={awakening.toString()}>
                            {awakening === 0 ? "覚醒なし" : `覚醒 ${awakening}`}
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
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="レアリティを選択" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {rarityOptions.map((rarity) => (
                          <SelectItem key={rarity} value={rarity}>
                            {rarity}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  キャンセル
                </Button>
                <Button 
                  type="submit"
                  className="bg-[hsl(var(--gaming-blue))]"
                  disabled={form.formState.isSubmitting || addOwnedCharacterMutation.isPending}
                >
                  追加する
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddCharacterPage;