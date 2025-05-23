import React from 'react';
import { Input } from '@/components/ui/input';
import { ColumnType } from '@/types/column';

// Sadələşdirilmiş InputField adapteri
interface InputFieldAdapterProps {
  type?: ColumnType | string;
  value: any;
  onChange: (...event: any[]) => void;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  placeholder?: string;
}

const InputFieldAdapter: React.FC<InputFieldAdapterProps> = ({ 
  type = 'text', 
  value, 
  onChange, 
  disabled = false,
  readOnly = false,
  required = false,
  placeholder = ''
}) => {
  // Render həqiqi input komponenti, bütün xüsusiyyətləri ötürərək
  return (
    <Input 
      type={type as string}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled || readOnly}
      required={required}
      placeholder={placeholder}
      readOnly={readOnly}
      className={readOnly ? 'opacity-70 cursor-not-allowed' : ''}
    />
  );
};

export default InputFieldAdapter;
