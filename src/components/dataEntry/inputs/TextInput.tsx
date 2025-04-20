
import React from 'react';
import { Input } from '@/components/ui/input';
import { BaseInput } from './BaseInput';
import { Column } from '@/types/column';

interface TextInputProps {
  column: Column;
  disabled?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({ column, disabled }) => {
  return (
    <BaseInput
      column={column}
      disabled={disabled}
      renderInput={(value, onChange) => (
        <Input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={column.placeholder}
          disabled={disabled}
        />
      )}
    />
  );
};
