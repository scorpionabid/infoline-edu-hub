
import React from 'react';
import { Input } from '@/components/ui/input';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Control, FieldValues, Path } from 'react-hook-form';
import { ColumnValidation } from '@/types/column';

interface NumberInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  helpText?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  validation?: ColumnValidation;
  onChange?: (value: string) => void;
}

export function NumberInput<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  helpText,
  disabled = false,
  className = '',
  required = false,
  validation,
  onChange
}: NumberInputProps<T>) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Sadəcə rəqəmlər və nöqtəyə icazə ver
    if (value === '' || /^-?\d*\.?\d*$/.test(value)) {
      if (onChange) {
        onChange(value);
      }
    }
  };

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
          <FormControl>
            <Input
              type="text"
              inputMode="decimal"
              {...field}
              onChange={(e) => {
                handleInputChange(e);
                field.onChange(e);
              }}
              placeholder={placeholder}
              disabled={disabled}
              min={validation?.minValue}
              max={validation?.maxValue}
            />
          </FormControl>
          {helpText && <p className="text-gray-500 text-sm mt-1">{helpText}</p>}
          {validation?.minValue !== undefined && validation?.maxValue !== undefined && (
            <p className="text-gray-500 text-xs mt-1">
              {`${validation.minValue} - ${validation.maxValue} arasında dəyər daxil edin`}
            </p>
          )}
          {validation?.minValue !== undefined && validation?.maxValue === undefined && (
            <p className="text-gray-500 text-xs mt-1">
              {`Minimum dəyər: ${validation.minValue}`}
            </p>
          )}
          {validation?.minValue === undefined && validation?.maxValue !== undefined && (
            <p className="text-gray-500 text-xs mt-1">
              {`Maksimum dəyər: ${validation.maxValue}`}
            </p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
