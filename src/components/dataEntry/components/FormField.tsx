
import React from 'react';
import { FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  isRequired: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

const FormField: React.FC<FormFieldProps> = ({ 
  label, 
  isRequired, 
  error, 
  children,
  className
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="form-item">
        <div className="flex items-center">
          <label className="flex items-center space-x-2 text-base font-medium mb-1">
            <span>{label}</span>
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
        </div>
        
        {children}
        
        {error && (
          <div className="text-sm font-medium text-destructive mt-1">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormField;
