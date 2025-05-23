import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ColumnOption } from '@/types/column';

interface RadioAdapterProps {
  value: any;
  onChange: (...event: any[]) => void;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  options?: ColumnOption[];
}

const RadioAdapter: React.FC<RadioAdapterProps> = ({ 
  value, 
  onChange, 
  disabled = false,
  readOnly = false,
  required = false,
  options = []
}) => {
  // Safe options
  const safeOptions = Array.isArray(options) ? options : [];
  
  return (
    <RadioGroup 
      value={value || ''} 
      onValueChange={onChange}
      disabled={disabled || readOnly}
      required={required}
      className={readOnly ? 'opacity-70 cursor-not-allowed' : ''}
    >
      {safeOptions.map((option) => (
        <div key={option.value} className="flex items-center space-x-2">
          <RadioGroupItem 
            value={option.value}
            disabled={option.disabled || disabled || readOnly}
            required={required}
          />
          <Label>{option.label}</Label>
        </div>
      ))}
    </RadioGroup>
  );
};

export default RadioAdapter;
