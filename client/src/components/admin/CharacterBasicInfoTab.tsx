import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  CharacterType, 
  EventTiming,
  CharacterRole 
} from "@shared/schema";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trash } from "lucide-react";
import { useCharacterAdmin } from "./hooks/useCharacterAdmin";
import { characterSchema, CharacterFormValues } from "./adminTypes";
import { 
  positionOptions, 
  specialTrainingOptions, 
  eventTimingOptions, 
  characterRoleOptions
} from "@/lib/constants";

interface CharacterBasicInfoTabProps {
  selectedCharacter: number | null;
  setSelectedCharacter: (id: number | null) => void;
  characterSearchTerm: string;
  setCharacterSearchTerm: (term: string) => void;
}

export default function CharacterBasicInfoTab({
  selectedCharacter,
  setSelectedCharacter,
  characterSearchTerm,
  setCharacterSearchTerm
}: CharacterBasicInfoTabProps) {
  const { 
    characters, 
    filteredCharacters,
    isLoading,
    createCharacterMutation,
    updateCharacterMutation,
    deleteCharacterMutation
  } = useCharacterAdmin();

  const form = useForm<CharacterFormValues>({
    resolver: zodResolver(characterSchema),
    defaultValues: {
      name: "",
      position: CharacterType.PITCHER,
      specialTrainings: [],
      eventTiming: undefined,
      stats: {
        pitching: {
          velocity: 0,
          control: 0,
          stamina: 0,
          breaking: 0,
        },
        batting: {
          contact: 0,
          power: 0,
          speed: 0,
          arm: 0,
          fielding: 0,
        }
      }
    }
  });

  // 選択されたキャラクターが変更されたときの処理
  React.useEffect(() => {
    if (selectedCharacter) {
      const character = characters.find((c: any) => c.id === selectedCharacter);
      if (character) {
        form.reset({
          name: character.name,
          position: character.position as CharacterType,
          specialTrainings: character.specialTrainings || [],
          eventTiming: character.eventTiming || undefined,
          stats: character.stats,
          canAwaken: character.canAwaken,
          role: character.role as CharacterRole
        });
      }
    } else {
      form.reset({
        name: "",
        position: CharacterType.PITCHER,
        specialTrainings: [],
        eventTiming: undefined,
        stats: {
          pitching: {
            velocity: 0,
            control: 0,
            stamina: 0,
            breaking: 0,
          },
          batting: {
            contact: 0,
            power: 0,
            speed: 0,
            arm: 0,
            fielding: 0,
          }
        }
      });
    }
  }, [selectedCharacter, characters, form]);

  const onSubmit = (values: CharacterFormValues) => {
    if (selectedCharacter) {
      updateCharacterMutation.mutate({ id: selectedCharacter, data: values });
    } else {
      createCharacterMutation.mutate(values);
    }
  };

  const handleDelete = () => {
    if (selectedCharacter && confirm("本当にこのキャラクターを削除しますか？")) {
      deleteCharacterMutation.mutate(selectedCharacter);
    }
  };

  const isSubmitting = createCharacterMutation.isPending || updateCharacterMutation.isPending;
  const isDeleting = deleteCharacterMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* キャラクター一覧 */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>キャラクター一覧</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="キャラクター名で検索..."
                value={characterSearchTerm}
                onChange={(e) => setCharacterSearchTerm(e.target.value)}
                className="mb-4"
              />
              
              {isLoading ? (
                <div className="flex justify-center items-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                  {filteredCharacters.length > 0 ? (
                    filteredCharacters.map((c: any) => {
                      console.log("▶️ mapping filteredCharacters:", c.id);
                      return (
                        <Button
                          key={c.id}
                          variant={selectedCharacter === c.id ? "default" : "outline"}
                          className="w-full justify-start"
                          onClick={() => setSelectedCharacter(c.id)}
                        >
                          {c.name}
                        </Button>
                      );
                    })
                  ) : (
                    <p className="text-muted-foreground text-center">キャラクターが見つかりません</p>
                  )}
                </div>
              )}
              
              <Button 
                className="w-full" 
                variant="outline" 
                onClick={() => setSelectedCharacter(null)}
              >
                新規キャラクター
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* キャラクター編集フォーム */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedCharacter ? "キャラクター編集" : "新規キャラクター作成"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 基本情報 */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem key="form-item-name">
                          <FormLabel>キャラクター名</FormLabel>
                          <FormControl>
                            <Input placeholder="例：猪狩守" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem key="form-item-position">
                          <FormLabel>ポジション</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>キャラクター役割</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value as string | undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="役割を選択" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {characterRoleOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            どのような役割のキャラクターか
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="canAwaken"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>覚醒可能</FormLabel>
                            <FormDescription>
                              このキャラクターが覚醒できるかどうか
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* 特殊訓練とイベントタイミング */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="specialTrainings"
                      render={() => (
                        <FormItem>
                          <div className="mb-4">
                            <FormLabel>特殊訓練</FormLabel>
                            <FormDescription>
                              このキャラクターが実行できる特殊訓練
                            </FormDescription>
                          </div>
                          <div className="space-y-2">
                            <FormItem>
                              <FormLabel>特殊訓練</FormLabel>
                              <div className="grid grid-cols-2 gap-2">
                                {specialTrainingOptions.map((item) => {
                                  console.log("▶️ mapping specialTrainingOptions:", item.value);
                                  return (
                                    <div key={item.value} className="flex flex-row items-start space-x-3 space-y-0">
                                      <Checkbox
                                        id={`training-${item.value}`}
                                        checked={form.watch("specialTrainings")?.includes(item.value)}
                                        onCheckedChange={(checked) => {
                                          const currentValue = form.getValues("specialTrainings") || [];
                                          if (checked) {
                                            form.setValue("specialTrainings", [...currentValue, item.value], { shouldValidate: true });
                                          } else {
                                            form.setValue(
                                              "specialTrainings", 
                                              currentValue.filter((value) => value !== item.value),
                                              { shouldValidate: true }
                                            );
                                          }
                                        }}
                                      />
                                      <label 
                                        htmlFor={`training-${item.value}`}
                                        className="text-sm font-normal cursor-pointer"
                                      >
                                        {item.label}
                                      </label>
                                    </div>
                                  );
                                })}
                              </div>
                              <FormMessage />
                            </FormItem>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="eventTiming"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>イベントの発生タイミング</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value as string | undefined}
                              className="flex flex-col space-y-1"
                            >
                              {eventTimingOptions.map((option) => {
                                console.log("▶️ mapping eventTimingOptions:", option.value);
                                return (
                                  <div key={option.value} className="flex items-center space-x-3 space-y-0">
                                    <RadioGroupItem value={option.value} id={`event-${option.value}`} />
                                    <label
                                      htmlFor={`event-${option.value}`}
                                      className="text-sm font-normal cursor-pointer"
                                    >
                                      {option.label}
                                    </label>
                                  </div>
                                );
                              })}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                

                
                <div className="flex items-center justify-between">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8"
                  >
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {selectedCharacter ? "更新" : "作成"}
                  </Button>
                  
                  {selectedCharacter && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Trash className="mr-2 h-4 w-4" />
                      )}
                      削除
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}