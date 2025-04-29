
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Trash2, ChevronsUpDown } from 'lucide-react';
import { Control } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { ColumnOption } from '@/types/column';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface OptionsFieldProps {
  control: Control<any>;
  options: ColumnOption[];
  newOption: { label: string; value: string; color: string };
  setNewOption: (newOption: { label: string; value: string; color: string }) => void;
  addOption: () => void;
  removeOption: (index: number) => void;
  updateOption?: (oldOption: ColumnOption, newOption: ColumnOption) => boolean;
}

const OptionsField: React.FC<OptionsFieldProps> = ({
  control,
  options,
  newOption,
  setNewOption,
  addOption,
  removeOption,
  updateOption
}) => {
  const { t } = useLanguage();
  
  // Yeni seçim əlavə etdikdə çağrılan funksiya
  const handleAddOption = () => {
    if (newOption.label.trim() === '') return;
    
    // Əgər value boşdursa, label ilə eyni et
    if (!newOption.value.trim()) {
      setNewOption({ ...newOption, value: newOption.label });
    }
    
    addOption();
  };
  
  // Seçimi yeniləmək üçün funksiya
  const handleUpdateOption = (oldOption: ColumnOption, newLabel: string, newValue: string, newColor: string) => {
    if (!updateOption) return;
    
    const newOptionData: ColumnOption = {
      id: oldOption.id || uuidv4(),
      label: newLabel || oldOption.label,
      value: newValue || newLabel || oldOption.value,
      color: newColor || oldOption.color
    };
    
    updateOption(oldOption, newOptionData);
  };
  
  return (
    <div className="space-y-4">
      <FormItem>
        <FormLabel>{t('options')}</FormLabel>
        <FormDescription>
          {t('optionsDescription')}
        </FormDescription>
        
        {/* Mövcud seçimlər */}
        <div className="space-y-2 mt-2">
          {options.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('noOptionsAdded')}</p>
          ) : (
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={option.id || index} className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: option.color || '#000000' }}
                  />
                  <Badge variant="outline" className="px-2 py-1 flex-1">
                    {option.label} {option.value !== option.label && `(${option.value})`}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ChevronsUpDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          let newLabel = prompt(t('enterNewLabel'), option.label);
                          if (newLabel !== null) {
                            handleUpdateOption(option, newLabel, option.value, option.color || '#000000');
                          }
                        }}
                      >
                        {t('changeLabel')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          let newValue = prompt(t('enterNewValue'), option.value);
                          if (newValue !== null) {
                            handleUpdateOption(option, option.label, newValue, option.color || '#000000');
                          }
                        }}
                      >
                        {t('changeValue')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          const input = document.createElement("input");
                          input.type = "color";
                          input.value = option.color || "#000000";
                          input.addEventListener("change", (e: any) => {
                            handleUpdateOption(option, option.label, option.value, e.target.value);
                          });
                          input.click();
                        }}
                      >
                        {t('changeColor')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeOption(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Yeni seçim əlavə etmə */}
        <div className="flex items-end gap-2 mt-4">
          <div className="flex-1">
            <FormLabel className="text-xs">{t('optionLabel')}</FormLabel>
            <Input
              value={newOption.label}
              onChange={(e) => setNewOption({ ...newOption, label: e.target.value })}
              placeholder={t('enterOptionLabel')}
              className="mt-1"
            />
          </div>
          <div className="flex-1">
            <FormLabel className="text-xs">{t('optionValue')}</FormLabel>
            <Input
              value={newOption.value}
              onChange={(e) => setNewOption({ ...newOption, value: e.target.value })}
              placeholder={t('enterOptionValue')}
              className="mt-1"
            />
          </div>
          <div>
            <FormLabel className="text-xs">{t('color')}</FormLabel>
            <div className="flex items-center mt-1">
              <Input
                type="color"
                value={newOption.color}
                onChange={(e) => setNewOption({ ...newOption, color: e.target.value })}
                className="w-10 h-10 p-0 cursor-pointer"
              />
            </div>
          </div>
          <Button
            type="button"
            size="icon"
            onClick={handleAddOption}
            disabled={!newOption.label.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <FormMessage />
      </FormItem>
    </div>
  );
};

export default OptionsField;
