
import React from 'react';
import { Input } from '@/components/ui/input';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { Column, ValidationRules } from '@/types/column';

interface NumberInputProps {
  column: Column;
  form: UseFormReturn<any>;
  disabled?: boolean;
}

const NumberInput: React.FC<NumberInputProps> = ({ column, form, disabled = false }) => {
  // Validasiya qaydalarını əldə et
  const validation = column.validation || {};
  
  // Json tipini ValidationRules kimi təhlil et
  const getValidationRule = (): ValidationRules => {
    if (typeof validation === 'string') {
      try {
        return JSON.parse(validation);
      } catch (e) {
        return {};
      }
    } else if (typeof validation === 'object') {
      return validation as ValidationRules;
    }
    return {};
  };
  
  const rules = getValidationRule();
  const minValue = rules.minValue;
  const maxValue = rules.maxValue;

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
