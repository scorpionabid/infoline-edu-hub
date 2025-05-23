
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

  // Safely convert value to boolean, handling various string and boolean formats
  const getCheckedState = React.useMemo(() => {
    try {
      if (value === true || value === 'true' || value === 1 || value === '1') {
        return true;
      }
      return false;
    } catch (err) {
      console.warn(`Error parsing checkbox value for column ${column.id}:`, err);
      return false;
    }
  }, [column.id, value]);
  
  const handleChange = (checked: boolean) => {
    try {
      onValueChange(checked.toString());
    } catch (err) {
      console.error(`Error in checkbox change handler for column ${column.id}:`, err);
    }
  };
  
  // Generate a stable ID for the checkbox
  const checkboxId = `checkbox-${column.id}`;
  
  return (
    <div className="flex items-center space-x-2">
      <Checkbox 
        id={checkboxId}
        checked={getCheckedState}
        onCheckedChange={handleChange}
        disabled={isDisabled}
      />
      <label 
        htmlFor={checkboxId} 
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {column.placeholder || column.name || ''}
      </label>
    </div>
  );
};

export default CheckboxField;
