
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

  // Safe parsing of options - handle any potential format to prevent errors
  let options: Array<{id: string, value: string, label?: string}> = [];
  
  try {
    if (Array.isArray(column.options)) {
      options = column.options
        .filter(option => option && (option.id || option.value)) // Filter out invalid options
        .map((option, index) => {
          // Ensure each option has an id and value
          const id = option.id || `option-${index}-${Date.now()}`;
          const value = option.value || id;
          return {
            id,
            value,
            label: option.label || value
          };
        });
    }
  } catch (err) {
    console.warn(`Failed to parse options for column ${column.id}:`, err);
  }

  return (
    <RadioGroup 
      value={value || ''} 
      onValueChange={onValueChange}
      disabled={isDisabled}
    >
      {options.length > 0 ? (
        options.map((option) => (
          <div key={option.id} className="flex items-center space-x-2">
            <RadioGroupItem value={option.value} id={`${column.id}-${option.id}`} />
            <label className="text-sm" htmlFor={`${column.id}-${option.id}`}>
              {option.label || option.value || ''}
            </label>
          </div>
        ))
      ) : (
        <div className="text-sm text-gray-500">No options available</div>
      )}
    </RadioGroup>
  );
};

export default RadioField;
