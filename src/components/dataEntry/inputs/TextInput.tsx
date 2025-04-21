import React from 'react';
import { Input } from '@/components/ui/input';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { Column } from '@/types/column';

interface TextInputProps {
  column: Column;
  form: UseFormReturn<any>;
  disabled?: boolean;
}

const TextInput: React.FC<TextInputProps> = ({ column, form, disabled = false }) => {
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
              placeholder={column.placeholder}
              disabled={disabled}
              aria-label={column.name}
              id={`field-${column.id}`}
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

export default TextInput;
