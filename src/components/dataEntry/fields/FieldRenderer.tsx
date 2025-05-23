
import React from 'react';
import { Column, ColumnType } from '@/types/column';
import InputField from './InputField';
import TextAreaField from './TextAreaField';
import SelectField from './SelectField';
import CheckboxField from './CheckboxField';
import RadioField from './RadioField';
import DateField from './DateField';

export interface FieldRendererProps {
  column: Column;
  value: any;
  onChange: (e: React.ChangeEvent<any>) => void;
  onValueChange?: (value: any) => void;
  isDisabled?: boolean;
}

const FieldRenderer: React.FC<FieldRendererProps> = ({
  column,
  value,
  onChange,
  onValueChange,
  isDisabled = false
}) => {
  // Safely guard against undefined column
  if (!column) {
    console.warn('FieldRenderer received undefined column');
    return null;
  }

  const columnType = column.type as ColumnType;
  
  switch (columnType) {
    case 'text':
    case 'email':
    case 'phone':
    case 'url':
    case 'password':
    case 'number':
      return (
        <InputField 
          column={column} 
          value={value} 
          onChange={onChange} 
          isDisabled={isDisabled} 
          type={columnType === 'number' ? 'number' : columnType === 'password' ? 'password' : 'text'} 
        />
      );
    
    case 'textarea':
      return (
        <TextAreaField 
          column={column} 
          value={value} 
          onChange={onChange} 
          isDisabled={isDisabled} 
        />
      );
    
    case 'select':
      return (
        <SelectField 
          column={column} 
          value={value} 
          onValueChange={onValueChange} 
          isDisabled={isDisabled} 
        />
      );
    
    case 'checkbox':
      return (
        <CheckboxField 
          column={column} 
          value={value} 
          onValueChange={onValueChange} 
          isDisabled={isDisabled} 
        />
      );
    
    case 'radio':
      return (
        <RadioField 
          column={column} 
          value={value} 
          onValueChange={onValueChange} 
          isDisabled={isDisabled} 
        />
      );
      
    default:
      return (
        <InputField 
          column={column} 
          value={value} 
          onChange={onChange} 
          isDisabled={isDisabled} 
        />
      );
  }
};

export default FieldRenderer;
