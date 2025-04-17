
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { Column, ColumnOption } from '@/types/column';

interface SelectInputProps {
  column: Column;
  form: UseFormReturn<any>;
  disabled?: boolean;
}

const SelectInput: React.FC<SelectInputProps> = ({ column, form, disabled = false }) => {
  // Sütun seçənəklərini dönüşdür
  const options = React.useMemo(() => {
    if (!column.options) return [];
    
    if (Array.isArray(column.options)) {
      return column.options.map((option: any) => {
        if (typeof option === 'string') {
          return { label: option, value: option };
        }
        return {
          label: option.label || String(option),
          value: option.value || String(option)
        };
      });
    }
    
    return [];
  }, [column.options]);

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
          <Select
            disabled={disabled}
            onValueChange={field.onChange}
            value={String(field.value || '')}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={column.placeholder || 'Seçim edin'} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option: ColumnOption, index) => (
                <SelectItem key={index} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {column.help_text && (
            <FormDescription>{column.help_text}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default SelectInput;
