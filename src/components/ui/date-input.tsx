
import React from 'react';
import { Input } from '@/components/ui/input';

interface DateInputProps {
  value: string | null;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const DateInput: React.FC<DateInputProps> = ({
  value,
  onChange,
  min,
  max,
  required,
  placeholder = "YYYY-MM-DD",
  className = "",
  disabled = false
}) => {
  return (
    <Input
      type="date"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      min={min}
      max={max}
      required={required}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
    />
  );
};

export default DateInput;
