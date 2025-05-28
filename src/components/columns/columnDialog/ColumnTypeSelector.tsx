
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Control } from 'react-hook-form';
import { ColumnType, columnTypeDefinitions } from '@/types/column';
import { useLanguage } from '@/context/LanguageContext';

export interface ColumnTypeSelectorProps {
  control: Control<any>;
  selectedType?: ColumnType;
  onTypeChange: (type: ColumnType) => void;
}

const ColumnTypeSelector: React.FC<ColumnTypeSelectorProps> = ({
  control,
  selectedType,
  onTypeChange
}) => {
  const { t } = useLanguage();

  return (
    <FormField
      control={control}
      name="type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t('columnType')}</FormLabel>
          <Select 
            onValueChange={(value) => {
              field.onChange(value);
              onTypeChange(value as ColumnType);
            }} 
            defaultValue={field.value}
            value={selectedType || field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={t('selectColumnType')} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {columnTypeDefinitions.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center space-x-2">
                    <span>{type.icon}</span>
                    <span>{type.label}</span>
                    <Badge variant="outline" className="text-xs">
                      {type.value}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ColumnTypeSelector;
