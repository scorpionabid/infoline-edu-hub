
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
  // Safely guard against undefined or invalid column with detailed logging
  if (!column) {
    console.warn('FieldRenderer received undefined column');
    return null;
  }
  
  if (!column.id) {
    console.warn('FieldRenderer received column without ID', column);
    return null;
  }

  // Create safe handlers with error boundaries
  const safeOnValueChange = React.useCallback((newValue: any) => {
    try {
      if (typeof onValueChange === 'function') {
        onValueChange(newValue);
      }
    } catch (err) {
      console.error(`Error in onValueChange for column ${column.id}:`, err);
    }
  }, [onValueChange, column.id]);

  const safeOnChange = React.useCallback((e: React.ChangeEvent<any>) => {
    try {
      if (typeof onChange === 'function') {
        onChange(e);
      }
    } catch (err) {
      console.error(`Error in onChange for column ${column.id}:`, err);
    }
  }, [onChange, column.id]);

  // Ensure column type is valid with fallback
  const columnType = React.useMemo(() => {
    try {
      if (!column.type) return 'text';
      return (column.type as string) as ColumnType;
    } catch (err) {
      console.warn(`Invalid column type for ${column.id}, defaulting to text`, err);
      return 'text';
    }
  }, [column.id, column.type]);
  
  // Implement safe rendering with error boundaries for each field type
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
          value={value !== undefined ? value : ''} 
          onChange={safeOnChange} 
          isDisabled={isDisabled} 
          type={columnType === 'number' ? 'number' : columnType === 'password' ? 'password' : 'text'} 
        />
      );
    
    case 'textarea':
      return (
        <TextAreaField 
          column={column} 
          value={value !== undefined ? value : ''} 
          onChange={safeOnChange} 
          isDisabled={isDisabled} 
        />
      );
    
    case 'select':
      return (
        <SelectField 
          column={column} 
          value={value !== undefined ? value : ''} 
          onValueChange={safeOnValueChange} 
          isDisabled={isDisabled} 
        />
      );
    
    case 'checkbox':
      return (
        <CheckboxField 
          column={column} 
          value={value !== undefined ? value : false} 
          onValueChange={safeOnValueChange} 
          isDisabled={isDisabled} 
        />
      );
    
    case 'radio':
      return (
        <RadioField 
          column={column} 
          value={value !== undefined ? value : ''} 
          onValueChange={safeOnValueChange} 
          isDisabled={isDisabled} 
        />
      );
      
    case 'date':
      return (
        <DateField
          column={column}
          value={value !== undefined ? value : ''}
          onChange={safeOnChange}
          onValueChange={safeOnValueChange}
          isDisabled={isDisabled}
        />
      );
      
    default:
      console.warn(`Unknown column type: ${columnType} for column ${column.id}, defaulting to text input`);
      return (
        <InputField 
          column={column} 
          value={value !== undefined ? value : ''} 
          onChange={safeOnChange} 
          isDisabled={isDisabled} 
        />
      );
  }
};

export default FieldRenderer;
