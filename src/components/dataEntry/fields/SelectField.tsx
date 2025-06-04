
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
          .filter(option => option !== null && option !== undefined)
          .map((option, index) => {
            const uniqueKey = `option-${index}-${column.id}`;
            
            if (typeof option === 'string') {
              // Ensure value is never empty string - use fallback
              const optionValue = option && String(option).trim() ? option : `fallback-${uniqueKey}`;
              return { 
                id: uniqueKey,
                value: optionValue,
                label: option || optionValue
              };
            } 
            else if (typeof option === 'object' && option !== null) {
              const id = option.id || uniqueKey;
              // Ensure value is never empty string - use fallback
              const optionValue = (option.value && String(option.value).trim()) || `fallback-${uniqueKey}`;
              return {
                id,
                value: optionValue,
                label: option.label || optionValue
              };
            } 
            else {
              const optionValue = String(option || '').trim() || `fallback-${uniqueKey}`;
              return {
                id: uniqueKey,
                value: optionValue,
                label: optionValue
              };
            }
          })
          .filter(option => option.value && String(option.value).trim() !== ''); // Final filter to remove any empty values
      }
      
      // Handle string-formatted options (JSON)
      if (typeof column.options === 'string') {
        try {
          const parsedOptions = JSON.parse(column.options);
          if (Array.isArray(parsedOptions)) {
            return parsedOptions
              .map((option, index) => {
                const uniqueKey = `option-${index}-${column.id}`;
                if (typeof option === 'string') {
                  const optionValue = option && String(option).trim() ? option : `fallback-${uniqueKey}`;
                  return { id: uniqueKey, value: optionValue, label: option || optionValue };
                } else {
                  const optionValue = (option.value && String(option.value).trim()) || `fallback-${uniqueKey}`;
                  return { 
                    id: option.id || uniqueKey,
                    value: optionValue, 
                    label: option.label || optionValue
                  };
                }
              })
              .filter(option => option.value && String(option.value).trim() !== '');
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

  // Ensure value is always a valid string, never empty
  const safeValue = React.useMemo(() => {
    if (value === undefined || value === null || value === '') {
      return 'NONE';
    }
    return String(value);
  }, [value]);

  const handleValueChange = (newValue: string) => {
    onValueChange(newValue === 'NONE' ? '' : newValue);
  };

  return (
    <Select 
      value={safeValue} 
      onValueChange={handleValueChange} 
      disabled={isDisabled}
    >
      <SelectTrigger>
        <SelectValue placeholder={column.placeholder || 'Select an option'} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="NONE">
          {column.placeholder || 'Select an option'}
        </SelectItem>
        {options.length > 0 ? (
          options.map((option) => {
            // Double-check that value is not empty before rendering
            if (!option || !option.value || String(option.value).trim() === '') {
              return null;
            }
            
            return (
              <SelectItem 
                key={`${column.id}-${option.id}`} 
                value={option.value}
              >
                {option.label || option.value}
              </SelectItem>
            );
          })
        ) : (
          <SelectItem value="no-options" disabled>No options available</SelectItem>
        )}
      </SelectContent>
    </Select>
  );
};

export default SelectField;
