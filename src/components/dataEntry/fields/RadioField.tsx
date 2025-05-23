
import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Column } from '@/types/column';

interface RadioFieldProps {
  column: Column;
  value: any;
  onValueChange?: (value: any) => void;
  isDisabled?: boolean;
}

const RadioField: React.FC<RadioFieldProps> = ({ 
  column, 
  value, 
  onValueChange = () => {}, 
  isDisabled = false 
}) => {
  // Ensure column is valid before proceeding
  if (!column || !column.id) {
    console.warn('Invalid column provided to RadioField');
    return null;
  }

  // Safe parsing of options with extensive error handling
  const options = React.useMemo(() => {
    try {
      if (!column.options) {
        return [];
      }
      
      if (Array.isArray(column.options)) {
        return column.options
          .filter(option => option !== null && option !== undefined) // Filter out invalid options
          .map((option, index) => {
            // Create a stable, unique ID that doesn't rely on Date.now()
            const uniqueId = `option-${index}-${column.id}-${index}`;
            
            // Handle different option formats
            if (typeof option === 'string') {
              return {
                id: uniqueId,
                value: option,
                label: option
              };
            } 
            
            if (typeof option === 'object' && option !== null) {
              // Ensure all required properties exist
              return {
                id: option.id || uniqueId,
                value: String(option.value || uniqueId),
                label: option.label || String(option.value || `Option ${index}`)
              };
            }
            
            // Fallback for unexpected option types
            return {
              id: uniqueId,
              value: String(option || ''),
              label: String(option || '')
            };
          });
      }
      
      // Handle string-formatted options (parse JSON)
      if (typeof column.options === 'string') {
        try {
          const parsedOptions = JSON.parse(column.options);
          if (Array.isArray(parsedOptions)) {
            return parsedOptions.map((option, index) => {
              // Create a stable, unique ID
              const uniqueId = `option-${index}-${column.id}-${index}`;
              
              if (typeof option === 'string') {
                return { id: uniqueId, value: option, label: option };
              } else {
                return { 
                  id: option.id || uniqueId,
                  value: String(option.value || uniqueId), 
                  label: option.label || String(option.value || `Option ${index}`)
                };
              }
            });
          }
        } catch (parseErr) {
          console.warn(`Failed to parse options string for column ${column.id}:`, parseErr);
        }
      }
      
      return [];
    } catch (err) {
      console.warn(`Failed to process options for column ${column.id}:`, err);
      return [];
    }
  }, [column.id, column.options]);

  // Handle undefined or empty value
  const safeValue = value !== undefined && value !== null ? String(value) : '';

  return (
    <RadioGroup 
      value={safeValue} 
      onValueChange={onValueChange}
      disabled={isDisabled}
    >
      {options.length > 0 ? (
        options.map((option) => {
          // Safety check for option
          if (!option || !option.id) {
            return null;
          }
          
          // Generate stable ID
          const optionId = `${column.id}-${option.id}`;
          
          return (
            <div key={optionId} className="flex items-center space-x-2">
              <RadioGroupItem 
                value={option.value || ''} 
                id={optionId} 
              />
              <label className="text-sm" htmlFor={optionId}>
                {option.label || option.value || ''}
              </label>
            </div>
          );
        })
      ) : (
        <div className="text-sm text-gray-500">No options available</div>
      )}
    </RadioGroup>
  );
};

export default RadioField;
