
import React from 'react';
import { Input } from '@/components/ui/input';
import { BaseInput } from './BaseInput';
import { Column } from '@/types/column';

interface NumberInputProps {
  column: Column;
  disabled?: boolean;
}

export const NumberInput: React.FC<NumberInputProps> = ({ column, disabled }) => {
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
          min={column.validation?.minValue}
          max={column.validation?.maxValue}
          step={column.validation?.step || 1}
        />
      )}
    />
  );
};
