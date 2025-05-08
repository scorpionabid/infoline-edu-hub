
import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Column, ColumnFormValues, ColumnOption, ColumnType } from '@/types/column';
import { useLanguage } from '@/context/LanguageContext';

// Column form validation schema
const createColumnFormSchema = (t: (key: string) => string) => {
  return z.object({
    name: z.string().min(1, t('nameRequired')),
    type: z.enum([
      'text', 'number', 'date', 'time', 'phone', 'color', 'checkbox',
      'radio', 'select', 'textarea', 'image', 'file', 'password', 'range',
      'datetime', 'richtext', 'email', 'url'
    ]),
    is_required: z.boolean().default(false),
    placeholder: z.string().optional(),
    help_text: z.string().optional(),
    status: z.enum(['active', 'inactive', 'draft']),
    order_index: z.number().optional(),
    default_value: z.string().optional(),
    options: z.array(
      z.object({
        value: z.string(),
        label: z.string(),
        id: z.string().optional(),
        color: z.string().optional(),
      })
    ).optional(),
    validation: z.object({
      min: z.string().optional(),
      max: z.string().optional(),
      minLength: z.string().optional(),
      maxLength: z.string().optional(),
      pattern: z.string().optional(),
      email: z.boolean().optional(),
      url: z.boolean().optional(),
      tel: z.boolean().optional(),
      minDate: z.string().optional(),
      maxDate: z.string().optional(),
    }).optional(),
  });
};

export const useColumnForm = (
  categories: { id: string; name: string }[],
  column?: Column | null,
  onSaveColumn?: (columnData: Omit<Column, "id"> & { id?: string }) => Promise<boolean>
) => {
  const { t } = useLanguage();
  const schema = createColumnFormSchema(t);
  const isEditMode = !!column;
  
  // Default values for form initialization
  const defaultValues: ColumnFormValues = {
    name: column?.name || '',
    type: column?.type || 'text',
    is_required: column?.is_required === undefined ? true : column?.is_required,
    placeholder: column?.placeholder || '',
    help_text: column?.help_text || '',
    status: (column?.status as 'active' | 'inactive' | 'draft') || 'active',
    order_index: column?.order_index || 0,
    default_value: column?.default_value || '',
    options: column?.options || [],
    validation: {
      min: column?.validation?.min?.toString() || '',
      max: column?.validation?.max?.toString() || '',
      minLength: column?.validation?.minLength?.toString() || '',
      maxLength: column?.validation?.maxLength?.toString() || '',
      pattern: column?.validation?.pattern || '',
      email: column?.validation?.email || false,
      url: column?.validation?.url || false,
      tel: column?.validation?.tel || false,
      minDate: column?.validation?.minDate || '',
      maxDate: column?.validation?.maxDate || '',
    }
  };

  // Form settings using react-hook-form
  const form = useForm<ColumnFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange'
  });
  
  // Get current selected column type
  const watchType = form.watch('type');
  const selectedType = watchType;
  
  // Options state
  const [options, setOptions] = useState<ColumnOption[]>(column?.options || []);
  const [newOption, setNewOption] = useState<ColumnOption>({ value: '', label: '' });
  
  // Handle form type changes
  const [showOptions, setShowOptions] = useState(
    watchType === 'select' || watchType === 'radio'
  );
  
  // Update option visibility when changing column type
  const handleTypeChange = (type: string) => {
    form.setValue('type', type as ColumnFormValues['type']); 
    setShowOptions(type === 'select' || type === 'radio');
    
    // Clear options if switching away from type that uses them
    if (type !== 'select' && type !== 'radio') {
      form.setValue('options', []);
      setOptions([]);
    } else if (!form.getValues('options')?.length) {
      // Add default empty option if switching to a type that uses options
      const defaultOption = { value: '', label: '' };
      form.setValue('options', [defaultOption]);
      setOptions([defaultOption]);
    }
  };
  
  // Option management
  const addOption = useCallback(() => {
    if (!newOption.label || !newOption.value) return;
    
    const updatedOptions = [...options, { ...newOption }];
    setOptions(updatedOptions);
    form.setValue('options', updatedOptions);
    setNewOption({ value: '', label: '' });
  }, [newOption, options, form]);
  
  const removeOption = useCallback((index: number) => {
    const updatedOptions = [...options];
    updatedOptions.splice(index, 1);
    setOptions(updatedOptions);
    form.setValue('options', updatedOptions);
  }, [options, form]);
  
  // Form submission
  const onSubmit = useCallback(async (values: ColumnFormValues) => {
    if (!onSaveColumn) return false;
    
    try {
      // Prepare column data from form values
      const columnData: Omit<Column, "id"> & { id?: string } = {
        id: column?.id,
        name: values.name,
        type: values.type,
        is_required: values.is_required,
        placeholder: values.placeholder,
        help_text: values.help_text,
        status: values.status as 'active' | 'inactive' | 'draft',
        order_index: values.order_index,
        default_value: values.default_value,
        options: options.length > 0 ? options : undefined,
        validation: {
          min: values.validation.min ? Number(values.validation.min) : undefined,
          max: values.validation.max ? Number(values.validation.max) : undefined,
          minLength: values.validation.minLength ? Number(values.validation.minLength) : undefined,
          maxLength: values.validation.maxLength ? Number(values.validation.maxLength) : undefined,
          pattern: values.validation.pattern || undefined,
          email: values.validation.email,
          url: values.validation.url,
          tel: values.validation.tel,
          required: values.is_required, // Added required field
          minDate: values.validation.minDate || undefined,
          maxDate: values.validation.maxDate || undefined,
        },
        category_id: column?.category_id || categories[0]?.id,
        created_at: column?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const success = await onSaveColumn(columnData);
      return success;
    } catch (error) {
      console.error('Column form submission error:', error);
      return false;
    }
  }, [column, options, onSaveColumn, categories]);
  
  return {
    form,
    watchType,
    selectedType,
    showOptions,
    options,
    newOption,
    setNewOption,
    addOption,
    removeOption,
    handleTypeChange,
    onSubmit,
    isEditMode
  };
};
