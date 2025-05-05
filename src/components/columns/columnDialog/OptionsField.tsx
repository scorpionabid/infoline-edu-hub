
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Move, Edit } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Control, Controller } from 'react-hook-form';
import { ColumnOption } from '@/types/column';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface OptionsFieldProps {
  control: Control<any>;
  options: ColumnOption[];
  newOption: { label: string; value: string; color: string; };
  setNewOption: React.Dispatch<React.SetStateAction<{ label: string; value: string; color: string; }>>;
  addOption: () => void;
  removeOption: (index: number) => void;
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

  const handleNewOptionChange = (name: string, value: string) => {
    setNewOption(prev => ({ 
      ...prev, 
      [name]: value,
      value: name === 'label' ? value.toLowerCase().replace(/\s+/g, '_') : prev.value 
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newOption.label.trim()) {
      e.preventDefault();
      addOption();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("options")}</CardTitle>
        <CardDescription>{t("optionsDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-5">
              <Label htmlFor="newOptionLabel">{t("label")}</Label>
              <Input
                id="newOptionLabel"
                value={newOption.label}
                onChange={(e) => handleNewOptionChange('label', e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t("optionLabelPlaceholder")}
              />
            </div>
            <div className="col-span-5">
              <Label htmlFor="newOptionValue">{t("value")}</Label>
              <Input
                id="newOptionValue"
                value={newOption.value}
                onChange={(e) => handleNewOptionChange('value', e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t("optionValuePlaceholder")}
              />
            </div>
            <div className="col-span-1">
              <Label htmlFor="newOptionColor">{t("color")}</Label>
              <Input
                id="newOptionColor"
                type="color"
                value={newOption.color}
                onChange={(e) => handleNewOptionChange('color', e.target.value)}
                className="h-10 p-1"
              />
            </div>
            <div className="col-span-1 flex items-end">
              <Button
                type="button"
                size="icon"
                onClick={addOption}
                disabled={!newOption.label.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {options.length > 0 && (
            <div className="border rounded-md p-2">
              <div className="grid grid-cols-12 gap-2 py-2 px-2 font-medium text-sm">
                <div className="col-span-5">{t("label")}</div>
                <div className="col-span-5">{t("value")}</div>
                <div className="col-span-1">{t("color")}</div>
                <div className="col-span-1"></div>
              </div>
              <div className="space-y-1">
                {options.map((option, index) => (
                  <div key={option.id || index} className="grid grid-cols-12 gap-2 items-center py-2 px-2 rounded-md hover:bg-accent">
                    <div className="col-span-5">
                      <Input 
                        value={option.label} 
                        onChange={(e) => {
                          const newOpt = { ...option, label: e.target.value };
                          updateOption(option, newOpt);
                        }}
                      />
                    </div>
                    <div className="col-span-5">
                      <Input 
                        value={option.value} 
                        onChange={(e) => {
                          const newOpt = { ...option, value: e.target.value };
                          updateOption(option, newOpt);
                        }}
                      />
                    </div>
                    <div className="col-span-1">
                      <Input 
                        type="color" 
                        value={option.color || '#000000'} 
                        className="h-10 p-1"
                        onChange={(e) => {
                          const newOpt = { ...option, color: e.target.value };
                          updateOption(option, newOpt);
                        }}
                      />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => removeOption(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {options.length === 0 && (
            <div className="text-center p-4 border border-dashed rounded-md text-muted-foreground">
              {t("noOptionsAdded")}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OptionsField;
