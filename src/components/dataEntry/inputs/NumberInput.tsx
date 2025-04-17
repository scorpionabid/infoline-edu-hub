
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
  // Validation üçün min/max dəyərlərini al
  const validation = column.validation as ColumnValidation || {};
  const minValue = validation?.minValue;
  const maxValue = validation?.maxValue;

  return (
    <FormField
      control={form.control}
      name={`fields.${column.id}`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {column.name}
            {column.is_required && <span className="text-destructive ml-1">*</span>}
          </FormLabel>
          <FormControl>
            <Input
              {...field}
              type="number"
              placeholder={column.placeholder}
              disabled={disabled}
              min={minValue}
              max={maxValue}
              onChange={(e) => {
                // Parse string value to number
                const value = e.target.value ? parseFloat(e.target.value) : '';
                field.onChange(value);
              }}
            />
          </FormControl>
          {column.help_text && (
            <FormDescription>{column.help_text}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default NumberInput;
