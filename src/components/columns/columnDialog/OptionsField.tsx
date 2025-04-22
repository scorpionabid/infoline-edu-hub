import React, { useState, useEffect } from 'react';
import { Control } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { X, Plus, Edit, Save, Trash } from "lucide-react";
import { ColumnOption } from '@/types/column';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from 'sonner';

interface OptionsFieldProps {
  control: Control<any>;
  options?: ColumnOption[];
  newOption?: string;
  setNewOption?: (value: string) => void;
  addOption?: () => void;
  removeOption?: (option: ColumnOption) => void;
  updateOption?: (oldOption: ColumnOption, newOption: ColumnOption) => void;
}

const OptionsField: React.FC<OptionsFieldProps> = ({
  control,
  options = [],
  newOption = '',
  setNewOption = () => {},
  addOption = () => {},
  removeOption = () => {},
  updateOption = () => {}
}) => {
  const { t } = useLanguage();
  const [editingOption, setEditingOption] = useState<ColumnOption | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editValue, setEditValue] = useState('');
  
  // Əlavə etmə üçün klaviatura hadisəsi
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addOption();
    }
  };
  
  // Redaktə etmə funksiyası
  const handleEdit = (option: ColumnOption) => {
    setEditingOption(option);
    setEditLabel(option.label);
    setEditValue(option.value);
  };
  
  // Redaktəni yadda saxlama funksiyası
  const handleSaveEdit = () => {
    if (!editingOption) return;
    
    if (!editLabel.trim() || !editValue.trim()) {
      toast.error('Label və value boş ola bilməz');
      return;
    }
    
    const updatedOption = {
      label: editLabel,
      value: editValue
    };
    
    updateOption(editingOption, updatedOption);
    setEditingOption(null);
    setEditLabel('');
    setEditValue('');
    
    toast.success('Seçim uğurla yeniləndi');
  };
  
  // Redaktəni ləğv etmə funksiyası
  const handleCancelEdit = () => {
    setEditingOption(null);
    setEditLabel('');
    setEditValue('');
  };
  
  // JSON formatını import etmə funksiyası
  const handleImportJSON = () => {
    try {
      if (!newOption.trim()) {
        toast.error('JSON məlumatı daxil edin');
        return;
      }
      
      let parsedOptions;
      let optionsStr = newOption.trim();
      
      console.log("İmport ediləcək JSON:", optionsStr);
      
      // Xüsusi simvolları təmizləyirik
      optionsStr = optionsStr.replace(/\\"/g, '"'); // Escape edilmiş dırnaqları düzəldirik
      
      // Əgər dırnaqlar içində deyilsə, əlavə edirik
      if (!optionsStr.startsWith('"') && !optionsStr.startsWith('[') && !optionsStr.startsWith('{')) {
        optionsStr = `"${optionsStr}"`;
      }
      
      // Xüsusi format: {"label":"X","value":"x"},{"label":"Y","value":"y"}
      if (optionsStr.includes('},{')) {
        try {
          // Əgər string [ ilə başlamırsa, onu array-ə çeviririk
          let jsonStr = optionsStr;
          if (!jsonStr.startsWith('[')) {
            jsonStr = `[${jsonStr}]`;
          }
          
          // JSON parse etməyə çalışırıq
          try {
            console.log("Parsing JSON:", jsonStr);
            parsedOptions = JSON.parse(jsonStr);
            console.log("Parsed options:", parsedOptions);
          } catch (jsonError) {
            console.warn(`JSON parse error:`, jsonError);
            
            // Əgər JSON parse işləmirsə, manual olaraq parçalayırıq
            const items = optionsStr.split('},{').map(item => {
              // İlk və son elementlər üçün xüsusi işləmə
              let cleanItem = item;
              if (item.startsWith('{') && !item.endsWith('}')) {
                cleanItem = item + '}';
              } else if (!item.startsWith('{') && item.endsWith('}')) {
                cleanItem = '{' + item;
              } else if (!item.startsWith('{') && !item.endsWith('}')) {
                cleanItem = '{' + item + '}';
              }
              
              try {
                console.log("Parsing item:", cleanItem);
                const parsed = JSON.parse(cleanItem);
                console.log("Parsed item:", parsed);
                return parsed;
              } catch (e) {
                console.warn(`Failed to parse item "${cleanItem}":`, e);
                
                // Əgər yenə parse edilə bilmirsə, daha sadə bir yanaşma sınayırıq
                try {
                  // Əsas label və value-nu əldə etməyə çalışırıq
                  const labelMatch = cleanItem.match(/"label"\s*:\s*"([^"]*)"/);
                  const valueMatch = cleanItem.match(/"value"\s*:\s*"([^"]*)"/);
                  
                  if (labelMatch && valueMatch) {
                    return {
                      label: labelMatch[1],
                      value: valueMatch[1]
                    };
                  }
                } catch (regexError) {
                  console.warn("Regex extraction failed:", regexError);
                }
                
                return null;
              }
            }).filter(Boolean);
            
            if (items.length > 0) {
              console.log(`Manually parsed ${items.length} items`);
              parsedOptions = items;
            } else {
              // Əgər heç bir element parse edilə bilmirsə, string-i birbaşa istifadə edirik
              parsedOptions = [{ label: optionsStr, value: optionsStr }];
            }
          }
        } catch (e) {
          console.error(`Failed to process special format:`, e);
          parsedOptions = [{ label: optionsStr, value: optionsStr }];
        }
      } else {
        // 2. Normal JSON parse
        try {
          // Əgər string dırnaqlar içindədirsə və JSON formatında deyilsə
          if (optionsStr.startsWith('"') && optionsStr.endsWith('"') && 
              !optionsStr.includes('{') && !optionsStr.includes('[')) {
            // Dırnaqları silir və sadə bir option yaradırıq
            const cleanStr = optionsStr.substring(1, optionsStr.length - 1);
            parsedOptions = [{ label: cleanStr, value: cleanStr }];
          } else {
            // Standard JSON parse
            console.log("Attempting standard JSON parse");
            parsedOptions = JSON.parse(optionsStr);
            console.log("Standard JSON parse result:", parsedOptions);
          }
        } catch (parseError) {
          console.warn(`Options JSON kimi parse edilə bilmədi:`, parseError);
          
          // Əgər JSON kimi parse edilə bilmirsə, string-i birbaşa istifadə edirik
          // Əvvəlcə dırnaqları təmizləyirik
          if (optionsStr.startsWith('"') && optionsStr.endsWith('"')) {
            optionsStr = optionsStr.substring(1, optionsStr.length - 1);
          }
          
          parsedOptions = [{ label: optionsStr, value: optionsStr }];
        }
      }
      
      console.log("Final parsed options:", parsedOptions);
      
      // Əgər array-dirsə
      if (Array.isArray(parsedOptions)) {
        // Hər bir element üçün addOption çağırırıq
        parsedOptions.forEach(opt => {
          if (typeof opt === 'string') {
            // String formatında olan options
            const option = { label: opt, value: opt };
            const newOptions = [...options, option];
            control.setValue('options', newOptions);
          } else if (typeof opt === 'object' && opt !== null) {
            // Obyekt formatında olan options
            if ('label' in opt && 'value' in opt) {
              const option = { 
                label: String(opt.label), 
                value: String(opt.value) 
              };
              const newOptions = [...options, option];
              control.setValue('options', newOptions);
            }
          }
        });
        
        setNewOption('');
        toast.success(`${parsedOptions.length} seçim uğurla əlavə edildi`);
      } else {
        toast.error('Düzgün JSON formatı deyil');
      }
    } catch (e) {
      console.error('JSON import error:', e);
      toast.error('JSON formatını oxumaq mümkün olmadı');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-1.5">
        <h3 className="text-sm font-medium">{t("optionsField")}</h3>
        <p className="text-xs text-muted-foreground">{t("optionsFieldDescription")}</p>
      </div>
      
      {/* Yeni seçim əlavə etmə */}
      <div className="flex flex-col space-y-2">
        <div className="flex space-x-2">
          <Input
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("addOptionPlaceholder")}
            className="flex-1"
          />
          <Button 
            type="button" 
            onClick={addOption} 
            size="sm"
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-1" />
            {t("add")}
          </Button>
        </div>
        
        {/* JSON import etmə düyməsi */}
        <Button 
          type="button" 
          onClick={handleImportJSON} 
          size="sm"
          variant="secondary"
          className="w-full"
        >
          JSON formatından import et
        </Button>
      </div>
      
      {/* Mövcud seçimlərin siyahısı */}
      <div className="border rounded-md p-2 min-h-[100px] max-h-[300px] overflow-y-auto">
        {options.length === 0 ? (
          <div className="flex items-center justify-center h-[100px] text-muted-foreground text-sm">
            {t("noOptionsAdded")}
          </div>
        ) : (
          <div className="space-y-2">
            {options.map((option, index) => (
              <Card key={`${option.value}-${index}`} className="p-0 shadow-sm">
                <CardContent className="p-3">
                  {editingOption === option ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          placeholder="Label"
                          className="text-sm"
                        />
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          placeholder="Value"
                          className="text-sm"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button 
                          type="button" 
                          onClick={handleCancelEdit} 
                          size="sm"
                          variant="ghost"
                        >
                          Ləğv et
                        </Button>
                        <Button 
                          type="button" 
                          onClick={handleSaveEdit} 
                          size="sm"
                          variant="default"
                        >
                          <Save className="h-3 w-3 mr-1" />
                          Yadda saxla
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-muted-foreground">
                          Value: {option.value}
                        </span>
                      </div>
                      <div className="flex space-x-1">
                        <Button 
                          type="button" 
                          onClick={() => handleEdit(option)} 
                          size="sm"
                          variant="ghost"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          type="button" 
                          onClick={() => removeOption(option)} 
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OptionsField;
