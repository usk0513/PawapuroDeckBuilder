import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PlayerType } from "@shared/schema";
import { FriendshipAbilityFormValues } from "../adminTypes";

export function useFriendshipAbilityAdmin(selectedCharacter: number | null) {
  const { toast } = useToast();
  // 友情特殊能力関連の状態
  const [friendshipPlayerType, setFriendshipPlayerType] = useState<PlayerType>(PlayerType.PITCHER);

  // 友情特殊能力データの取得
  const { data: friendshipAbilities = [], isLoading: isLoadingFriendshipAbilities } = useQuery({
    queryKey: ["/api/character-friendship-abilities", selectedCharacter],
    queryFn: async () => {
      if (!selectedCharacter) return [];
      try {
        const url = `/api/character-friendship-abilities?characterId=${selectedCharacter}`;
        const res = await fetch(url);
        if (!res.ok) {
          console.error("友情特殊能力データの取得に失敗しました: ", await res.text());
          return [];
        }
        return await res.json();
      } catch (error) {
        console.error("友情特殊能力取得エラー:", error);
        return [];
      }
    },
    enabled: !!selectedCharacter,
  });

  // 友情特殊能力追加ミューテーション
  const createFriendshipAbilityMutation = useMutation({
    mutationFn: async (data: FriendshipAbilityFormValues) => {
      const res = await apiRequest("POST", "/api/character-friendship-abilities", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "友情特殊能力追加に失敗しました");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/character-friendship-abilities", selectedCharacter] 
      });
      toast({
        title: "友情特殊能力追加",
        description: "友情特殊能力が追加されました",
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

  // 友情特殊能力削除ミューテーション
  const deleteFriendshipAbilityMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/character-friendship-abilities/${id}`);
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "友情特殊能力削除に失敗しました");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/character-friendship-abilities", selectedCharacter] 
      });
      toast({
        title: "友情特殊能力削除",
        description: "友情特殊能力が削除されました",
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

  return {
    friendshipAbilities,
    isLoadingFriendshipAbilities,
    friendshipPlayerType,
    setFriendshipPlayerType,
    createFriendshipAbilityMutation,
    deleteFriendshipAbilityMutation
  };
}