import React, { useState } from "react";
import { Link } from "wouter";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Gamepad, Save, FolderOpen, Settings, UserPlus } from "lucide-react";
import { useDeck } from "@/contexts/DeckContext";
import { useQuery } from "@tanstack/react-query";
import { Deck } from "@/lib/constants";

const Header: React.FC = () => {
  const { saveDeck, loadDeck } = useDeck();
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false);
  const [selectedDeckId, setSelectedDeckId] = useState<string>("");
  
  const { data: decks = [] } = useQuery<Deck[]>({
    queryKey: ['/api/decks'],
  });
  
  const handleSave = async () => {
    await saveDeck();
  };
  
  const handleLoad = async () => {
    if (selectedDeckId) {
      await loadDeck(parseInt(selectedDeckId));
      setIsLoadDialogOpen(false);
    }
  };
  
  return (
    <header className="bg-[hsl(var(--gaming-blue))] px-4 py-3 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-white font-rounded font-bold text-2xl md:text-3xl flex items-center">
          <Gamepad className="mr-2 h-6 w-6" />
          パワプロデッキメーカー
        </h1>
        <div className="flex space-x-3 items-center">
          <Link href="/add-character">
            <Button
              variant="secondary"
              size="sm"
              className="rounded-full text-[hsl(var(--gaming-blue))] bg-white hover:bg-gray-100"
            >
              <UserPlus className="mr-1 h-4 w-4" />
              キャラ追加
            </Button>
          </Link>

          <Link href="/admin">
            <Button
              variant="secondary"
              size="sm"
              className="rounded-full text-[hsl(var(--gaming-blue))] bg-white hover:bg-gray-100"
            >
              <Settings className="mr-1 h-4 w-4" />
              管理
            </Button>
          </Link>
          
          <Button
            variant="secondary"
            size="sm"
            className="rounded-full text-[hsl(var(--gaming-blue))] bg-white hover:bg-gray-100"
            onClick={handleSave}
          >
            <Save className="mr-1 h-4 w-4" />
            保存
          </Button>
          
          <Dialog open={isLoadDialogOpen} onOpenChange={setIsLoadDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className="rounded-full text-[hsl(var(--gaming-blue))] bg-white hover:bg-gray-100"
              >
                <FolderOpen className="mr-1 h-4 w-4" />
                読み込み
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>デッキを読み込む</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Select 
                    value={selectedDeckId} 
                    onValueChange={setSelectedDeckId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="デッキを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {decks.map(deck => (
                          <SelectItem key={deck.id} value={deck.id.toString()}>
                            {deck.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end">
                  <Button 
                    variant="default" 
                    className="bg-[hsl(var(--gaming-blue))]"
                    onClick={handleLoad}
                    disabled={!selectedDeckId}
                  >
                    読み込む
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
};

export default Header;
