
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Control, FieldValues, Path } from 'react-hook-form';
import { ColumnOption } from '@/types/column';

interface SelectInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  options: ColumnOption[];
  placeholder?: string;
  helpText?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  onChange?: (value: string) => void;
}

export function SelectInput<T extends FieldValues>({
  name,
  control,
  label,
  options,
  placeholder = 'Seçin',
  helpText,
  disabled = false,
  className = '',
  required = false,
  onChange
}: SelectInputProps<T>) {
  const getOptionLabel = (value: string) => {
    if (!value) return '';
    
    // Çoxlu seçim üçün (comma-separated values)
    if (value.includes(',')) {
      const valueArray = value.split(',');
      return valueArray.map(val => {
        const option = options.find(opt => opt.value === val);
        return option ? option.label : val;
      }).join(', ');
    }
    
    // Tək seçim üçün
    const option = options.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  const processedOptions = options.map(option => ({
    id: option.id,
    label: option.label,
    value: option.value,
    color: option.color,
    disabled: option.disabled
  }));

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
          )}
          <Select
            disabled={disabled}
            onValueChange={value => {
              field.onChange(value);
              if (onChange) onChange(value);
            }}
            value={field.value}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder}>
                  {field.value ? getOptionLabel(field.value) : placeholder}
                </SelectValue>
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {processedOptions.map((option) => (
                <SelectItem
                  key={option.id}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {helpText && <p className="text-gray-500 text-sm mt-1">{helpText}</p>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
