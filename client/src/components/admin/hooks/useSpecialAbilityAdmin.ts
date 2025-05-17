import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PlayerType } from "@shared/schema";
import { 
  SpecialAbilityFormValues, 
  CharacterSpecialAbilitySetFormValues, 
  SpecialAbilitySetItemFormValues 
} from "../adminTypes";

export function useSpecialAbilityAdmin(selectedCharacter: number | null) {
  const { toast } = useToast();
  // 金特関連の状態
  const [selectedSpecialAbility, setSelectedSpecialAbility] = useState<number | null>(null);
  const [selectedPlayerType, setSelectedPlayerType] = useState<PlayerType | string>("_all");
  const [selectedAbilitySetId, setSelectedAbilitySetId] = useState<number | null>(null);
  const [abilitySearchTerm, setAbilitySearchTerm] = useState<string>("");

  // 金特データの取得
  const { data: specialAbilities = [], isLoading: isLoadingSpecialAbilities } = useQuery({
    queryKey: ["/api/special-abilities"],
    queryFn: async () => {
      const res = await fetch("/api/special-abilities");
      if (!res.ok) throw new Error("金特データの取得に失敗しました");
      return await res.json();
    }
  });

  // 金特セットデータの取得
  const { data: specialAbilitySets = [], isLoading: isLoadingSpecialAbilitySets } = useQuery({
    queryKey: ["/api/character-special-ability-sets", selectedCharacter, selectedPlayerType],
    queryFn: async () => {
      if (!selectedCharacter) return [];
      let url = `/api/character-special-ability-sets?characterId=${selectedCharacter}`;
      if (selectedPlayerType && selectedPlayerType !== "_all") {
        url += `&playerType=${selectedPlayerType}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error("金特セットデータの取得に失敗しました");
      return await res.json();
    },
    enabled: !!selectedCharacter,
  });

  // 金特追加ミューテーション
  const createSpecialAbilityMutation = useMutation({
    mutationFn: async (data: SpecialAbilityFormValues) => {
      const res = await apiRequest("POST", "/api/special-abilities", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "金特追加に失敗しました");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/special-abilities"] });
      toast({
        title: "金特追加",
        description: "新しい金特が追加されました",
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

  // 金特更新ミューテーション
  const updateSpecialAbilityMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<SpecialAbilityFormValues> }) => {
      const res = await apiRequest("PATCH", `/api/special-abilities/${id}`, data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "金特更新に失敗しました");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/special-abilities"] });
      toast({
        title: "金特更新",
        description: "金特が更新されました",
      });
      setSelectedSpecialAbility(null);
    },
    onError: (error: Error) => {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // 金特削除ミューテーション
  const deleteSpecialAbilityMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/special-abilities/${id}`);
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "金特削除に失敗しました");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/special-abilities"] });
      toast({
        title: "金特削除",
        description: "金特が削除されました",
      });
      setSelectedSpecialAbility(null);
    },
    onError: (error: Error) => {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // 金特セット作成ミューテーション
  const createSpecialAbilitySetMutation = useMutation({
    mutationFn: async (data: CharacterSpecialAbilitySetFormValues) => {
      const res = await apiRequest("POST", "/api/character-special-ability-sets", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "金特セット作成に失敗しました");
      }
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/character-special-ability-sets", selectedCharacter, selectedPlayerType] 
      });
      toast({
        title: "金特セット作成",
        description: `${data.choiceType}の金特セットが作成されました`,
      });
      setSelectedAbilitySetId(data.id);
    },
    onError: (error: Error) => {
      // エラーメッセージに"既に同じルート"という文字列が含まれる場合は特別なエラーメッセージを表示
      if (error.message.includes("既に同じルート")) {
        toast({
          title: "重複エラー",
          description: "同じキャラクター・タイプ・ルートの組み合わせの金特セットは一つしか作成できません",
          variant: "destructive",
        });
      } else {
        toast({
          title: "エラー",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  });

  // 金特セット削除ミューテーション
  const deleteSpecialAbilitySetMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/character-special-ability-sets/${id}`);
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "金特セット削除に失敗しました");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/character-special-ability-sets", selectedCharacter, selectedPlayerType]
      });
      toast({
        title: "金特セット削除",
        description: "金特セットが削除されました",
      });
      setSelectedAbilitySetId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // 金特セットに金特を追加するミューテーション
  const addSpecialAbilityToSetMutation = useMutation({
    mutationFn: async (data: SpecialAbilitySetItemFormValues) => {
      const res = await apiRequest("POST", "/api/special-ability-set-items", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "金特セットへの金特追加に失敗しました");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/character-special-ability-sets", selectedCharacter, selectedPlayerType]
      });
      toast({
        title: "金特追加",
        description: "金特セットに金特が追加されました",
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

  // 金特セットから金特を削除するミューテーション
  const removeSpecialAbilityFromSetMutation = useMutation({
    mutationFn: async ({ setId, specialAbilityId }: { setId: number; specialAbilityId: number }) => {
      const res = await apiRequest("DELETE", `/api/special-ability-set-items?setId=${setId}&specialAbilityId=${specialAbilityId}`);
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "金特セットからの金特削除に失敗しました");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/character-special-ability-sets", selectedCharacter, selectedPlayerType]
      });
      toast({
        title: "金特削除",
        description: "金特セットから金特が削除されました",
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

  // 検索結果をフィルタリング
  const filteredSpecialAbilities = abilitySearchTerm
    ? specialAbilities.filter((ability: any) => 
        ability.name.toLowerCase().includes(abilitySearchTerm.toLowerCase()) ||
        ability.description.toLowerCase().includes(abilitySearchTerm.toLowerCase()))
    : specialAbilities;

  return {
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
  };
}