
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
  // Ensure options is an array and filter out invalid options
  const options = Array.isArray(column.options) 
    ? column.options.filter(option => option && option.id && option.value) 
    : [];

  return (
    <RadioGroup 
      value={value || ''} 
      onValueChange={onValueChange}
      disabled={isDisabled}
    >
      {options.length > 0 ? (
        options.map((option) => (
          <div key={option.id} className="flex items-center space-x-2">
            <RadioGroupItem value={option.value || ''} id={`${column.id}-${option.id}`} />
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
