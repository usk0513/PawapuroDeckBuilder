import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Rarity } from "@shared/schema";
import CharacterBasicInfoTab from "../components/admin/CharacterBasicInfoTab";
import LevelBonusTab from "../components/admin/LevelBonusTab";
import AwakeningBonusTab from "../components/admin/AwakeningBonusTab";
import FriendshipAbilityTab from "../components/admin/FriendshipAbilityTab";
import SpecialAbilityTab from "../components/admin/SpecialAbilityTab";

export default function AdminPage() {
  // 共通の状態
  const [selectedCharacter, setSelectedCharacter] = useState<number | null>(null);
  const [characterSearchTerm, setCharacterSearchTerm] = useState<string>("");
  const [selectedRarity, setSelectedRarity] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("characters");

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">管理者ページ</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="characters">キャラクター</TabsTrigger>
          <TabsTrigger value="level-bonus">レベルボーナス</TabsTrigger>
          <TabsTrigger value="awakening-bonus">覚醒ボーナス</TabsTrigger>
          <TabsTrigger value="friendship-ability">友情特殊能力</TabsTrigger>
          <TabsTrigger value="special-ability">金特（特殊能力）</TabsTrigger>
        </TabsList>
        
        {/* キャラクター基本情報タブ */}
        <TabsContent value="characters">
          <CharacterBasicInfoTab
            selectedCharacter={selectedCharacter}
            setSelectedCharacter={setSelectedCharacter}
            characterSearchTerm={characterSearchTerm}
            setCharacterSearchTerm={setCharacterSearchTerm}
          />
        </TabsContent>
        
        {/* レベルボーナスタブ */}
        <TabsContent value="level-bonus">
          <LevelBonusTab
            selectedCharacter={selectedCharacter}
            selectedRarity={selectedRarity}
            setSelectedRarity={setSelectedRarity}
          />
        </TabsContent>
        
        {/* 覚醒ボーナスタブ */}
        <TabsContent value="awakening-bonus">
          <AwakeningBonusTab
            selectedCharacter={selectedCharacter}
          />
        </TabsContent>
        
        {/* 友情特殊能力タブ */}
        <TabsContent value="friendship-ability">
          <FriendshipAbilityTab
            selectedCharacter={selectedCharacter}
          />
        </TabsContent>
        
        {/* 金特（特殊能力）タブ */}
        <TabsContent value="special-ability">
          <SpecialAbilityTab
            selectedCharacter={selectedCharacter}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}