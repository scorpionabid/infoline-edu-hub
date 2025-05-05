
import { useState, useEffect } from 'react';
import { Column, ColumnOption } from '@/types/columns';
import { ColumnType } from '@/types/column';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

interface UseColumnFormProps {
  initialData?: Partial<Column>;
  categoryId: string;
  onSubmit: (data: Partial<Column>) => Promise<{ success: boolean; message?: string }>;
  onClose: () => void;
}

// Form validation schema
const columnFormSchema = z.object({
  name: z.string().min(1, { message: 'Column name is required' }),
  category_id: z.string(),
  type: z.string(),
  is_required: z.boolean().default(false),
  placeholder: z.string().optional(),
  help_text: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
  order_index: z.number().default(0),
  default_value: z.string().optional(),
  // validation and options are handled separately
});

export type ColumnFormValues = z.infer<typeof columnFormSchema>;

export const useColumnForm = (categories: { id: string; name: string }[], editColumn: Column | null, onSaveColumn: (columnData: any) => Promise<boolean>) => {
  const [selectedType, setSelectedType] = useState<ColumnType>(editColumn?.type || 'text');
  const [options, setOptions] = useState<ColumnOption[]>(editColumn?.options || []);
  const [newOption, setNewOption] = useState<string>('');
  const isEditMode = !!editColumn;
  
  const form = useForm<ColumnFormValues>({
    resolver: zodResolver(columnFormSchema),
    defaultValues: {
      name: editColumn?.name || '',
      category_id: editColumn?.category_id || categories[0]?.id || '',
      type: editColumn?.type || 'text',
      is_required: editColumn?.is_required ?? false,
      placeholder: editColumn?.placeholder || '',
      help_text: editColumn?.help_text || '',
      status: editColumn?.status || 'active',
      order_index: editColumn?.order_index || 0,
      default_value: editColumn?.default_value || '',
    }
  });
  
  const { t } = useLanguage();

  // Handle type change
  const handleTypeChange = (type: ColumnType) => {
    setSelectedType(type as ColumnType);
    form.setValue('type', type);
    
    // Reset options if not a type that supports options
    if (!['select', 'radio', 'checkbox'].includes(type)) {
      setOptions([]);
    }
  };

  // Add option
  const addOption = () => {
    if (!newOption.trim()) return;
    
    // Check if label already exists
    const exists = options.some(opt => opt.label.toLowerCase() === newOption.toLowerCase());
    if (exists) return;
    
    const newOpt: ColumnOption = {
      id: `option_${Date.now()}`, // Unikal ID əlavə edirik
      label: newOption.trim(),
      value: newOption.trim().toLowerCase().replace(/\s+/g, '_')
    };
    
    setOptions(prev => [...prev, newOpt]);
    setNewOption('');
  };
  
  // Remove option
  const removeOption = (index: number) => {
    setOptions(prev => prev.filter((_, i) => i !== index));
  };
  
  // Handle form submission
  const onSubmit = async (values: ColumnFormValues) => {
    // Combine form values with options
    const columnData = {
      ...values,
      options: options.length > 0 ? options : undefined,
    };
    
    if (isEditMode && editColumn?.id) {
      columnData.id = editColumn.id;
    }
    
    try {
      const result = await onSaveColumn(columnData);
      return result;
    } catch (error) {
      console.error('Error saving column:', error);
      return false;
    }
  };
  
  // Convert string date to Date object for date inputs
  const convertToDate = (dateString: string | Date): Date => {
    if (dateString instanceof Date) {
      return dateString;
    }
    return new Date(dateString);
  };
  
  return {
    form,
    selectedType,
    handleTypeChange,
    options,
    addOption,
    removeOption,
    newOption,
    setNewOption,
    onSubmit,
    isEditMode,
    convertToDate
  };
};

export default useColumnForm;
