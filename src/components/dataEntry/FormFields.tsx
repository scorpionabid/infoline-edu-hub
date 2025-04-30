
import React from 'react';
import { Column } from '@/types/column';
import { DataEntryStatus } from '@/types/dataEntry';
import { useForm } from 'react-hook-form';
import { StatusIndicator } from './StatusIndicators';
import TextInput from './inputs/TextInput';
import { NumberInput } from './inputs/NumberInput';
import DateInput from './inputs/DateInput';
import TextAreaInput from './inputs/TextAreaInput';
import { SelectInput } from './inputs/SelectInput';
import { EntryValue } from '@/types/dataEntry';
import CheckboxInput from './inputs/CheckboxInput';
import { Card, CardContent } from '@/components/ui/card';
import { validateEntryValue } from './utils/formUtils';

interface FormFieldProps {
  column: Column;
  value: string;
  status?: DataEntryStatus;
  onChange: (value: string) => void;
  isDisabled?: boolean;
  error?: {
    message: string;
    type: string;
  };
}

export const FormField: React.FC<FormFieldProps> = ({
  column,
  value,
  status,
  onChange,
  isDisabled = false,
  error
}) => {
  const form = useForm({
    defaultValues: {
      [column.id]: value || column.default_value || ''
    }
  });

  React.useEffect(() => {
    form.reset({
      [column.id]: value || column.default_value || ''
    });
  }, [column.id, value, column.default_value, form]);

  const handleChange = (newValue: string) => {
    onChange(newValue);
  };

  const getFieldByType = () => {
    switch (column.type) {
      case 'text':
        return (
          <TextInput
            name={column.id}
            control={form.control}
            label={column.name}
            placeholder={column.placeholder}
            helpText={column.help_text}
            disabled={isDisabled || status === 'approved'}
            required={column.is_required}
            onChange={handleChange}
          />
        );
      
      case 'textarea':
        return (
          <TextAreaInput
            name={column.id}
            control={form.control}
            label={column.name}
            placeholder={column.placeholder}
            helpText={column.help_text}
            disabled={isDisabled || status === 'approved'}
            required={column.is_required}
            onChange={handleChange}
          />
        );
      
      case 'email':
      case 'url':
      case 'phone':
        return (
          <TextInput
            name={column.id}
            control={form.control}
            label={column.name}
            placeholder={column.placeholder || `Daxil edin...`}
            helpText={column.help_text}
            disabled={isDisabled || status === 'approved'}
            required={column.is_required}
            onChange={handleChange}
          />
        );
      
      case 'number':
        return (
          <NumberInput
            name={column.id}
            control={form.control}
            label={column.name}
            placeholder={column.placeholder}
            helpText={column.help_text}
            disabled={isDisabled || status === 'approved'}
            required={column.is_required}
            validation={column.validation}
            onChange={handleChange}
          />
        );
      
      case 'date':
        return (
          <DateInput
            name={column.id}
            control={form.control}
            label={column.name}
            placeholder={column.placeholder}
            helpText={column.help_text}
            disabled={isDisabled || status === 'approved'}
            required={column.is_required}
            onChange={handleChange}
          />
        );
      
      case 'select':
        return (
          <SelectInput
            name={column.id}
            control={form.control}
            label={column.name}
            options={column.options || []}
            placeholder={column.placeholder || "Seçin"}
            helpText={column.help_text}
            disabled={isDisabled || status === 'approved'}
            required={column.is_required}
            onChange={handleChange}
          />
        );
      
      case 'checkbox':
        return (
          <CheckboxInput
            name={column.id}
            control={form.control}
            label={column.name}
            helpText={column.help_text}
            disabled={isDisabled || status === 'approved'}
            onChange={(checked) => handleChange(checked ? 'true' : 'false')}
          />
        );
      
      default:
        return (
          <TextInput
            name={column.id}
            control={form.control}
            label={column.name}
            placeholder={column.placeholder}
            helpText={column.help_text}
            disabled={isDisabled || status === 'approved'}
            required={column.is_required}
            onChange={handleChange}
          />
        );
    }
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        {getFieldByType()}
        <div className="mt-2">
          <StatusIndicator status={status} error={error} />
        </div>
      </CardContent>
    </Card>
  );
};

export const saveFormField = async (
  column: Column,
  value: string,
  schoolId: string,
  categoryId: string
): Promise<{ success: boolean; entryId?: string; error?: string }> => {
  try {
    // Validasiya et
    const validationError = validateEntryValue(value, column.type, column.validation);
    if (validationError) {
      return { success: false, error: validationError.message };
    }

    // Məlumat yarat
    const entry = {
      column_id: column.id,
      category_id: categoryId,
      school_id: schoolId,
      value: value,
      status: 'pending' as DataEntryStatus
    };

    // API-da saxlamaq üçün lazım olan kod burada olmalıdır
    // Təxminən belə bir şey:
    // const { data, error } = await saveDataEntry(entry);
    
    // Simulyasiya edirik
    const entryId = Math.random().toString(36).substring(2, 15);
    
    return { success: true, entryId };
  } catch (error) {
    console.error('Form field save error:', error);
    return { success: false, error: 'Xəta baş verdi' };
  }
};
