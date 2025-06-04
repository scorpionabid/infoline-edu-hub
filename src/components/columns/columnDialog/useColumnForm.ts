
import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ColumnType, ColumnFormValues } from '@/types/column';

const columnSchema = z.object({
  name: z.string().min(1, 'Ad tələb olunur'),
  type: z.string().min(1, 'Tip tələb olunur'),
  category_id: z.string().min(1, 'Kateqoriya tələb olunur'),
  is_required: z.boolean(),
  placeholder: z.string().optional(),
  help_text: z.string().optional(),
  default_value: z.string().optional(),
  options: z.array(z.object({
    value: z.string(),
    label: z.string(),
    disabled: z.boolean().optional(),
    id: z.string().optional(),
  })).optional(),
  validation: z.any().optional(),
  order_index: z.number(),
  status: z.enum(['active', 'inactive']).optional(),
});

export interface UseColumnFormProps {
  defaultValues?: Partial<ColumnFormValues>;
  onSubmit?: (data: ColumnFormValues) => void;
}

export const useColumnForm = ({ defaultValues, onSubmit }: UseColumnFormProps = {}) => {
  const [options, setOptions] = useState<Array<{ value: string; label: string }>>([]);
  
  const form = useForm<ColumnFormValues>({
    resolver: zodResolver(columnSchema),
    defaultValues: {
      name: '',
      type: 'text',
      category_id: '',
      is_required: false,
      placeholder: '',
      help_text: '',
      default_value: '',
      options: [],
      order_index: 0,
      status: 'active',
      ...defaultValues,
    },
  });

  const selectedType = form.watch('type');

  const handleSubmit: SubmitHandler<ColumnFormValues> = (data) => {
    const formData = {
      ...data,
      type: selectedType as ColumnType,
    };

    if (onSubmit) {
      onSubmit(formData);
    }
  };

  const updateFormData = (data: Partial<ColumnFormValues>) => {
    Object.entries(data).forEach(([key, value]) => {
      form.setValue(key as keyof ColumnFormValues, value);
    });
  };

  const addOption = () => {
    const newOptions = [...options, { value: '', label: '' }];
    setOptions(newOptions);
    form.setValue('options', newOptions);
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    form.setValue('options', newOptions);
  };

  const updateOption = (index: number, field: 'value' | 'label', value: string) => {
    const newOptions = [...options];
    newOptions[index][field] = value;
    setOptions(newOptions);
    form.setValue('options', newOptions);
  };

  return {
    form,
    options,
    selectedType,
    handleSubmit: form.handleSubmit(handleSubmit),
    updateFormData,
    addOption,
    removeOption,
    updateOption,
    isValid: form.formState.isValid,
    errors: form.formState.errors,
  };
};

