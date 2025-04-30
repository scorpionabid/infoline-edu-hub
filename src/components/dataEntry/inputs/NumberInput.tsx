
import React from 'react';
import { Input } from '@/components/ui/input';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { Column, ColumnValidation } from '@/types/column';

interface NumberInputProps {
  column: Column;
  form: UseFormReturn<any>;
  disabled?: boolean;
}

const NumberInput: React.FC<NumberInputProps> = ({ column, form, disabled = false }) => {
  // Minimum və maksimum dəyərlərini əldə et
  const validation = column.validation as ColumnValidation;
  const min = validation?.minValue;
  const max = validation?.maxValue;

  return (
    <FormField
      control={form.control}
      name={`fields.${column.id}`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{column.name}</FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder={column.placeholder || '0'}
              disabled={disabled}
              min={min}
              max={max}
              {...field}
              onChange={(e) => {
                if (e.target.value === '') {
                  field.onChange('');
                } else {
                  field.onChange(e.target.value);
                }
              }}
            />
          </FormControl>
          {column.help_text && <FormDescription>{column.help_text}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default NumberInput;
