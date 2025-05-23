
import React from 'react';
import { Input } from '@/components/ui/input';
import { Column } from '@/types/column';

interface InputFieldProps {
  column: Column;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isDisabled?: boolean;
  type?: string;
}

const InputField: React.FC<InputFieldProps> = ({ 
  column, 
  value, 
  onChange, 
  isDisabled = false, 
  type = 'text' 
}) => {
  return (
    <Input 
      id={column.id} 
      type={type} 
      placeholder={column.placeholder} 
      value={value || ''} 
      onChange={onChange} 
      disabled={isDisabled}
    />
  );
};

export default InputField;
