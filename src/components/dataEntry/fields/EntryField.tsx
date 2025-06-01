import React from 'react';
import { Column } from '@/types/column';
import Field, { ControlledAdapter } from './Field';

export interface EntryFieldProps {
  key?: string;
  column: Column;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  readOnly?: boolean;
  className?: string;
}

/**
 * EntryField - geriyə uyğunluq üçün wrapper komponenti
 * Daxildə yeni Field komponentindən istifadə edir və ControlledAdapter istifadə edir
 */
const EntryField: React.FC<EntryFieldProps> = ({
  column,
  value,
  onChange,
  error,
  readOnly = false
}) => {
  if (!column) return null;

  // Xəta vəziyyəti için obyekti yaradırıq
  const errors = error ? { [column.id]: error } : {};
  
  // Kontrollu komponent adaptori yaradırıq
  const adapter = React.useMemo(() => {
    return new ControlledAdapter({
      value: { [column.id]: value },
      onChange: (_name, newValue) => onChange(newValue),
      errors,
      submitting: false
    });
  }, [column.id, value, onChange, error]);

  // Yeni Field komponentini qaytarırıq
  return (
    <Field
      column={column}
      adapter={adapter}
      disabled={false}
      readOnly={readOnly}
    />
  );
};

export default EntryField;
