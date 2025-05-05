
import React from 'react';
import { Input } from '@/components/ui/input';
import { FormDescription, FormLabel, FormMessage } from '@/components/ui/form';
import { Column } from '@/types/column';

interface NumberInputProps<T extends Record<string, any>> {
  column: Column;
  value: string | number | null;
  onChange: (value: number | null) => void;
  error?: string;
  disabled?: boolean;
}

export const NumberInput = <T extends Record<string, any>>({
  column,
  value,
  onChange,
  error,
  disabled = false
}: NumberInputProps<T>) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim() === '' ? null : Number(e.target.value);
    onChange(val);
  };

  const min = column.validation?.min;
  const max = column.validation?.max;

  return (
    <div className="space-y-2">
      {column.name && <FormLabel>{column.name}</FormLabel>}
      
      <Input
        type="number"
        value={value === null ? '' : value}
        onChange={handleChange}
        placeholder={column.placeholder}
        min={min}
        max={max}
        disabled={disabled}
        className={error ? "border-red-500" : ""}
      />
      
      {column.help_text && (
        <FormDescription>{column.help_text}</FormDescription>
      )}
      
      {error && <FormMessage>{error}</FormMessage>}
    </div>
  );
};

export default NumberInput;
