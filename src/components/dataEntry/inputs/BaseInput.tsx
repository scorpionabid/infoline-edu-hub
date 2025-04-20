
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useFormContext } from 'react-hook-form';
import { Column } from '@/types/column';

interface BaseInputProps {
  column: Column;
  renderInput: (value: string, onChange: (value: string) => void) => React.ReactNode;
  disabled?: boolean;
}

export const BaseInput: React.FC<BaseInputProps> = ({
  column,
  renderInput,
  disabled = false
}) => {
  const form = useFormContext();

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
            {renderInput(field.value, field.onChange)}
          </FormControl>
          {column.help_text && (
            <p className="text-sm text-muted-foreground">{column.help_text}</p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
