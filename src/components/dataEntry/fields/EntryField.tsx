
import React from 'react';
import { Column } from '@/types/column';
import { FormAdapter } from './adapters/FormAdapter';
import Field from './Field';

export interface EntryFieldProps {
  column: Column;
  adapter: FormAdapter;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
}

/**
 * Entry Field komponenti - Field komponentinin wrapper-ı
 */
const EntryField: React.FC<EntryFieldProps> = (props) => {
  return <Field {...props} />;
};

export default EntryField;
