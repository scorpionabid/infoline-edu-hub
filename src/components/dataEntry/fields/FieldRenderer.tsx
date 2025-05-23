
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
  // Safely guard against undefined or invalid column
  if (!column || !column.id) {
    console.warn('FieldRenderer received invalid column', column);
    return null;
  }

  // Create a safe onValueChange function to prevent null exceptions
  const safeOnValueChange = (newValue: any) => {
    if (typeof onValueChange === 'function') {
      onValueChange(newValue);
    }
  };

  // Create a safe onChange function to prevent null exceptions
  const safeOnChange = (e: React.ChangeEvent<any>) => {
    if (typeof onChange === 'function') {
      onChange(e);
    }
  };

  const columnType = ((column.type as string) || 'text') as ColumnType;
  
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
          onChange={safeOnChange} 
          isDisabled={isDisabled} 
          type={columnType === 'number' ? 'number' : columnType === 'password' ? 'password' : 'text'} 
        />
      );
    
    case 'textarea':
      return (
        <TextAreaField 
          column={column} 
          value={value} 
          onChange={safeOnChange} 
          isDisabled={isDisabled} 
        />
      );
    
    case 'select':
      return (
        <SelectField 
          column={column} 
          value={value} 
          onValueChange={safeOnValueChange} 
          isDisabled={isDisabled} 
        />
      );
    
    case 'checkbox':
      return (
        <CheckboxField 
          column={column} 
          value={value} 
          onValueChange={safeOnValueChange} 
          isDisabled={isDisabled} 
        />
      );
    
    case 'radio':
      return (
        <RadioField 
          column={column} 
          value={value} 
          onValueChange={safeOnValueChange} 
          isDisabled={isDisabled} 
        />
      );
      
    case 'date':
      return (
        <DateField
          column={column}
          value={value}
          onChange={safeOnChange}
          onValueChange={safeOnValueChange}
          isDisabled={isDisabled}
        />
      );
      
    default:
      console.warn(`Unknown column type: ${columnType}, defaulting to text input`);
      return (
        <InputField 
          column={column} 
          value={value} 
          onChange={safeOnChange} 
          isDisabled={isDisabled} 
        />
      );
  }
};

export default FieldRenderer;
