
import React from 'react';
import { Column, ColumnType } from '@/types/column';
import TextInput from './TextInput';
import NumberInput from './NumberInput';
import DateInput from './DateInput';
import CheckboxField from './CheckboxField';
import RadioField from './RadioField';

export interface UnifiedFieldRendererProps {
  column: Column;
  value: any;
  onChange: (value: any) => void;
  readOnly?: boolean;
  isDisabled?: boolean;
}

const UnifiedFieldRenderer: React.FC<UnifiedFieldRendererProps> = ({
  column,
  value,
  onChange,
  readOnly = false,
  isDisabled = false
}) => {
  const handleChange = (newValue: any) => {
    if (!readOnly && !isDisabled) {
      onChange(newValue);
    }
  };

  switch (column.type) {
    case 'text':
      return (
        <TextInput
          label={column.name}
          value={value || ''}
          onChange={handleChange}
          placeholder={column.placeholder}
          required={column.is_required}
          disabled={isDisabled}
          error=""
        />
      );

    case 'number':
      return (
        <NumberInput
          label={column.name}
          value={value || 0}
          onChange={handleChange}
          placeholder={column.placeholder}
          required={column.is_required}
          disabled={isDisabled}
          error=""
        />
      );

    case 'date':
      return (
        <DateInput
          label={column.name}
          value={value || ''}
          onChange={handleChange}
          required={column.is_required}
          disabled={isDisabled}
          error=""
        />
      );

    case 'boolean':
      return (
        <CheckboxField
          label={column.name}
          checked={value || false}
          onChange={handleChange}
          disabled={isDisabled}
          error=""
        />
      );

    case 'select':
    case 'radio':
      const options = Array.isArray(column.options) ? column.options.map(opt => ({
        value: typeof opt === 'string' ? opt : opt.value || '',
        label: typeof opt === 'string' ? opt : opt.label || opt.value || ''
      })) : [];

      return (
        <RadioField
          label={column.name}
          value={value || ''}
          options={options}
          onChange={handleChange}
          disabled={isDisabled}
          error=""
          required={column.is_required}
        />
      );

    default:
      return (
        <TextInput
          label={column.name}
          value={value || ''}
          onChange={handleChange}
          placeholder={column.placeholder}
          required={column.is_required}
          disabled={isDisabled}
          error=""
        />
      );
  }
};

export default UnifiedFieldRenderer;
