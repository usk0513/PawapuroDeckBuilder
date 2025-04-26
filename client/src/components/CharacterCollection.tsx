import React, { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CharacterCard from "@/components/CharacterCard";
import CharacterForm from "@/components/CharacterForm";
import { useQuery } from "@tanstack/react-query";
import { Character, CharacterType } from "@/lib/constants";
import { ScrollArea } from "@/components/ui/scroll-area";

const CharacterCollection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPosition, setSelectedPosition] = useState<CharacterType | "ALL">("ALL");
  const [showOwned, setShowOwned] = useState(false);
  
  const { data: characters = [] } = useQuery<Character[]>({
    queryKey: ['/api/characters'],
  });
  
  // Filter characters based on search, position, and owned status
  const filteredCharacters = characters.filter(character => {
    const matchesSearch = character.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = selectedPosition === "ALL" || character.position === selectedPosition;
    const matchesOwned = !showOwned || character.owned;
    
    return matchesSearch && matchesPosition && matchesOwned;
  });
  
  const handlePositionFilter = (position: CharacterType | "ALL") => {
    setSelectedPosition(position);
  };
  
  const handleOwnedFilter = () => {
    setShowOwned(!showOwned);
  };
  
  return (
    <>
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-rounded font-bold text-xl text-gray-800">キャラクター一覧</h2>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="text-[hsl(var(--gaming-blue))] bg-blue-100 hover:bg-blue-200 p-2 h-8 w-8">
              <Filter className="h-4 w-4" />
            </Button>
            <div className="relative">
              <Input
                type="text"
                placeholder="検索..."
                className="pl-8 pr-4 py-1 h-8 text-sm rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
        
        <div className="mb-3 flex flex-wrap gap-2">
          <Badge 
            variant={selectedPosition === "ALL" ? "default" : "outline"}
            className={selectedPosition === "ALL" ? "bg-[hsl(var(--gaming-blue))]" : ""}
            onClick={() => handlePositionFilter("ALL")}
          >
            全て
          </Badge>
          <Badge 
            variant={selectedPosition === CharacterType.PITCHER ? "default" : "outline"}
            className={selectedPosition === CharacterType.PITCHER ? "bg-[hsl(var(--gaming-blue))]" : ""}
            onClick={() => handlePositionFilter(CharacterType.PITCHER)}
          >
            投手
          </Badge>
          <Badge 
            variant={selectedPosition === CharacterType.BATTER ? "default" : "outline"}
            className={selectedPosition === CharacterType.BATTER ? "bg-[hsl(var(--gaming-blue))]" : ""}
            onClick={() => handlePositionFilter(CharacterType.BATTER)}
          >
            野手
          </Badge>
          <Badge 
            variant={selectedPosition === CharacterType.GIRLFRIEND ? "default" : "outline"}
            className={selectedPosition === CharacterType.GIRLFRIEND ? "bg-[hsl(var(--gaming-blue))]" : ""}
            onClick={() => handlePositionFilter(CharacterType.GIRLFRIEND)}
          >
            彼女
          </Badge>
          <Badge 
            variant={selectedPosition === CharacterType.PARTNER ? "default" : "outline"}
            className={selectedPosition === CharacterType.PARTNER ? "bg-[hsl(var(--gaming-blue))]" : ""}
            onClick={() => handlePositionFilter(CharacterType.PARTNER)}
          >
            相棒
          </Badge>
          <Badge 
            variant={showOwned ? "default" : "outline"}
            className={showOwned ? "bg-[hsl(var(--gaming-blue))]" : ""}
            onClick={handleOwnedFilter}
          >
            所持済
          </Badge>
        </div>
        
        <ScrollArea className="h-[calc(100vh-380px)]">
          <div className="pr-4 space-y-3">
            {filteredCharacters.map(character => (
              <CharacterCard key={character.id} character={character} />
            ))}
            
            {filteredCharacters.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                キャラクターが見つかりませんでした
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      
      <CharacterForm />
    </>
  );
};

export default CharacterCollection;
