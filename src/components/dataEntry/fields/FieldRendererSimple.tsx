import React from 'react';
import { ColumnType, ColumnOption } from '@/types/column';
import InputFieldAdapter from './adapters/InputFieldAdapter';
import TextAreaAdapter from './adapters/TextAreaAdapter';
import SelectAdapter from './adapters/SelectAdapter';
import CheckboxAdapter from './adapters/CheckboxAdapter';
import RadioAdapter from './adapters/RadioAdapter';
import DateAdapter from './adapters/DateAdapter';

// Sadələşdirilmiş FieldRenderer prop interfeysi, FormFields komponentinə uyğun
export interface FieldRendererSimpleProps {
  type: ColumnType;
  value: any;
  onChange: (...event: any[]) => void;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  options?: ColumnOption[];
}

const FieldRendererSimple: React.FC<FieldRendererSimpleProps> = ({
  type,
  value,
  onChange,
  disabled = false,
  readOnly = false,
  required = false,
  options = []
}) => {
  // TypeScript-nin düzgün işləməsi üçün type dəyərinin ColumnType-a uyğunluğunu yoxlayırıq
  const safeType = (type && typeof type === 'string') 
    ? (type as ColumnType) 
    : 'text'; // Əgər tip yoxdursa və ya string deyilsə, default olaraq 'text' istifadə edirik
  
  // Type-a uyğun sahə komponentini render edirik
  switch (safeType) {
    case 'textarea':
      return (
        <TextAreaAdapter 
          value={value || ''} 
          onChange={onChange}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
        />
      );
    
    case 'select':
      return (
        <SelectAdapter 
          value={value || ''} 
          onChange={onChange}
          options={options || []}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
        />
      );
    
    case 'checkbox':
      return (
        <CheckboxAdapter 
          value={value === 'true' || value === true}
          onChange={onChange}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
        />
      );
    
    case 'radio':
      return (
        <RadioAdapter 
          value={value || ''} 
          onChange={onChange}
          options={options || []}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
        />
      );
    
    case 'date':
      return (
        <DateAdapter 
          value={value || ''} 
          onChange={onChange}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          dateType="date"
        />
      );

    case 'time':
      return (
        <DateAdapter 
          value={value || ''} 
          onChange={onChange}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          dateType="time"
        />
      );

    case 'datetime':
      return (
        <DateAdapter 
          value={value || ''} 
          onChange={onChange}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          dateType="datetime-local"
        />
      );
    
    // Default: input field (text, number, email, etc.)
    default:
      return (
        <InputFieldAdapter 
          type={safeType} 
          value={value || ''} 
          onChange={onChange}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
        />
      );
  }
};

export default FieldRendererSimple;
