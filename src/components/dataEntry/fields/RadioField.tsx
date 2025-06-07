
import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface RadioOption {
  value: string;
  label: string;
}

interface RadioFieldProps {
  label: string;
  value: string;
  options: RadioOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  required?: boolean;
}

const RadioField: React.FC<RadioFieldProps> = ({
  label,
  value,
  options,
  onChange,
  disabled = false,
  error,
  required = false
}) => {
  return (
    <div className="space-y-2">
      <Label className={required ? 'after:content-["*"] after:text-red-500' : ''}>
        {label}
      </Label>
      <RadioGroup value={value} onValueChange={onChange} disabled={disabled}>
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <RadioGroupItem value={option.value} id={option.value} />
            <Label htmlFor={option.value}>{option.label}</Label>
          </div>
        ))}
      </RadioGroup>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default RadioField;
