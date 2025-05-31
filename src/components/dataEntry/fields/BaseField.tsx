import React from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export type BaseFieldProps = {
  id: string;
  name: string;
  label: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  description?: string;
  error?: string;
  className?: string;
  labelClassName?: string;
  containerClassName?: string;
  children?: React.ReactNode;
  renderField: () => React.ReactNode;
};

/**
 * BaseField - A base component for all form fields
 * 
 * This component provides consistent layout, labeling and error handling
 * for all form field types. It serves as the foundation for specialized field types.
 */
export const BaseField: React.FC<BaseFieldProps> = ({
  id,
  name,
  label,
  required = false,
  disabled = false,
  readOnly = false,
  description,
  error,
  className,
  labelClassName,
  containerClassName,
  children,
  renderField
}) => {
  return (
    <div className={cn('space-y-1', containerClassName)}>
      {label && (
        <div className="flex justify-between">
          <Label
            htmlFor={id}
            className={cn(
              'text-sm font-medium',
              error && 'text-destructive',
              disabled && 'text-muted-foreground opacity-70',
              labelClassName
            )}
          >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        </div>
      )}
      
      {renderField()}
      
      {description && !error && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      
      {error && (
        <p className="text-xs text-destructive font-medium">{error}</p>
      )}
      
      {children}
    </div>
  );
};

export default BaseField;
