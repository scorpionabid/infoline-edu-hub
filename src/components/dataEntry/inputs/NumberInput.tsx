
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Column } from '@/types/column';

interface NumberInputProps {
  column: Column;
  disabled?: boolean;
}

export const NumberInput: React.FC<NumberInputProps> = ({ column, disabled }) => {
  const form = useFormContext();

  const minValue = column.validation?.minValue;
  const maxValue = column.validation?.maxValue;
  const step = column.validation?.step || 1;

  return (
    <FormField
      control={form.control}
      name={`entries.${column.id}`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {column.name}
            {column.is_required && <span className="text-red-500 ml-1">*</span>}
          </FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder={column.placeholder}
              disabled={disabled}
              min={minValue}
              max={maxValue}
              step={step}
              {...field}
              onChange={(e) => field.onChange(e.target.value)}
            />
          </FormControl>
          {column.help_text && (
            <p className="text-sm text-gray-500">{column.help_text}</p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
