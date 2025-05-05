
import React from 'react';
import { Column } from '@/types/column';
import TextInput from './inputs/TextInput';
import NumberInput from './inputs/NumberInput';
import DateInput from './inputs/DateInput';
import SelectInput from './inputs/SelectInput';
import CheckboxInput from './inputs/CheckboxInput';
import RadioInput from './inputs/RadioInput';

interface EntryFieldProps {
  column: Column;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const EntryField: React.FC<EntryFieldProps> = ({ column, value, onChange, error }) => {
  switch (column.type) {
    case 'text':
    case 'email':
    case 'url':
    case 'tel':
    case 'phone':
    case 'password':
      return (
        <TextInput 
          column={column} 
          value={value} 
          onChange={onChange}
          error={error}
        />
      );
    case 'textarea':
      return (
        <TextInput 
          column={column} 
          value={value} 
          onChange={onChange}
          multiline={true}
          error={error}
        />
      );
    case 'number':
      return (
        <NumberInput 
          column={column} 
          value={value} 
          onChange={onChange}
          error={error}
        />
      );
    case 'date':
      return (
        <DateInput 
          column={column} 
          value={value} 
          onChange={onChange}
          error={error}
        />
      );
    case 'select':
      return (
        <SelectInput 
          column={column} 
          value={value} 
          onChange={onChange}
          error={error}
        />
      );
    case 'checkbox':
      return (
        <CheckboxInput 
          column={column} 
          value={value} 
          onChange={onChange}
          error={error}
        />
      );
    case 'radio':
      return (
        <RadioInput 
          column={column} 
          value={value} 
          onChange={onChange}
          error={error}
        />
      );
    default:
      return (
        <div className="text-red-500">
          Bilinməyən sütun tipi: {column.type}
        </div>
      );
  }
};

export default EntryField;
