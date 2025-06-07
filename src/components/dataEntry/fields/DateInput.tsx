
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DateInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}

const DateInput: React.FC<DateInputProps> = ({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  error
}) => {
  return (
    <div className="space-y-2">
      <Label className={required ? 'after:content-["*"] after:text-red-500' : ''}>
        {label}
      </Label>
      <Input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={error ? 'border-red-500' : ''}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default DateInput;
