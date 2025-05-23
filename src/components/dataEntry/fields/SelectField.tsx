
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
  // Ensure column is valid before proceeding
  if (!column || !column.id) {
    console.warn('Invalid column provided to SelectField');
    return null;
  }

  // Safe parsing of options - handle any potential format to prevent errors
  let options: Array<{id?: string, value: string, label?: string}> = [];
  
  try {
    if (Array.isArray(column.options)) {
      options = column.options
        .filter(option => option !== null && option !== undefined) // Filter out null/undefined options
        .map((option, index) => {
          if (typeof option === 'string') {
            return { 
              id: `option-${index}-${Date.now()}`,
              value: option,
              label: option
            };
          } else if (typeof option === 'object' && option !== null) {
            const id = option.id || `option-${index}-${Date.now()}`;
            const value = option.value?.toString() || id;
            return {
              id,
              value,
              label: option.label || value
            };
          } else {
            // Fallback for unexpected option types
            return {
              id: `option-${index}-${Date.now()}`,
              value: String(option || ''),
              label: String(option || '')
            };
          }
        });
    }
  } catch (err) {
    console.warn(`Failed to parse options for column ${column.id}:`, err);
  }

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
