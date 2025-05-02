
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { ColumnOption } from '@/types/column';
import { useLanguage } from '@/context/LanguageContext';
import { Control } from 'react-hook-form';

interface OptionsFieldProps {
  control: Control<any>;
  options: ColumnOption[];
  newOption: { label: string; value: string; color: string };
  setNewOption: React.Dispatch<React.SetStateAction<{ label: string; value: string; color: string }>>;
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

  const handleAddKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addOption();
    }
  };

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="options"
        render={() => (
          <FormItem>
            <FormLabel>{t("optionsLabel")}</FormLabel>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {options.map((option, index) => (
                  <div 
                    key={option.id || index}
                    className="flex items-center gap-1 bg-accent text-accent-foreground px-2 py-1 rounded-md"
                  >
                    <span className="text-sm">{option.label}</span>
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="text-muted-foreground hover:text-destructive focus:outline-none"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              
              {/* Yeni seçim əlavə etmək üçün */}
              <div className="flex gap-2">
                <FormControl>
                  <Input
                    placeholder={t("optionLabelPlaceholder")}
                    value={newOption.label}
                    onChange={(e) => setNewOption({ ...newOption, label: e.target.value })}
                    onKeyDown={handleAddKeyPress}
                    className="flex-1"
                  />
                </FormControl>
                
                <FormControl>
                  <Input
                    placeholder={t("optionValuePlaceholder")}
                    value={newOption.value}
                    onChange={(e) => setNewOption({ ...newOption, value: e.target.value })}
                    onKeyDown={handleAddKeyPress}
                    className="flex-1"
                  />
                </FormControl>
                
                <Input
                  type="color"
                  value={newOption.color}
                  onChange={(e) => setNewOption({ ...newOption, color: e.target.value })}
                  className="w-14"
                />
                
                <Button 
                  type="button" 
                  onClick={addOption} 
                  variant="secondary"
                  size="icon"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="text-sm text-muted-foreground">
        {t("optionsHelpText")}
      </div>
    </div>
  );
};

export default OptionsField;
