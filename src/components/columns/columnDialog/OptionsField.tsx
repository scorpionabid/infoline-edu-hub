
import React from 'react';
import { X, Plus } from 'lucide-react';
import { Control } from 'react-hook-form';
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { ColumnOption } from "@/types/column";

interface OptionsFieldProps {
  control: Control<any>;
  options?: ColumnOption[];
  newOption?: string;
  setNewOption?: (value: string) => void;
  addOption?: () => void;
  removeOption?: (value: string) => void;
}

const OptionsField: React.FC<OptionsFieldProps> = ({
  control,
  options = [],
  newOption = "",
  setNewOption = () => {},
  addOption = () => {},
  removeOption = () => {}
}) => {
  const { t } = useLanguage();
  
  const handleAddOption = (e: React.FormEvent) => {
    e.preventDefault();
    addOption();
  };

  return (
    <FormField
      control={control}
      name="options"
      render={() => (
        <FormItem className="space-y-3">
          <FormLabel>{t("options")}</FormLabel>
          
          <div className="flex flex-wrap gap-2">
            {options.map((option) => (
              <Badge key={option.value} variant="secondary" className="py-2 px-3">
                {option.label}
                <button
                  type="button"
                  onClick={() => removeOption(option.value)}
                  className="ml-2 h-4 w-4 rounded-full text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">{t("remove")}</span>
                </button>
              </Badge>
            ))}
          </div>
          
          <div className="flex gap-2 items-center">
            <Input
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              placeholder={t("addOption")}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addOption();
                }
              }}
            />
            <Button
              type="button"
              size="sm"
              onClick={handleAddOption}
              variant="outline"
              className="shrink-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("add")}
            </Button>
          </div>
        </FormItem>
      )}
    />
  );
};

export default OptionsField;
