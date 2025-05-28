
import React, { useState } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { Control, useFieldArray } from 'react-hook-form';
import { useLanguage } from '@/context/LanguageContext';

export interface OptionsFieldProps {
  control: Control<any>;
  options?: string[];
  newOption?: string;
  setNewOption?: (value: string) => void;
  addOption?: () => void;
  removeOption?: (index: number) => void;
}

const OptionsField: React.FC<OptionsFieldProps> = ({ control }) => {
  const { t } = useLanguage();
  const [newOption, setNewOption] = useState('');
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "options"
  });

  const addOption = () => {
    if (newOption.trim()) {
      append(newOption.trim());
      setNewOption('');
    }
  };

  return (
    <FormField
      control={control}
      name="options"
      render={() => (
        <FormItem>
          <FormLabel>{t('options')}</FormLabel>
          <FormControl>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <Input
                  placeholder={t('addOption')}
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
                />
                <Button type="button" onClick={addOption} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {fields.map((field, index) => (
                  <Badge key={field.id} variant="secondary" className="flex items-center space-x-1">
                    <span>{(field as any).value || field}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1"
                      onClick={() => remove(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default OptionsField;
