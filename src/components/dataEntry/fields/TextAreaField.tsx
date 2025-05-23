
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Column } from '@/types/column';

interface TextAreaFieldProps {
  column: Column;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isDisabled?: boolean;
}

const TextAreaField: React.FC<TextAreaFieldProps> = ({ 
  column, 
  value, 
  onChange, 
  isDisabled = false 
}) => {
  return (
    <Textarea 
      id={column.id} 
      placeholder={column.placeholder} 
      value={value || ''} 
      onChange={onChange} 
      disabled={isDisabled}
    />
  );
};

export default TextAreaField;
