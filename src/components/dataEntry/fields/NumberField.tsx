import React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import BaseField from './BaseField';

export interface NumberFieldProps {
  // Field identification
  id?: string;
  name?: string;
  label?: string;
  
  // Field data
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  
  // Validation 
  validation?: {
    required?: boolean;
    minValue?: number;
    maxValue?: number;
  };
  error?: string;
  
  // Presentation
  disabled?: boolean;
  readOnly?: boolean;
  description?: string;
  className?: string;
}

/**
 * NumberField - A component for numeric input fields
 * 
 * Handles number input with validation using BaseField.
 */
const NumberField: React.FC<NumberFieldProps> = ({
  // Field identification props
  id,
  name,
  label,
  
  // Field data props
  value,
  onChange,
  placeholder,
  
  // Validation props
  validation,
  error,
  
  // Presentation props
  disabled = false,
  readOnly = false,
  description,
  className
}) => {
  // Common props for BaseField component
  const baseFieldProps = {
    id: id || name || '',
    name: name || '',
    label: label || name || '',
    required: validation?.required,
    disabled: disabled || readOnly,
    description,
    error,
    className
  };

  return (
    <BaseField
      {...baseFieldProps}
      renderField={() => (
        <Input
          id={id || name}
          name={name}
          type="number"
          value={value ?? ''}
          onChange={(e) => {
            const val = e.target.value;
            onChange(val ? Number(val) : null);
          }}
          placeholder={placeholder}
          disabled={disabled || readOnly}
          readOnly={readOnly}
          min={validation?.minValue}
          max={validation?.maxValue}
          className={cn(
            'focus:ring-1 focus:ring-primary',
            error && 'border-destructive',
            className
          )}
        />
      )}
    />
  );
};

export default NumberField;
