
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Column } from '@/types/column';

interface SelectFieldProps {
  column: Column;
  value: any;
  onValueChange?: (value: any) => void;
  isDisabled?: boolean;
}

const SelectField: React.FC<SelectFieldProps> = ({ 
  column, 
  value, 
  onValueChange = () => {}, 
  isDisabled = false 
}) => {
  // Ensure options is an array
  const options = Array.isArray(column.options) ? column.options : [];

  return (
    <Select 
      value={value || ''} 
      onValueChange={onValueChange} 
      disabled={isDisabled}
    >
      <SelectTrigger>
        <SelectValue placeholder={column.placeholder || 'Select an option'} />
      </SelectTrigger>
      <SelectContent>
        {options.length > 0 ? (
          options.map((option) => (
            // Ensure the option is valid before rendering
            option && option.id ? (
              <SelectItem key={option.id} value={option.value || ''}>
                {option.label || ''}
              </SelectItem>
            ) : null
          ))
        ) : (
          <SelectItem value="no-options">No options available</SelectItem>
        )}
      </SelectContent>
    </Select>
  );
};

export default SelectField;
