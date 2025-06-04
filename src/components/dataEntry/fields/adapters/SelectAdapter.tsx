
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColumnOption } from '@/types/column';

interface SelectAdapterProps {
  value: any;
  onChange: (...event: any[]) => void;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  options?: ColumnOption[];
  placeholder?: string;
}

const SelectAdapter: React.FC<SelectAdapterProps> = ({ 
  value, 
  onChange, 
  disabled = false,
  readOnly = false,
  required = false,
  options = [],
  placeholder = 'Seçin...'
}) => {
  // Safe options
  const safeOptions = Array.isArray(options) ? options : [];
  
  // Ensure value is never empty string
  const safeValue = value || 'NONE';
  
  const handleValueChange = (newValue: string) => {
    // Convert NONE back to empty string for the form
    onChange(newValue === 'NONE' ? '' : newValue);
  };
  
  return (
    <Select 
      value={safeValue} 
      onValueChange={handleValueChange}
      disabled={disabled || readOnly}
      required={required}
    >
      <SelectTrigger className={readOnly ? 'opacity-70 cursor-not-allowed' : ''}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="NONE">{placeholder}</SelectItem>
        {safeOptions.map((option) => {
          // Ensure option value is never empty string
          const optionValue = option.value && option.value.trim() 
            ? option.value 
            : `fallback-${option.label || Math.random().toString(36).substring(7)}`;
            
          return (
            <SelectItem 
              key={optionValue} 
              value={optionValue}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};

export default SelectAdapter;
