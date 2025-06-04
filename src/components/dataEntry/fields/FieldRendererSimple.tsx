
import React from 'react';
import { ColumnType } from '@/types/column';

export interface FieldRendererSimpleProps {
  id: string;
  type: ColumnType;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  required?: boolean;
}

/**
 * Sadə Field Renderer komponenti - test və sadə istifadə üçün
 */
const FieldRendererSimple: React.FC<FieldRendererSimpleProps> = ({
  id,
  type,
  value,
  onChange,
  disabled = false,
  readOnly = false,
  placeholder,
  required = false
}) => {
  return (
    <input
      data-testid={`field-${id}`}
      id={id}
      type={type === ColumnType.NUMBER ? 'number' : 'text'}
      value={value}
      onChange={onChange}
      disabled={disabled}
      readOnly={readOnly}
      placeholder={placeholder}
      required={required}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
};

export default FieldRendererSimple;
