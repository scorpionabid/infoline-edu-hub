
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Column } from '@/types/column';

interface CheckboxFieldProps {
  column: Column;
  value: any;
  onValueChange?: (value: any) => void;
  isDisabled?: boolean;
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({ 
  column, 
  value, 
  onValueChange = () => {}, 
  isDisabled = false 
}) => {
  // Ensure column is valid before proceeding
  if (!column || !column.id) {
    console.warn('Invalid column provided to CheckboxField');
    return null;
  }

  // Handle both string 'true'/'false' and boolean values
  const checked = value === true || value === 'true';
  
  const handleChange = (checked: boolean) => {
    onValueChange(checked.toString());
  };
  
  return (
    <div className="flex items-center space-x-2">
      <Checkbox 
        id={column.id} 
        checked={checked}
        onCheckedChange={handleChange}
        disabled={isDisabled}
      />
      <label 
        htmlFor={column.id} 
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {column.placeholder || column.name || ''}
      </label>
    </div>
  );
};

export default CheckboxField;
