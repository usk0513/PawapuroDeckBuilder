import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  levelOptions, 
  awakeningOptions, 
  positionOptions,
  rarityOptions,
  CharacterType,
  Rarity 
} from "@/lib/constants";

// Form schema for creating a character
const formSchema = z.object({
  name: z.string().min(1, { message: "キャラクター名を入力してください" }),
  position: z.nativeEnum(CharacterType),
  rarity: z.nativeEnum(Rarity),
  level: z.coerce.number().min(1).max(5),
  awakening: z.coerce.number().min(0).max(4),
});

type FormValues = z.infer<typeof formSchema>;

const CharacterForm: React.FC = () => {
  const { toast } = useToast();
  
  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      position: CharacterType.PITCHER,
      rarity: Rarity.N,
      level: 1,
      awakening: 0,
    },
  });
  
  // Create character mutation
  const createCharacterMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // Prepare character data with default stats based on position
      const characterData = {
        ...data,
        rating: 3, // Default rating
        owned: true,
        stats: {
          pitching: {
            velocity: data.position === CharacterType.PITCHER ? 2 : 0,
            control: data.position === CharacterType.PITCHER ? 2 : 0,
            stamina: data.position === CharacterType.PITCHER ? 2 : 0,
            breaking: data.position === CharacterType.PITCHER ? 1 : 0,
          },
          batting: {
            contact: data.position === CharacterType.PITCHER ? 0 : 2,
            power: data.position === CharacterType.BATTER ? 2 : 1,
            speed: data.position === CharacterType.BATTER ? 2 : 1,
            arm: data.position === CharacterType.BATTER ? 2 : 1,
            fielding: data.position === CharacterType.BATTER ? 2 : 1,
          }
        }
      };
      
      const res = await apiRequest('POST', '/api/characters', characterData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/characters'] });
      form.reset();
      toast({
        title: "キャラクターを追加しました",
        description: "新しいキャラクターが登録されました。",
      });
    },
    onError: (error) => {
      toast({
        title: "エラー",
        description: `キャラクターの追加に失敗しました: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Form submission handler
  const onSubmit = (values: FormValues) => {
    createCharacterMutation.mutate(values);
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-rounded font-bold text-xl text-gray-800">キャラ追加</h2>
        <Button className="bg-[hsl(var(--gaming-green))] hover:bg-green-600" size="sm">
          <PlusCircle className="mr-1 h-4 w-4" />
          新規キャラ登録
        </Button>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">キャラ名</FormLabel>
                <FormControl>
                  <Input placeholder="キャラクター名" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">レベル</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="レベルを選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {levelOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="awakening"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">覚醒</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="覚醒を選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {awakeningOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">ポジション</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="ポジションを選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {positionOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="rarity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">レアリティ</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="レアリティを選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {rarityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-[hsl(var(--gaming-blue))] hover:bg-blue-700"
            disabled={createCharacterMutation.isPending}
          >
            {createCharacterMutation.isPending ? "登録中..." : "登録する"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default CharacterForm;
