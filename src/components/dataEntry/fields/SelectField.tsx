
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
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
  // Ensure options is an array and filter out invalid options
  const options = Array.isArray(column.options) 
    ? column.options.filter(option => option && (option.value !== undefined)) 
    : [];

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
            <SelectItem 
              key={option.id || `option-${option.value}`} 
              value={option.value || ''}
            >
              {option.label || option.value || ''}
            </SelectItem>
          ))
        ) : (
          <SelectItem value="" disabled>No options available</SelectItem>
        )}
      </SelectContent>
    </Select>
  );
};

export default SelectField;
