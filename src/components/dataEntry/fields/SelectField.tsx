
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
            const uniqueKey = `option-${index}-${column.id}`;
            
            // Handle string options
            if (typeof option === 'string') {
              // Ensure value is never empty string
              const value = option.trim() || `default-${uniqueKey}`;
              return { 
                id: uniqueKey,
                value: value,
                label: option || value
              };
            } 
            
            // Handle object options
            else if (typeof option === 'object' && option !== null) {
              const id = option.id || uniqueKey;
              // Ensure value is never empty string
              const value = (option.value && String(option.value).trim()) || id || `default-${uniqueKey}`;
              return {
                id,
                value,
                label: option.label || value
              };
            } 
            
            // Fallback for unexpected types
            else {
              const value = String(option || '').trim() || `default-${uniqueKey}`;
              return {
                id: uniqueKey,
                value: value,
                label: value
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
              const uniqueKey = `option-${index}-${column.id}`;
              if (typeof option === 'string') {
                const value = option.trim() || `default-${uniqueKey}`;
                return { id: uniqueKey, value: value, label: option || value };
              } else {
                const value = (option.value && String(option.value).trim()) || option.id || uniqueKey;
                return { 
                  id: option.id || uniqueKey,
                  value: value, 
                  label: option.label || value
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

  // Ensure value is always a valid string, never empty
  const safeValue = React.useMemo(() => {
    if (value === undefined || value === null || value === '') {
      return 'NONE'; // Default placeholder value
    }
    return String(value);
  }, [value]);

  const handleValueChange = (newValue: string) => {
    // Convert NONE back to empty string for the form
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
        {/* Always add a placeholder option */}
        <SelectItem value="NONE">
          {column.placeholder || 'Select an option'}
        </SelectItem>
        {options.length > 0 ? (
          options.map((option) => {
            // Safety check for option - ensure value is never empty
            if (!option || !option.value || option.value.trim() === '') {
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
          <SelectItem value="no-options" disabled>No options available</SelectItem>
        )}
      </SelectContent>
    </Select>
  );
};

export default SelectField;
