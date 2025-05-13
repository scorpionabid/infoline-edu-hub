
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Control } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash, Edit, Check, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { ColumnOption } from '@/types/column';

interface OptionsFieldProps {
  control: Control<any>;
  options: ColumnOption[];
  newOption: ColumnOption;
  setNewOption: React.Dispatch<React.SetStateAction<ColumnOption>>;
  addOption: () => void;
  removeOption: (id: string) => void;
  updateOption: (oldOption: ColumnOption, newOption: ColumnOption) => boolean;
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
  const [editingIndex, setEditingIndex] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState('');

  const handleAddOption = () => {
    if (newOption.label.trim()) {
      addOption();
    }
  };

  const startEditing = (option: ColumnOption) => {
    setEditingIndex(option.id);
    setEditValue(option.label);
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setEditValue('');
  };

  const saveEditing = (option: ColumnOption) => {
    if (editValue.trim() && editValue !== option.label) {
      const updatedOption: ColumnOption = {
        ...option,
        label: editValue,
        value: editValue.toLowerCase().replace(/\s+/g, '_')
      };
      
      updateOption(option, updatedOption);
    }
    cancelEditing();
  };

  const handleNewOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewOption({
      ...newOption,
      label: e.target.value,
      value: e.target.value.toLowerCase().replace(/\s+/g, '_')
    });
  };

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="options"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel>{t("optionsLabel")}</FormLabel>
            <div className="flex space-x-2 mb-2">
              <FormControl>
                <Input
                  value={newOption.label}
                  onChange={handleNewOptionChange}
                  placeholder={t("enterNewOption")}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddOption();
                    }
                  }}
                />
              </FormControl>
              <Button
                type="button"
                size="sm"
                onClick={handleAddOption}
                disabled={!newOption.label.trim()}
              >
                <Plus className="h-4 w-4 mr-1" />
                {t("add")}
              </Button>
            </div>
            <div className="border rounded-md p-2">
              {options.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t("noOptionsAdded")}
                </p>
              ) : (
                <ul className="space-y-2">
                  {options.map((option) => (
                    <li
                      key={option.id}
                      className="bg-muted p-2 rounded-md flex justify-between items-center"
                    >
                      {editingIndex === option.id ? (
                        <div className="flex-1 flex items-center space-x-2">
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="flex-1"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                saveEditing(option);
                              } else if (e.key === 'Escape') {
                                cancelEditing();
                              }
                            }}
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => saveEditing(option)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={cancelEditing}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center">
                          <span className="text-sm font-medium">{option.label}</span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({option.value})
                          </span>
                        </div>
                      )}

                      {editingIndex !== option.id && (
                        <div className="flex items-center">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => startEditing(option)}
                          >
                            <span className="sr-only">{t("edit")}</span>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive/80"
                            onClick={() => removeOption(option.id)}
                          >
                            <span className="sr-only">{t("remove")}</span>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default OptionsField;
