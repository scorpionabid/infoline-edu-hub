
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Column } from '@/types/column';
import BaseField from './BaseField';
import { cn } from '@/lib/utils';

interface TextAreaFieldProps {
  column: Column;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isDisabled?: boolean;
  error?: string;
  className?: string;
}

/**
 * TextAreaField - A textarea form field component
 * 
 * Renders a textarea with common field layout and error handling.
 * Uses BaseField for consistent field structure.
 */
const TextAreaField: React.FC<TextAreaFieldProps> = ({ 
  column, 
  value, 
  onChange, 
  isDisabled = false,
  error,
  className
}) => {
  return (
    <BaseField
      id={column.id}
      name={column.name}
      label={column.name}
      required={column.is_required}
      disabled={isDisabled}
      description={column.description || column.help_text}
      error={error}
      className={className}
      renderField={() => (
        <Textarea 
          id={column.id} 
          name={column.id}
          placeholder={column.placeholder} 
          value={value || ''} 
          onChange={onChange} 
          disabled={isDisabled}
          className={cn(
            error && 'border-destructive',
            'min-h-[120px] resize-y'
          )}
        />
      )}
    />
  );
};

export default TextAreaField;
