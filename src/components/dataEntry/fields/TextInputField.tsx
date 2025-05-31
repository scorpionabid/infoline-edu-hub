import React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import BaseField from './BaseField';
import { ColumnType } from '@/types/column';

export interface TextInputFieldProps {
  // Field identification
  id?: string;
  name?: string;
  label?: string;
  
  // Field data
  type: 'text' | 'email' | 'url' | 'phone';
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  
  // Validation 
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  error?: string;
  
  // Presentation
  disabled?: boolean;
  readOnly?: boolean;
  description?: string;
  className?: string;
}

/**
 * TextInputField - A component for text-based input fields
 * 
 * Handles text, email, url, and phone input types with consistent
 * layout and validation using BaseField.
 */
const TextInputField: React.FC<TextInputFieldProps> = ({
  // Field identification props
  id,
  name,
  label,
  
  // Field data props
  type,
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
          type={type === 'phone' ? 'tel' : type}
          placeholder={placeholder}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || readOnly}
          readOnly={readOnly}
          minLength={validation?.minLength}
          maxLength={validation?.maxLength}
          pattern={validation?.pattern}
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

export default TextInputField;
