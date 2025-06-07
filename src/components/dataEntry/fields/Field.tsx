
import React from 'react';
import { Column } from '@/types/column';
import { FormAdapter } from './adapters/FormAdapter';
import UnifiedFieldRenderer from './UnifiedFieldRenderer';

export interface FieldProps {
  column: Column;
  adapter: FormAdapter;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
}

/**
 * Field komponenti - sütun tipinə əsasən uyğun field render edir
 * Updated to use UnifiedFieldRenderer instead of FieldRendererSimple
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

  const handleValueChange = (value: any) => {
    adapter.setValue(column.id, value);
  };

  return (
    <div className={className}>
      <UnifiedFieldRenderer
        column={column}
        value={value}
        onChange={handleChange}
        onValueChange={handleValueChange}
        isDisabled={isDisabled}
        readOnly={isReadOnly}
      />
    </div>
  );
};

export default Field;
