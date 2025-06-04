
import React from 'react';
import { Column } from '@/types/column';
import { FormAdapter } from './adapters/FormAdapter';
import FieldRendererSimple from './FieldRendererSimple';

export interface FieldProps {
  column: Column;
  adapter: FormAdapter;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
}

/**
 * Field komponenti - sütun tipinə əsasən uyğun field render edir
 */
const Field: React.FC<FieldProps> = ({
  column,
  adapter,
  disabled = false,
  readOnly = false,
  className = ''
}) => {
  const value = adapter.getValue(column.id) || '';
  const isDisabled = disabled || adapter.isDisabled();
  const isReadOnly = readOnly || adapter.isReadOnly();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    adapter.setValue(column.id, e.target.value);
  };

  return (
    <div className={className}>
      <FieldRendererSimple
        id={column.id}
        type={column.type}
        value={value}
        onChange={handleChange}
        disabled={isDisabled}
        readOnly={isReadOnly}
        placeholder={column.placeholder}
        required={column.is_required}
      />
    </div>
  );
};

export default Field;
