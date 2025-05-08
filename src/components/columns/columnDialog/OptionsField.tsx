
import React, { useState } from 'react';
import { Control } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ColumnOption } from '@/types/column';
import { useLanguage } from '@/context/LanguageContext';

interface OptionsFieldProps {
  control: Control<any>;
  options: ColumnOption[];
  newOption: ColumnOption;
  setNewOption: React.Dispatch<React.SetStateAction<ColumnOption>>;
  addOption: () => void;
  removeOption: (index: number) => void;
  updateOption: (oldOption: ColumnOption, newOption: ColumnOption) => boolean;
}

export default function OptionsField({
  control,
  options,
  newOption,
  setNewOption,
  addOption,
  removeOption,
  updateOption
}: OptionsFieldProps) {
  const { t } = useLanguage();
  const [editingOptionIndex, setEditingOptionIndex] = useState<number | null>(null);
  const [editOption, setEditOption] = useState<ColumnOption>({ id: '', value: '', label: '' });
  
  // Bir option-u düzənləmə rejimini aktivləşdirir
  const startEditing = (option: ColumnOption, index: number) => {
    setEditingOptionIndex(index);
    setEditOption({ ...option });
  };
  
  // Düzənləməni tamamlayır
  const finishEditing = () => {
    if (editingOptionIndex !== null) {
      // Əgər həm value, həm də label dəyərlidirsə, option-u yeniləyirik
      if (editOption.value && editOption.label) {
        updateOption(options[editingOptionIndex], editOption);
      }
      setEditingOptionIndex(null);
      setEditOption({ id: '', value: '', label: '' });
    }
  };
  
  // Enter düyməsi basıldıqda düzənləməni tamamla
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (editingOptionIndex !== null) {
        finishEditing();
      } else {
        addOption();
      }
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <fieldset className="border rounded-md p-4 space-y-4">
          <legend className="px-2 text-sm font-medium">{t("options")}</legend>
          
          {/* Mövcud seçimlərin siyahısı */}
          {options.length > 0 ? (
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={option.id || index} className="flex items-center gap-2">
                  {editingOptionIndex === index ? (
                    <>
                      <div className="grid grid-cols-2 gap-2 flex-1">
                        <Input
                          value={editOption.value}
                          onChange={(e) => setEditOption(prev => ({ ...prev, value: e.target.value }))}
                          placeholder={t("value")}
                          autoFocus
                          onKeyDown={handleKeyDown}
                          onBlur={finishEditing}
                        />
                        <Input
                          value={editOption.label}
                          onChange={(e) => setEditOption(prev => ({ ...prev, label: e.target.value }))}
                          placeholder={t("label")}
                          onKeyDown={handleKeyDown}
                          onBlur={finishEditing}
                        />
                      </div>
                      <Button type="button" size="sm" variant="ghost" onClick={finishEditing}>
                        {t("save")}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Badge 
                        variant="outline" 
                        className="flex-1 justify-between overflow-hidden cursor-pointer hover:bg-secondary"
                        onClick={() => startEditing(option, index)}
                        style={{ backgroundColor: option.color }}
                      >
                        <span className="truncate">{option.label || option.value}</span>
                        {option.value !== option.label && (
                          <span className="text-xs text-muted-foreground ml-2 truncate">
                            ({option.value})
                          </span>
                        )}
                      </Badge>
                      <Button 
                        type="button" 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => removeOption(index)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-4 text-sm text-muted-foreground bg-muted rounded-md">
              {t("noOptionsAdded")}
            </div>
          )}
          
          {/* Yeni seçim əlavə etmək üçün forma */}
          <div className="grid grid-cols-2 gap-2 items-end">
            <div>
              <Label htmlFor="option-value">{t("value")}</Label>
              <Input
                id="option-value"
                value={newOption.value}
                onChange={(e) => setNewOption(prev => ({ ...prev, value: e.target.value }))}
                placeholder={t("enterValue")}
                onKeyDown={handleKeyDown}
              />
            </div>
            <div>
              <Label htmlFor="option-label">{t("label")}</Label>
              <Input
                id="option-label"
                value={newOption.label}
                onChange={(e) => setNewOption(prev => ({ ...prev, label: e.target.value }))}
                placeholder={t("enterLabel")}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addOption}
            disabled={!newOption.value || !newOption.label}
            className="w-full"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            {t("addOption")}
          </Button>
        </fieldset>
      </div>
    </div>
  );
}
