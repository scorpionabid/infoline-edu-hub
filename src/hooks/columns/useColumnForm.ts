
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Column, ColumnType, ColumnFormValues, ColumnOption } from '@/types/column';
import { useLanguage } from '@/context/LanguageContext';

const columnSchema = z.object({
  name: z.string().min(1, 'Ad tələb olunur'),
  type: z.nativeEnum(ColumnType),
  is_required: z.boolean(),
  placeholder: z.string().optional(),
  help_text: z.string().optional(),
  description: z.string().optional(),
  section: z.string().optional(),
  default_value: z.string().optional(),
  options: z.array(z.object({
    value: z.string(),
    label: z.string(),
    disabled: z.boolean().optional(),
    id: z.string().optional(),
  })).optional(),
  validation: z.any().optional(),
  order_index: z.number(),
  category_id: z.string().optional(),
});

interface UseColumnFormProps {
  column?: Column | null;
  categoryId?: string;
  onSave?: (data: ColumnFormValues) => Promise<boolean>;
}

export const useColumnForm = ({ column, categoryId, onSave }: UseColumnFormProps) => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState<ColumnOption[]>([]);
  const [newOption, setNewOption] = useState({ value: '', label: '' });
  
  const isEditMode = !!column;
  
  const form = useForm<ColumnFormValues>({
    resolver: zodResolver(columnSchema),
    defaultValues: {
      name: column?.name || '',
      type: column?.type || ColumnType.TEXT,
      is_required: column?.is_required || false,
      placeholder: column?.placeholder || '',
      help_text: column?.help_text || '',
      description: column?.description || '',
      section: column?.section || '',
      default_value: column?.default_value || '',
      options: column?.options || [],
      order_index: column?.order_index || 0,
      category_id: column?.category_id || categoryId || '',
    },
  });

  const selectedType = form.watch('type');

  useEffect(() => {
    if (column?.options) {
      setOptions(column.options);
    }
  }, [column]);

  const onTypeChange = (type: ColumnType) => {
    form.setValue('type', type);
  };

  const addOption = () => {
    if (newOption.value && newOption.label) {
      const updatedOptions = [...options, { ...newOption, id: crypto.randomUUID() }];
      setOptions(updatedOptions);
      form.setValue('options', updatedOptions);
      setNewOption({ value: '', label: '' });
    }
  };

  const removeOption = (id: string) => {
    const updatedOptions = options.filter(option => option.id !== id);
    setOptions(updatedOptions);
    form.setValue('options', updatedOptions);
  };

  const onSubmit = async (data: ColumnFormValues): Promise<boolean> => {
    if (!onSave) return false;
    
    try {
      setIsLoading(true);
      
      const formData = {
        ...data,
        options: options.length > 0 ? options : undefined,
        category_id: data.category_id || categoryId || '',
      };

      const success = await onSave(formData);
      return success;
    } catch (error) {
      console.error('Error saving column:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    selectedType,
    onTypeChange,
    options,
    addOption,
    removeOption,
    newOption,
    setNewOption,
    onSubmit,
    isEditMode,
  };
};
