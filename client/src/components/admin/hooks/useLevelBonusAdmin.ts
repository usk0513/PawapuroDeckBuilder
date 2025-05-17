import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { LevelBonusFormValues } from "../adminTypes";

export function useLevelBonusAdmin(selectedCharacter: number | null, selectedRarity: string) {
  const { toast } = useToast();
  const [levelBonusRarity, setLevelBonusRarity] = useState<Record<number, string>>({});
  const [levelBonusEffect, setLevelBonusEffect] = useState<Record<number, string>>({});
  const [levelBonusValue, setLevelBonusValue] = useState<Record<number, string>>({});
  const [isBatchSubmitting, setIsBatchSubmitting] = useState(false);

  // レベルボーナスデータの取得
  const { data: levelBonuses = [], isLoading: isLoadingBonuses } = useQuery({
    queryKey: ["/api/character-level-bonuses", selectedCharacter, selectedRarity],
    queryFn: async () => {
      if (!selectedCharacter) return [];
      let url = `/api/character-level-bonuses?characterId=${selectedCharacter}`;
      if (selectedRarity) {
        url += `&rarity=${selectedRarity}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error("レベルボーナスデータの取得に失敗しました");
      return await res.json();
    },
    enabled: !!selectedCharacter,
  });

  // レベルボーナス追加ミューテーション
  const createLevelBonusMutation = useMutation({
    mutationFn: async (data: LevelBonusFormValues) => {
      const res = await apiRequest("POST", "/api/character-level-bonuses", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "レベルボーナス追加に失敗しました");
      }
      return await res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/character-level-bonuses", selectedCharacter, selectedRarity] 
      });
      
      const rarityText = data.rarity ? `（${data.rarity}専用）` : "";
      toast({
        title: "レベルボーナス追加",
        description: `Lv.${data.level}の${data.effectType}${rarityText}ボーナスが追加されました`,
      });
      
      // 個別レベル追加からの場合は、そのレベルだけリセット
      // それ以外（まとめて追加など）の場合は、従来通りの完全リセット
      const level = data.level;
      
      // 効果タイプのリセット
      setLevelBonusEffect((prev) => {
        const updated = { ...prev };
        delete updated[level]; // 効果タイプの選択状態をクリア
        return updated;
      });
      
      // 値のリセット
      setLevelBonusValue((prev) => {
        const updated = { ...prev };
        delete updated[level]; // 値を完全に削除
        return updated;
      });
      
      // レアリティのリセット
      setLevelBonusRarity((prev) => {
        const updated = { ...prev };
        delete updated[level]; // レアリティ選択状態をクリア
        return updated;
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

  // レベルボーナス削除ミューテーション
  const deleteLevelBonusMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/character-level-bonuses/${id}`);
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "レベルボーナス削除に失敗しました");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/character-level-bonuses", selectedCharacter, selectedRarity] 
      });
      toast({
        title: "レベルボーナス削除",
        description: "レベルボーナスが削除されました",
      });
      
      // 一度すべてリセット
      setLevelBonusRarity({});
      setLevelBonusEffect({});
      setLevelBonusValue({});
    },
    onError: (error: Error) => {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // レベルボーナスをまとめて追加する
  const handleBatchSubmit = async (values: Record<number, { effect: string, value: string, rarity?: string }>) => {
    setIsBatchSubmitting(true);
    
    // まとめて登録処理
    try {
      const promises = Object.entries(values).map(async ([levelStr, data]) => {
        const level = parseInt(levelStr, 10);
        if (!level || !data.effect || !data.value) return null;
        
        // 効果タイプと値がある場合のみ追加
        const bonus = {
          characterId: selectedCharacter,
          level,
          effectType: data.effect,
          value: data.value,
          rarity: data.rarity
        };
        
        return createLevelBonusMutation.mutateAsync(bonus as LevelBonusFormValues);
      });
      
      await Promise.all(promises.filter(Boolean));
      
      toast({
        title: "一括追加完了",
        description: "レベルボーナスがまとめて追加されました",
      });
      
      // すべてリセット
      setLevelBonusRarity({});
      setLevelBonusEffect({});
      setLevelBonusValue({});
    } catch (error: any) {
      toast({
        title: "エラー",
        description: error.message || "一括追加中にエラーが発生しました",
        variant: "destructive",
      });
    } finally {
      setIsBatchSubmitting(false);
    }
  };

  // 個別レベル追加処理
  const handleSingleLevelSubmit = (level: number) => {
    if (!selectedCharacter) {
      toast({
        title: "エラー",
        description: "キャラクターが選択されていません",
        variant: "destructive",
      });
      return;
    }
    
    const effectType = levelBonusEffect[level];
    const value = levelBonusValue[level];
    const rarity = levelBonusRarity[level];
    
    if (!effectType || !value) {
      toast({
        title: "エラー",
        description: "効果タイプと値を入力してください",
        variant: "destructive",
      });
      return;
    }
    
    const bonus = {
      characterId: selectedCharacter,
      level,
      effectType,
      value,
      rarity,
      _resetSingleLevel: level // カスタム属性: 個別レベル追加用
    };
    
    createLevelBonusMutation.mutate(bonus as LevelBonusFormValues);
  };

  return {
    levelBonuses,
    isLoadingBonuses,
    levelBonusRarity,
    setLevelBonusRarity,
    levelBonusEffect,
    setLevelBonusEffect,
    levelBonusValue,
    setLevelBonusValue,
    isBatchSubmitting,
    createLevelBonusMutation,
    deleteLevelBonusMutation,
    handleBatchSubmit,
    handleSingleLevelSubmit
  };
}