import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CharacterFormValues } from "../adminTypes";

export function useCharacterAdmin() {
  const { toast } = useToast();
  const [selectedCharacter, setSelectedCharacter] = useState<number | null>(null);
  const [characterSearchTerm, setCharacterSearchTerm] = useState<string>("");

  // キャラクターデータの取得
  const { data: characters = [], isLoading } = useQuery({
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

  // 検索結果をフィルタリング
  const filteredCharacters = characterSearchTerm 
    ? characters.filter((c: any) => 
        c.name.toLowerCase().includes(characterSearchTerm.toLowerCase()))
    : characters;

  return {
    selectedCharacter,
    setSelectedCharacter,
    characterSearchTerm,
    setCharacterSearchTerm,
    characters,
    filteredCharacters,
    isLoading,
    createCharacterMutation,
    updateCharacterMutation,
    deleteCharacterMutation
  };
}