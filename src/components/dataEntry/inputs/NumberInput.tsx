
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Column } from '@/types/column';
import { BaseInput } from './BaseInput';

interface NumberInputProps {
  column: Column;
  disabled?: boolean;
}

export const NumberInput: React.FC<NumberInputProps> = ({ column, disabled }) => {
  const minValue = column.validation?.minValue;
  const maxValue = column.validation?.maxValue;
  const step = column.validation?.step || 1;

  return (
    <BaseInput
      column={column}
      disabled={disabled}
      renderInput={(value, onChange) => (
        <Input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={column.placeholder}
          disabled={disabled}
          min={minValue}
          max={maxValue}
          step={step}
        />
      )}
    />
  );
};
