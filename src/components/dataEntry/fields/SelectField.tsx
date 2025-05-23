
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

  // Safe parsing of options with robust error handling
  const options = React.useMemo(() => {
    try {
      if (!column.options) {
        return [];
      }
      
      // Handle array of options
      if (Array.isArray(column.options)) {
        return column.options
          .filter(option => option !== null && option !== undefined) // Filter out null/undefined options
          .map((option, index) => {
            // Create a stable, unique key that doesn't rely on Date.now()
            const uniqueKey = `option-${index}-${column.id}-${index}`;
            
            // Handle string options
            if (typeof option === 'string') {
              return { 
                id: uniqueKey,
                value: option,
                label: option
              };
            } 
            
            // Handle object options
            else if (typeof option === 'object' && option !== null) {
              const id = option.id || uniqueKey;
              const value = String(option.value !== undefined ? option.value : id);
              return {
                id,
                value,
                label: option.label || value
              };
            } 
            
            // Fallback for unexpected types
            else {
              return {
                id: uniqueKey,
                value: String(option || ''),
                label: String(option || '')
              };
            }
          });
      }
      
      // Handle string-formatted options (JSON)
      if (typeof column.options === 'string') {
        try {
          const parsedOptions = JSON.parse(column.options);
          if (Array.isArray(parsedOptions)) {
            return parsedOptions.map((option, index) => {
              const uniqueKey = `option-${index}-${column.id}-${index}`;
              if (typeof option === 'string') {
                return { id: uniqueKey, value: option, label: option };
              } else {
                return { 
                  id: option.id || uniqueKey,
                  value: String(option.value || uniqueKey), 
                  label: option.label || String(option.value || `Option ${index}`)
                };
              }
            });
          }
          return [];
        } catch (parseErr) {
          console.warn(`Failed to parse options string for column ${column.id}:`, parseErr);
          return [];
        }
      }
      
      return [];
    } catch (err) {
      console.warn(`Failed to process options for column ${column.id}:`, err);
      return [];
    }
  }, [column.id, column.options]);

  // Ensure value is always a valid string
  const safeValue = React.useMemo(() => {
    if (value === undefined || value === null) return '';
    return String(value);
  }, [value]);

  return (
    <Select 
      value={safeValue} 
      onValueChange={onValueChange} 
      disabled={isDisabled}
    >
      <SelectTrigger>
        <SelectValue placeholder={column.placeholder || 'Select an option'} />
      </SelectTrigger>
      <SelectContent>
        {options.length > 0 ? (
          options.map((option) => {
            // Safety check for option
            if (!option || !option.id || !option.value) {
              return null;
            }
            
            return (
              <SelectItem 
                key={`${column.id}-${option.id}`} 
                value={option.value}
              >
                {option.label || option.value || ''}
              </SelectItem>
            );
          })
        ) : (
          <SelectItem value="" disabled>No options available</SelectItem>
        )}
      </SelectContent>
    </Select>
  );
};

export default SelectField;
