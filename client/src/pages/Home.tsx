import React from "react";
import Header from "@/components/Header";
import CharacterCollection from "@/components/CharacterCollection";
import DeckBuilder from "@/components/DeckBuilder";
import DeckStats from "@/components/DeckStats";
import { useDeck } from "@/contexts/DeckContext";
import { Loader2 } from "lucide-react";

const Home: React.FC = () => {
  const { isLoading } = useDeck();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-600">読み込み中...</span>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-6 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Character Collection */}
          <div className="lg:col-span-1">
            <CharacterCollection />
          </div>
          
          {/* Right Column: Deck Builder & Stats */}
          <div className="lg:col-span-2">
            <DeckBuilder />
            <DeckStats />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
