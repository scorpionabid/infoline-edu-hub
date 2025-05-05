
import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Column, ColumnOption } from '@/types/column';

interface SelectInputProps {
  column: Column;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const SelectInput: React.FC<SelectInputProps> = ({
  column,
  value,
  onChange,
  error
}) => {
  const [options, setOptions] = useState<ColumnOption[]>([]);

  useEffect(() => {
    // Seçimləri parse edirik
    if (column.options) {
      if (typeof column.options === 'string') {
        try {
          const parsedOptions = JSON.parse(column.options);
          setOptions(Array.isArray(parsedOptions) ? parsedOptions : []);
        } catch (error) {
          console.error('Options parse xətası:', error);
          setOptions([]);
        }
      } else if (Array.isArray(column.options)) {
        setOptions(column.options);
      }
    } else {
      setOptions([]);
    }
  }, [column.options]);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={error ? 'border-red-500' : ''}>
        <SelectValue placeholder={column.placeholder || 'Seçim edin'} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
