import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface CheckboxAdapterProps {
  value: any;
  onChange: (...event: any[]) => void;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  label?: string;
}

const CheckboxAdapter: React.FC<CheckboxAdapterProps> = ({ 
  value, 
  onChange, 
  disabled = false,
  readOnly = false,
  required = false,
  label = ''
}) => {
  // Checkbox dəyərini boolean-a çeviririk
  const isChecked = value === true || value === 'true';
  
  // Dəyişiklik hadisəsini idarə edirik
  const handleChange = (checked: boolean) => {
    onChange(checked ? 'true' : 'false');
  };
  
  return (
    <div className="flex items-center space-x-2">
      <Checkbox 
        checked={isChecked}
        onCheckedChange={handleChange}
        disabled={disabled || readOnly}
        required={required}
        aria-readonly={readOnly}
        className={readOnly ? 'opacity-70 cursor-not-allowed' : ''}
      />
      {label && <Label>{label}</Label>}
    </div>
  );
};

export default CheckboxAdapter;
