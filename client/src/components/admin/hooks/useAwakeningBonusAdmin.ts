import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AwakeningBonusFormValues } from "../adminTypes";

export function useAwakeningBonusAdmin(selectedCharacter: number | null) {
  const { toast } = useToast();
  // 覚醒ボーナス関連の状態
  const [awakeningEffect, setAwakeningEffect] = useState<string>("");
  const [awakeningValue, setAwakeningValue] = useState<string>("");
  const [awakeningType, setAwakeningType] = useState<string>("initial"); // 'initial' or 'second'

  // 覚醒ボーナスデータの取得
  const { data: awakeningBonuses = [], isLoading: isLoadingAwakeningBonuses } = useQuery({
    queryKey: ["/api/character-awakening-bonuses", selectedCharacter],
    queryFn: async () => {
      if (!selectedCharacter) return [];
      try {
        const url = `/api/character-awakening-bonuses?characterId=${selectedCharacter}`;
        const res = await fetch(url);
        if (!res.ok) {
          console.error("覚醒ボーナスデータの取得に失敗しました: ", await res.text());
          return [];
        }
        return await res.json();
      } catch (error) {
        console.error("覚醒ボーナス取得エラー:", error);
        return [];
      }
    },
    enabled: !!selectedCharacter,
  });

  // 覚醒ボーナス追加ミューテーション
  const createAwakeningBonusMutation = useMutation({
    mutationFn: async (data: AwakeningBonusFormValues) => {
      const res = await apiRequest("POST", "/api/character-awakening-bonuses", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "覚醒ボーナス追加に失敗しました");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/character-awakening-bonuses", selectedCharacter] 
      });
      toast({
        title: "覚醒ボーナス追加",
        description: "覚醒ボーナスが追加されました",
      });
      
      // 入力フィールドをリセット
      setAwakeningEffect("");
      setAwakeningValue("");
    },
    onError: (error: Error) => {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // 覚醒ボーナス削除ミューテーション
  const deleteAwakeningBonusMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/character-awakening-bonuses/${id}`);
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "覚醒ボーナス削除に失敗しました");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/character-awakening-bonuses", selectedCharacter] 
      });
      toast({
        title: "覚醒ボーナス削除",
        description: "覚醒ボーナスが削除されました",
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
  };
}