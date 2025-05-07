
import React from 'react';
import { FormDescription, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Column, ColumnOption } from '@/types/column';

interface SelectInputProps<T extends Record<string, any>> {
  column: Column;
  value: string | null;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export const SelectInput = <T extends Record<string, any>>({
  column,
  value,
  onChange,
  error,
  disabled = false
}: SelectInputProps<T>) => {
  const options = column.options && Array.isArray(column.options)
    ? column.options as ColumnOption[]
    : [];

  const handleChange = (newValue: string) => {
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      {column.name && <FormLabel>{column.name}</FormLabel>}
      
      <Select
        value={value || ''}
        onValueChange={handleChange}
        disabled={disabled}
      >
        <SelectTrigger className={error ? "border-red-500" : ""}>
          <SelectValue placeholder={column.placeholder || 'Seçin'} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value || `option-${option.label}`}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {column.help_text && (
        <FormDescription>{column.help_text}</FormDescription>
      )}
      
      {error && <FormMessage>{error}</FormMessage>}
    </div>
  );
};

export default SelectInput;
