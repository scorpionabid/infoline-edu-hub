
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Control, FieldValues, Path } from 'react-hook-form';

interface CheckboxInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  helpText?: string;
  disabled?: boolean;
  className?: string;
  onChange?: (checked: boolean) => void;
}

export default function CheckboxInput<T extends FieldValues>({
  name,
  control,
  label,
  helpText,
  disabled = false,
  className = '',
  onChange
}: CheckboxInputProps<T>) {
  const handleChange = (checked: boolean) => {
    if (onChange) {
      onChange(checked);
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={`flex flex-row items-start space-x-3 space-y-0 rounded-md ${className}`}>
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={(checked) => {
                field.onChange(checked);
                handleChange(!!checked);
              }}
              disabled={disabled}
            />
          </FormControl>
          {label && <FormLabel className="font-normal text-sm">{label}</FormLabel>}
          <FormMessage />
          {helpText && <p className="text-gray-500 text-xs mt-1">{helpText}</p>}
        </FormItem>
      )}
    />
  );
}
