
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
  // Ensure options is an array
  const options = Array.isArray(column.options) ? column.options : [];

  return (
    <RadioGroup 
      value={value || ''} 
      onValueChange={onValueChange}
      disabled={isDisabled}
    >
      {options.length > 0 ? (
        options.map((option) => (
          // Check if option exists before rendering
          option && option.id ? (
            <div key={option.id} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value || ''} id={`${column.id}-${option.id}`} />
              <label className="text-sm" htmlFor={`${column.id}-${option.id}`}>
                {option.label || ''}
              </label>
            </div>
          ) : null
        ))
      ) : (
        <div className="text-sm text-gray-500">No options available</div>
      )}
    </RadioGroup>
  );
};

export default RadioField;
