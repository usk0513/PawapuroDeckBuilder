import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlayerType } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { friendshipAbilitySchema, FriendshipAbilityFormValues } from "./adminTypes";
import { useFriendshipAbilityAdmin } from "./hooks/useFriendshipAbilityAdmin";

interface FriendshipAbilityTabProps {
  selectedCharacter: number | null;
}

export default function FriendshipAbilityTab({
  selectedCharacter
}: FriendshipAbilityTabProps) {
  const {
    friendshipAbilities,
    isLoadingFriendshipAbilities,
    friendshipPlayerType,
    setFriendshipPlayerType,
    createFriendshipAbilityMutation,
    deleteFriendshipAbilityMutation
  } = useFriendshipAbilityAdmin(selectedCharacter);

  // 友情特殊能力フォーム
  const friendshipAbilityForm = useForm<FriendshipAbilityFormValues>({
    resolver: zodResolver(friendshipAbilitySchema),
    defaultValues: {
      characterId: selectedCharacter || undefined,
      playerType: PlayerType.PITCHER,
      name: "",
    }
  });

  // 初期化: フォームのcharacterIdを更新
  React.useEffect(() => {
    if (selectedCharacter) {
      friendshipAbilityForm.setValue("characterId", selectedCharacter);
    }
  }, [selectedCharacter, friendshipAbilityForm]);

  // プレイヤータイプの変更ハンドラー
  const handlePlayerTypeChange = (value: PlayerType) => {
    setFriendshipPlayerType(value);
    friendshipAbilityForm.setValue("playerType", value);
  };

  // 友情特殊能力追加処理
  const onFriendshipAbilitySubmit = (values: FriendshipAbilityFormValues) => {
    if (!selectedCharacter) return;
    
    const data = {
      ...values,
      characterId: selectedCharacter
    };
    
    createFriendshipAbilityMutation.mutate(data);
    
    // フォームをリセット
    friendshipAbilityForm.reset({
      characterId: selectedCharacter,
      playerType: values.playerType,
      name: "",
    });
  };
  
  const isFriendshipAbilitySubmitting = createFriendshipAbilityMutation.isPending;
  const isFriendshipAbilityDeleting = deleteFriendshipAbilityMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 友情特殊能力一覧 */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>友情特殊能力一覧</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* プレイヤータイプフィルター */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={friendshipPlayerType === PlayerType.PITCHER ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePlayerTypeChange(PlayerType.PITCHER)}
                >
                  投手
                </Button>
                <Button
                  variant={friendshipPlayerType === PlayerType.FIELDER ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePlayerTypeChange(PlayerType.FIELDER)}
                >
                  野手
                </Button>
              </div>
              
              {isLoadingFriendshipAbilities ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : friendshipAbilities.filter((ability: any) => ability.playerType === friendshipPlayerType).length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {friendshipAbilities
                    .filter((ability: any) => ability.playerType === friendshipPlayerType)
                    .map((ability: any) => (
                      <div 
                        key={ability.id} 
                        className="flex justify-between items-center p-2 border rounded-md"
                      >
                        <div>
                          <div className="font-medium">{ability.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {ability.playerType === PlayerType.PITCHER ? "投手" : "野手"}専用
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteFriendshipAbilityMutation.mutate(ability.id)}
                          disabled={isFriendshipAbilityDeleting}
                        >
                          {isFriendshipAbilityDeleting ? (
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
                  登録済みの友情特殊能力はありません
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* 友情特殊能力追加フォーム */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>友情特殊能力追加</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedCharacter ? (
              <div className="text-center py-4 text-muted-foreground">
                キャラクターを選択してください
              </div>
            ) : (
              <Form {...friendshipAbilityForm}>
                <form onSubmit={friendshipAbilityForm.handleSubmit(onFriendshipAbilitySubmit)} className="space-y-4">
                  <FormField
                    control={friendshipAbilityForm.control}
                    name="playerType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>プレイヤータイプ</FormLabel>
                        <Select
                          name={field.name}
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            setFriendshipPlayerType(value as PlayerType);
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="プレイヤータイプを選択" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem key="pitcher-option" value={PlayerType.PITCHER}>投手</SelectItem>
                            <SelectItem key="fielder-option" value={PlayerType.FIELDER}>野手</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={friendshipAbilityForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>友情特殊能力名</FormLabel>
                        <FormControl>
                          <Input
                            id="name"
                            placeholder="例: 守備職人や球速アップなど"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button
                    type="submit"
                    disabled={isFriendshipAbilitySubmitting}
                    className="w-full"
                  >
                    {isFriendshipAbilitySubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="mr-2 h-4 w-4" />
                    )}
                    友情特殊能力を追加
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