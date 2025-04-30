
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextInput } from './inputs/TextInput';
import { NumberInput } from './inputs/NumberInput';
import { SelectInput } from './inputs/SelectInput';
import { DateInput } from './inputs/DateInput';
import { TextAreaInput } from './inputs/TextAreaInput';
import { Column, ColumnType } from '@/types/column';
import { DataEntry, DataEntryStatus, EntryValue } from '@/types/dataEntry';
import { CheckboxInput } from './inputs/CheckboxInput';
import { StatusIndicator } from './StatusIndicators';

interface FormFieldProps {
  column: Column;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  entryStatus?: DataEntryStatus;
  error?: { message: string; type: string } | null;
}

export const FormField = ({
  column,
  value,
  onChange,
  disabled = false,
  entryStatus,
  error
}: FormFieldProps) => {
  const form = useForm<{ value: string }>({
    defaultValues: { value }
  });

  const getFieldType = () => {
    switch (column.type) {
      case 'text':
      case 'textarea':
        return column.type;
      case 'number':
        return 'number';
      case 'date':
        return 'date';
      case 'select':
        return 'select';
      case 'checkbox':
        return 'checkbox';
      case 'radio':
        return 'radio';
      case 'email':
        return 'email';
      default:
        return 'text';
    }
  };

  const fieldType = getFieldType();
  
  const renderField = () => {
    switch (fieldType) {
      case 'text':
        return (
          <TextInput
            name="value"
            control={form.control}
            label={column.name}
            placeholder={column.placeholder || ''}
            helpText={column.help_text}
            disabled={disabled}
            required={column.is_required}
            onChange={onChange}
          />
        );
      case 'textarea':
        return (
          <TextAreaInput
            name="value"
            control={form.control}
            label={column.name}
            placeholder={column.placeholder || ''}
            helpText={column.help_text}
            disabled={disabled}
            required={column.is_required}
            onChange={onChange}
          />
        );
      case 'number':
        return (
          <NumberInput
            name="value"
            control={form.control}
            label={column.name}
            placeholder={column.placeholder || ''}
            helpText={column.help_text}
            disabled={disabled}
            required={column.is_required}
            validation={column.validation}
            onChange={onChange}
          />
        );
      case 'date':
        return (
          <DateInput
            name="value"
            control={form.control}
            label={column.name}
            helpText={column.help_text}
            disabled={disabled}
            required={column.is_required}
            onChange={(date) => {
              if (date instanceof Date) {
                onChange(date.toISOString().split('T')[0]);
              } else if (typeof date === 'string') {
                onChange(date);
              }
            }}
          />
        );
      case 'select':
        return (
          <SelectInput
            name="value"
            control={form.control}
            label={column.name}
            placeholder={column.placeholder || 'Seçin'}
            helpText={column.help_text}
            options={column.options}
            disabled={disabled}
            required={column.is_required}
            onChange={onChange}
          />
        );
      case 'checkbox':
        return (
          <CheckboxInput
            name="value"
            control={form.control}
            label={column.name}
            helpText={column.help_text}
            disabled={disabled}
            required={column.is_required}
            onChange={(checked) => onChange(checked ? 'true' : 'false')}
          />
        );
      case 'email':
        return (
          <TextInput
            name="value"
            control={form.control}
            label={column.name}
            placeholder={column.placeholder || 'Email'}
            helpText={column.help_text}
            disabled={disabled}
            required={column.is_required}
            onChange={onChange}
            type="email"
          />
        );
      default:
        return (
          <TextInput
            name="value"
            control={form.control}
            label={column.name}
            placeholder={column.placeholder || ''}
            helpText={column.help_text}
            disabled={disabled}
            required={column.is_required}
            onChange={onChange}
          />
        );
    }
  };

  return (
    <FormProvider {...form}>
      <div className="space-y-2">
        {renderField()}
        {(entryStatus || error) && (
          <StatusIndicator status={entryStatus} error={error} />
        )}
      </div>
    </FormProvider>
  );
};

export const createEmptyDataEntry = (column: Column, schoolId: string): DataEntry => {
  return {
    column_id: column.id,
    category_id: column.category_id,
    school_id: schoolId,
    value: column.default_value || '',
    status: 'pending'
  };
};

export const createEntryValue = (column: Column, entry: DataEntry | null = null): EntryValue => {
  return {
    name: column.name,
    columnId: column.id,
    value: entry?.value || column.default_value || '',
    isValid: true,
    status: entry?.status,
    entryId: entry?.id
  };
};
