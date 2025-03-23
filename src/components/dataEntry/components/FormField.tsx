
import React from 'react';
import { FormItem, FormLabel, FormMessage } from '@/components/ui/form';
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
      <FormItem>
        <div className="flex items-center">
          <FormLabel className="flex items-center space-x-2 text-base mb-1">
            <span>{label}</span>
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </FormLabel>
        </div>
        
        {children}
        
        {error && (
          <FormMessage>
            {error}
          </FormMessage>
        )}
      </FormItem>
    </div>
  );
};

export default FormField;
