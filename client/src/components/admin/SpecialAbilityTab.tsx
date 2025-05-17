import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlayerType } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Search, Trash, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  SpecialAbilityFormValues, 
  CharacterSpecialAbilitySetFormValues, 
  specialAbilitySchema, 
  characterSpecialAbilitySetSchema 
} from "./adminTypes";
import { useSpecialAbilityAdmin } from "./hooks/useSpecialAbilityAdmin";

interface SpecialAbilityTabProps {
  selectedCharacter: number | null;
}

export default function SpecialAbilityTab({
  selectedCharacter
}: SpecialAbilityTabProps) {
  // レンダー回数をカウント（デバッグ用）
  const renderCount = React.useRef(0);
  console.log("🔄 SpecialAbilityTab render:", ++renderCount.current);

  const {
    specialAbilities,
    filteredSpecialAbilities,
    isLoadingSpecialAbilities,
    specialAbilitySets,
    isLoadingSpecialAbilitySets,
    selectedSpecialAbility,
    setSelectedSpecialAbility,
    selectedPlayerType,
    setSelectedPlayerType,
    selectedAbilitySetId,
    setSelectedAbilitySetId,
    abilitySearchTerm,
    setAbilitySearchTerm,
    createSpecialAbilityMutation,
    updateSpecialAbilityMutation,
    deleteSpecialAbilityMutation,
    createSpecialAbilitySetMutation,
    deleteSpecialAbilitySetMutation,
    addSpecialAbilityToSetMutation,
    removeSpecialAbilityFromSetMutation
  } = useSpecialAbilityAdmin(selectedCharacter);

  // 金特追加・編集フォーム
  const specialAbilityForm = useForm<SpecialAbilityFormValues>({
    resolver: zodResolver(specialAbilitySchema),
    defaultValues: {
      name: "",
      description: "",
      category: "打撃系",
      playerType: PlayerType.PITCHER
    }
  });

  // 金特セット追加フォーム
  const specialAbilitySetForm = useForm<CharacterSpecialAbilitySetFormValues>({
    resolver: zodResolver(characterSpecialAbilitySetSchema),
    defaultValues: {
      characterId: selectedCharacter || undefined,
      choiceType: "スタジアム",
      playerType: PlayerType.PITCHER,
      routeName: ""
    }
  });

  // useRefはコンポーネントのトップレベルで宣言
  const shouldResetAbility = React.useRef(true);

  // 選択された金特が変更されたときの処理
  React.useEffect(() => {
    console.log("🌀 [effect] selectedSpecialAbility:", selectedSpecialAbility, "specialAbilities.length:", specialAbilities.length);
    
    // データのロードを待つ
    if (specialAbilities.length === 0) return;
    
    if (selectedSpecialAbility) {
      const ability = specialAbilities.find((a: any) => a.id === selectedSpecialAbility);
      if (ability && shouldResetAbility.current) {
        shouldResetAbility.current = false;
        specialAbilityForm.reset({
          name: ability.name,
          description: ability.description,
          category: ability.category,
          playerType: ability.playerType
        });
      }
    } else if (shouldResetAbility.current) {
      shouldResetAbility.current = false;
      specialAbilityForm.reset({
        name: "",
        description: "",
        category: "打撃系",
        playerType: PlayerType.PITCHER
      });
    }
    
    return () => {
      shouldResetAbility.current = true;
    };
  }, [selectedSpecialAbility, specialAbilities]); // specialAbilityFormを依存配列から削除

  // useRefはコンポーネントのトップレベルで宣言
  const shouldUpdateCharacter = React.useRef(true);
  
  // 選択されたキャラクターが変更されたときの処理
  React.useEffect(() => {
    console.log("🌀 [effect] selectedCharacter:", selectedCharacter);
    
    if (selectedCharacter && shouldUpdateCharacter.current) {
      shouldUpdateCharacter.current = false;
      specialAbilitySetForm.setValue("characterId", selectedCharacter);
    }
    
    return () => {
      shouldUpdateCharacter.current = true;
    };
  }, [selectedCharacter]); // specialAbilitySetFormを依存配列から削除

  // 金特追加・更新処理
  const onSpecialAbilitySubmit = (values: SpecialAbilityFormValues) => {
    if (selectedSpecialAbility) {
      updateSpecialAbilityMutation.mutate({ id: selectedSpecialAbility, data: values });
    } else {
      createSpecialAbilityMutation.mutate(values);
      specialAbilityForm.reset({
        name: "",
        description: "",
        category: values.category,
        playerType: values.playerType
      });
    }
  };

  // 金特セット追加処理
  const onSpecialAbilitySetSubmit = (values: CharacterSpecialAbilitySetFormValues) => {
    if (!selectedCharacter) return;
    
    const data = {
      ...values,
      characterId: selectedCharacter
    };
    
    createSpecialAbilitySetMutation.mutate(data);
  };

  // 選択中の金特セット
  const selectedSet = selectedAbilitySetId 
    ? specialAbilitySets.find((set: any) => set.id === selectedAbilitySetId)
    : null;

  // 選択中のセットに追加済みの金特IDリスト
  const addedAbilityIds = selectedSet ? selectedSet.abilities.map((ability: any) => ability.id) : [];

  // 金特を金特セットに追加
  const handleAddSpecialAbilityToSet = (abilityId: number) => {
    if (!selectedAbilitySetId) return;
    
    addSpecialAbilityToSetMutation.mutate({
      setId: selectedAbilitySetId,
      specialAbilityId: abilityId,
      order: (selectedSet?.abilities.length || 0) + 1
    });
  };

  // 金特を金特セットから削除
  const handleRemoveSpecialAbilityFromSet = (abilityId: number) => {
    if (!selectedAbilitySetId) return;
    
    removeSpecialAbilityFromSetMutation.mutate({
      setId: selectedAbilitySetId,
      specialAbilityId: abilityId
    });
  };

  const isSpecialAbilitySubmitting = createSpecialAbilityMutation.isPending || updateSpecialAbilityMutation.isPending;
  const isSpecialAbilityDeleting = deleteSpecialAbilityMutation.isPending;
  const isSpecialAbilitySetSubmitting = createSpecialAbilitySetMutation.isPending;
  const isSpecialAbilitySetDeleting = deleteSpecialAbilitySetMutation.isPending;
  const isAddingAbilityToSet = addSpecialAbilityToSetMutation.isPending;
  const isRemovingAbilityFromSet = removeSpecialAbilityFromSetMutation.isPending;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="manage">
        <TabsList className="mb-4">
          <TabsTrigger value="manage">金特セット管理</TabsTrigger>
          <TabsTrigger value="abilities">金特マスター管理</TabsTrigger>
        </TabsList>
        
        {/* 金特セット管理タブ */}
        <TabsContent value="manage">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 金特セット一覧 */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>金特セット一覧</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* プレイヤータイプフィルター */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={selectedPlayerType === "_all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedPlayerType("_all")}
                    >
                      全て
                    </Button>
                    <Button
                      variant={selectedPlayerType === PlayerType.PITCHER ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedPlayerType(PlayerType.PITCHER)}
                    >
                      投手
                    </Button>
                    <Button
                      variant={selectedPlayerType === PlayerType.FIELDER ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedPlayerType(PlayerType.FIELDER)}
                    >
                      野手
                    </Button>
                  </div>
                  
                  {!selectedCharacter ? (
                    <div className="text-center py-4 text-muted-foreground">
                      キャラクターを選択してください
                    </div>
                  ) : isLoadingSpecialAbilitySets ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : specialAbilitySets.length > 0 ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {specialAbilitySets.map((set: any) => (
                        <div 
                          key={set.id} 
                          className={`p-3 border rounded-md cursor-pointer transition-colors ${selectedAbilitySetId === set.id ? 'bg-muted border-primary' : 'hover:bg-muted/50'}`}
                          onClick={() => setSelectedAbilitySetId(set.id)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{set.choiceType}</div>
                              {set.routeName && (
                                <div className="text-sm">{set.routeName}</div>
                              )}
                              <div className="flex items-center gap-1 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {set.playerType === PlayerType.PITCHER ? "投手" : "野手"}
                                </Badge>
                                {set.abilities.length > 0 && (
                                  <Badge variant="secondary" className="text-xs">
                                    金特 {set.abilities.length}個
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm("このセットを削除してもよろしいですか？")) {
                                  deleteSpecialAbilitySetMutation.mutate(set.id);
                                }
                              }}
                              disabled={isSpecialAbilitySetDeleting}
                            >
                              {isSpecialAbilitySetDeleting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      金特セットがありません
                    </div>
                  )}
                  
                  {selectedCharacter && (
                    <div className="pt-2 border-t">
                      <Form {...specialAbilitySetForm}>
                        <form onSubmit={specialAbilitySetForm.handleSubmit(onSpecialAbilitySetSubmit)} className="space-y-4">
                          <FormField
                            control={specialAbilitySetForm.control}
                            name="choiceType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>選択タイプ</FormLabel>
                                <FormControl>
                                  <select
                                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={field.value}
                                    onChange={(e) => {
                                      field.onChange(e.target.value);
                                    }}
                                  >
                                    <option key="stadium-option" value="スタジアム">スタジアム</option>
                                    <option key="dorm-option" value="寮">寮</option>
                                    <option key="gym-option" value="ジム">ジム</option>
                                    <option key="restaurant-option" value="レストラン">レストラン</option>
                                    <option key="exchange-option" value="交換">交換</option>
                                    <option key="other-option" value="その他">その他</option>
                                  </select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={specialAbilitySetForm.control}
                            name="playerType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>プレイヤータイプ</FormLabel>
                                <FormControl>
                                  <select
                                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={field.value}
                                    onChange={(e) => {
                                      field.onChange(e.target.value);
                                    }}
                                  >
                                    <option key="pitcher-type" value={PlayerType.PITCHER}>投手</option>
                                    <option key="fielder-type" value={PlayerType.FIELDER}>野手</option>
                                  </select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={specialAbilitySetForm.control}
                            name="routeName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>ルート名</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="例: Aルート、友情ルートなど"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button
                            type="submit"
                            disabled={isSpecialAbilitySetSubmitting}
                            className="w-full"
                          >
                            {isSpecialAbilitySetSubmitting ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Plus className="mr-2 h-4 w-4" />
                            )}
                            金特セットを追加
                          </Button>
                        </form>
                      </Form>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* 金特セット詳細・金特追加 */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>
                  {selectedSet ? (
                    <span>
                      金特セット: {selectedSet.choiceType}
                      {selectedSet.routeName && ` (${selectedSet.routeName})`}
                    </span>
                  ) : (
                    "金特セットを選択"
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedAbilitySetId ? (
                  <div className="text-center py-4 text-muted-foreground">
                    左側のリストから金特セットを選択してください
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* 金特検索 */}
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="金特を検索..."
                        className="pl-8"
                        value={abilitySearchTerm}
                        onChange={(e) => setAbilitySearchTerm(e.target.value)}
                      />
                      {abilitySearchTerm && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1.5 h-7 w-7"
                          onClick={() => setAbilitySearchTerm("")}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    {/* セットに追加済みの金特 */}
                    {selectedSet?.abilities.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">追加済み金特</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedSet.abilities.map((ability: any) => (
                            <Badge
                              key={ability.id}
                              variant="secondary"
                              className="px-3 py-1.5 text-sm gap-1.5"
                            >
                              {ability.name}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 p-0"
                                onClick={() => handleRemoveSpecialAbilityFromSet(ability.id)}
                                disabled={isRemovingAbilityFromSet}
                              >
                                {isRemovingAbilityFromSet ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <XCircle className="h-3 w-3" />
                                )}
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* 追加可能な金特リスト */}
                    <div className="border rounded-md">
                      <div className="p-3 bg-muted border-b font-medium">
                        追加可能な金特一覧
                      </div>
                      <div className="divide-y max-h-[400px] overflow-y-auto">
                        {isLoadingSpecialAbilities ? (
                          <div className="flex justify-center items-center py-6">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                          </div>
                        ) : filteredSpecialAbilities.length > 0 ? (
                          filteredSpecialAbilities
                            .filter((ability: any) => {
                              // プレイヤータイプでフィルタリング
                              const playerTypeMatch = !selectedSet || ability.playerType === selectedSet.playerType;
                              // 既に追加済みかどうかでフィルタリング
                              const notAdded = !addedAbilityIds.includes(ability.id);
                              return playerTypeMatch && notAdded;
                            })
                            .map((ability: any) => (
                              <div
                                key={ability.id}
                                className="p-3 hover:bg-muted/50 flex justify-between items-center"
                              >
                                <div>
                                  <div className="font-medium">{ability.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {ability.category} · {ability.playerType === PlayerType.PITCHER ? "投手" : "野手"}専用
                                  </div>
                                  {ability.description && (
                                    <div className="text-sm mt-1">
                                      {ability.description}
                                    </div>
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => handleAddSpecialAbilityToSet(ability.id)}
                                  disabled={isAddingAbilityToSet}
                                >
                                  {isAddingAbilityToSet ? (
                                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                  ) : (
                                    <Plus className="mr-1 h-3 w-3" />
                                  )}
                                  追加
                                </Button>
                              </div>
                            ))
                        ) : (
                          <div className="py-6 text-center text-muted-foreground">
                            {abilitySearchTerm
                              ? "検索条件に一致する金特が見つかりません"
                              : "追加可能な金特がありません"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* 金特マスター管理タブ */}
        <TabsContent value="abilities">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 金特一覧 */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>金特一覧</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="金特を検索..."
                      className="pl-8"
                      value={abilitySearchTerm}
                      onChange={(e) => setAbilitySearchTerm(e.target.value)}
                    />
                    {abilitySearchTerm && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1.5 h-7 w-7"
                        onClick={() => setAbilitySearchTerm("")}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  {/* プレイヤータイプフィルター */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={selectedPlayerType === PlayerType.PITCHER ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedPlayerType(PlayerType.PITCHER)}
                    >
                      投手
                    </Button>
                    <Button
                      variant={selectedPlayerType === PlayerType.FIELDER ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedPlayerType(PlayerType.FIELDER)}
                    >
                      野手
                    </Button>
                  </div>
                  
                  {isLoadingSpecialAbilities ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredSpecialAbilities.length > 0 ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {filteredSpecialAbilities
                        .filter((ability: any) => {
                          // プレイヤータイプでフィルタリング
                          return ability.playerType === selectedPlayerType;
                        })
                        .map((ability: any) => (
                          <div
                            key={ability.id}
                            className={`p-3 border rounded-md cursor-pointer transition-colors ${selectedSpecialAbility === ability.id ? 'bg-muted border-primary' : 'hover:bg-muted/50'}`}
                            onClick={() => setSelectedSpecialAbility(ability.id)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">{ability.name}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {ability.category} · {ability.playerType === PlayerType.PITCHER ? "投手" : "野手"}専用
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm("この金特を削除してもよろしいですか？\n(すでに使用しているセットからも削除されます)")) {
                                    deleteSpecialAbilityMutation.mutate(ability.id);
                                  }
                                }}
                                disabled={isSpecialAbilityDeleting}
                              >
                                {isSpecialAbilityDeleting ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      {abilitySearchTerm
                        ? "検索条件に一致する金特が見つかりません"
                        : "金特がありません"}
                    </div>
                  )}
                  
                  <Button 
                    className="w-full" 
                    variant="outline" 
                    onClick={() => setSelectedSpecialAbility(null)}
                  >
                    新規金特
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* 金特追加・編集フォーム */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>
                  {selectedSpecialAbility ? "金特編集" : "新規金特作成"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...specialAbilityForm}>
                  <form onSubmit={specialAbilityForm.handleSubmit(onSpecialAbilitySubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={specialAbilityForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>金特名</FormLabel>
                            <FormControl>
                              <Input placeholder="例：ド根性" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={specialAbilityForm.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>カテゴリ</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="カテゴリを選択" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="打撃系">打撃系</SelectItem>
                                <SelectItem value="走塁系">走塁系</SelectItem>
                                <SelectItem value="守備系">守備系</SelectItem>
                                <SelectItem value="投球系">投球系</SelectItem>
                                <SelectItem value="精神系">精神系</SelectItem>
                                <SelectItem value="特殊系">特殊系</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={specialAbilityForm.control}
                      name="playerType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>プレイヤータイプ</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="プレイヤータイプを選択" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={PlayerType.PITCHER}>投手</SelectItem>
                              <SelectItem value={PlayerType.FIELDER}>野手</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={specialAbilityForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>説明</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="金特の効果説明" 
                              className="resize-none" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-between">
                      <Button
                        type="submit"
                        disabled={isSpecialAbilitySubmitting}
                      >
                        {isSpecialAbilitySubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {selectedSpecialAbility ? "更新" : "作成"}
                      </Button>
                      
                      {selectedSpecialAbility && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setSelectedSpecialAbility(null)}
                        >
                          新規作成モードへ
                        </Button>
                      )}
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}