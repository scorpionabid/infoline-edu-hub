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
  
  return (
    <Select 
      value={value || ''} 
      onValueChange={onChange}
      disabled={disabled || readOnly}
      required={required}
    >
      <SelectTrigger className={readOnly ? 'opacity-70 cursor-not-allowed' : ''}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {safeOptions.map((option) => (
          <SelectItem 
            key={option.value} 
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SelectAdapter;
