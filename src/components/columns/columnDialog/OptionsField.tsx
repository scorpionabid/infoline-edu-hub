
import React from 'react';
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
import { X, Plus } from "lucide-react";
import { ColumnOption } from '@/types/column';

interface OptionsFieldProps {
  control: Control<any>;
  options?: ColumnOption[];
  newOption?: string;
  setNewOption?: (value: string) => void;
  addOption?: () => void;
  removeOption?: (option: ColumnOption) => void;
}

const OptionsField: React.FC<OptionsFieldProps> = ({
  control,
  options = [],
  newOption = '',
  setNewOption = () => {},
  addOption = () => {},
  removeOption = () => {}
}) => {
  const { t } = useLanguage();
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addOption();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-1.5">
        <h3 className="text-sm font-medium">{t("optionsField")}</h3>
        <p className="text-xs text-muted-foreground">{t("optionsFieldDescription")}</p>
      </div>
      
      <div className="flex space-x-2">
        <Input
          placeholder={t("addOptionPlaceholder")}
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button type="button" onClick={addOption}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={index} className="flex items-center space-x-2 bg-secondary/50 p-2 rounded-md">
            <div className="flex-1 font-medium text-sm">{option.label}</div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeOption(option)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        
        {options.length === 0 && (
          <div className="text-sm text-muted-foreground italic">
            {t("noOptionsAdded")}
          </div>
        )}
      </div>
    </div>
  );
};

export default OptionsField;
