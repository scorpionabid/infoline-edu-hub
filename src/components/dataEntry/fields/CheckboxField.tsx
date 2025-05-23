
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Column } from '@/types/column';

interface CheckboxFieldProps {
  column: Column;
  value: any;
  onValueChange?: (value: any) => void;
  isDisabled?: boolean;
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({ 
  column, 
  value, 
  onValueChange = () => {}, 
  isDisabled = false 
}) => {
  // Ensure options is an array
  const options = Array.isArray(column.options) ? column.options : [];

  return (
    <div className="flex flex-col space-y-2">
      {options.length > 0 ? (
        options.map((option) => (
          // Check if option exists before rendering
          option && option.id ? (
            <div key={option.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`${column.id}-${option.id}`}
                checked={(value && Array.isArray(value) && value.includes(option.value)) || false}
                onCheckedChange={(checked) => {
                  const currentValue = Array.isArray(value) ? [...value] : [];
                  if (checked) {
                    onValueChange([...currentValue, option.value]);
                  } else {
                    onValueChange(currentValue.filter(val => val !== option.value));
                  }
                }}
                disabled={isDisabled}
              />
              <label className="text-sm" htmlFor={`${column.id}-${option.id}`}>
                {option.label || ''}
              </label>
            </div>
          ) : null
        ))
      ) : (
        <div className="text-sm text-gray-500">No options available</div>
      )}
    </div>
  );
};

export default CheckboxField;
