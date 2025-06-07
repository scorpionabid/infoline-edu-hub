
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
    // Convert NONE back to empty string for the form
    onChange(newValue === 'NONE' ? '' : newValue);
  };

  // Ensure value is never empty string for Select component
  const safeValue = value || 'NONE';

  return (
    <div className="space-y-2">
      {column.name && <FormLabel>{column.name}</FormLabel>}
      
      <Select
        value={safeValue}
        onValueChange={handleChange}
        disabled={disabled}
      >
        <SelectTrigger className={error ? "border-red-500" : ""}>
          <SelectValue placeholder={column.placeholder || 'Seçin'} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="NONE">{column.placeholder || 'Seçin'}</SelectItem>
          {options.map((option, index) => {
            // Always generate a valid value, never empty string
            const optionValue = option.value && option.value.trim() 
              ? option.value 
              : `option-${index}-${option.label || Math.random().toString(36).substring(7)}`;
            
            return (
              <SelectItem key={optionValue} value={optionValue}>
                {option.label}
              </SelectItem>
            );
          })}
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
