
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Control, FieldValues, Path } from 'react-hook-form';

interface TextAreaInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  helpText?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  onChange?: (value: string) => void;
}

export default function TextAreaInput<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  helpText,
  disabled = false,
  className = '',
  required = false,
  onChange
}: TextAreaInputProps<T>) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e.target.value);
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
            <Textarea
              {...field}
              onChange={(e) => {
                field.onChange(e);
                handleChange(e);
              }}
              placeholder={placeholder}
              disabled={disabled}
            />
          </FormControl>
          {helpText && <p className="text-gray-500 text-sm mt-1">{helpText}</p>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
