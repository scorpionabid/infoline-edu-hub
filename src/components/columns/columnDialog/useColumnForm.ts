import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Column, ColumnType, ColumnOption, ColumnFormValues } from '@/types/column';

const columnFormSchema = z.object({
  name: z.string().min(1, 'Column name is required'),
  type: z.string().min(1, 'Column type is required'),
  is_required: z.boolean().default(false),
  placeholder: z.string().optional(),
  help_text: z.string().optional(),
  default_value: z.string().optional(),
  order_index: z.number().optional(),
  category_id: z.string().optional(),
  options: z.array(z.object({
    id: z.string().optional(),
    label: z.string(),
    value: z.string()
  })).optional(),
  validation: z.any().optional()
});

interface UseColumnFormProps {
  column?: Column | null;
  categoryId?: string;
  onSave: (columnData: any) => Promise<boolean>;
}

export const useColumnForm = ({ column, categoryId, onSave }: UseColumnFormProps) => {
  const isEditMode = !!column;
  const [selectedType, setSelectedType] = useState<ColumnType>(column?.type || 'text');
  const [options, setOptions] = useState<ColumnOption[]>(column?.options || []);
  const [newOption, setNewOption] = useState<Partial<ColumnOption>>({ label: '', value: '' });
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ColumnFormValues>({
    resolver: zodResolver(columnFormSchema),
    defaultValues: {
      name: column?.name || '',
      type: column?.type || 'text',
      is_required: column?.is_required || false,
      placeholder: column?.placeholder || '',
      help_text: column?.help_text || '',
      default_value: column?.default_value || '',
      order_index: column?.order_index || 0,
      category_id: categoryId || column?.category_id,
      options: column?.options || [],
      validation: column?.validation || {}
    }
  });

  // Update form when column changes
  useEffect(() => {
    if (column) {
      form.reset({
        name: column.name,
        type: column.type,
        is_required: column.is_required,
        placeholder: column.placeholder || '',
        help_text: column.help_text || '',
        default_value: column.default_value || '',
        order_index: column.order_index || 0,
        category_id: column.category_id,
        options: column.options || [],
        validation: column.validation || {}
      });
      setSelectedType(column.type);
      setOptions(column.options || []);
    }
  }, [column, form]);

  const onTypeChange = (newType: ColumnType) => {
    setSelectedType(newType);
    form.setValue('type', newType);
  };

  const addOption = () => {
    if (newOption.label && newOption.value) {
      const optionToAdd: ColumnOption = {
        id: String(Date.now()),
        label: newOption.label,
        value: newOption.value
      };
      
      const updatedOptions = [...options, optionToAdd];
      setOptions(updatedOptions);
      form.setValue('options', updatedOptions);
      setNewOption({ label: '', value: '' });
    }
  };

  const removeOption = (optionToRemove: ColumnOption) => {
    const updatedOptions = options.filter(opt => opt.id !== optionToRemove.id);
    setOptions(updatedOptions);
    form.setValue('options', updatedOptions);
  };

  const onSubmit = async (values: ColumnFormValues) => {
    setIsLoading(true);
    try {
      // Convert form values to proper format
      const columnData = {
        ...values,
        validation: values.validation || {},
        options: values.options || []
      };

      const success = await onSave(columnData);
      return success;
    } catch (error) {
      console.error('Error submitting form:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    selectedType,
    onTypeChange,
    options,
    setOptions,
    addOption,
    removeOption,
    newOption,
    setNewOption,
    onSubmit,
    isEditMode,
    isLoading
  };
};
