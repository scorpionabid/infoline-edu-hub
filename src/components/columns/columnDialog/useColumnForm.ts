
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Column, ColumnFormValues } from '@/types/column';
import { useLanguage } from '@/context/LanguageContext';

// Column form validation schema
const createColumnFormSchema = (t: (key: string) => string) => {
  return z.object({
    name: z.string().min(1, t('nameRequired')),
    type: z.enum([
      'text', 'number', 'date', 'time', 'phone', 'color', 'checkbox',
      'radio', 'select', 'textarea', 'image', 'file', 'password', 'range',
      'datetime', 'richtext'
    ]),
    is_required: z.boolean().default(false),
    placeholder: z.string().optional(),
    help_text: z.string().optional(),
    status: z.enum(['active', 'inactive']),
    order_index: z.number().optional(),
    default_value: z.string().optional(),
    options: z.array(
      z.object({
        value: z.string(),
        label: z.string(),
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

export const useColumnForm = (column?: Column) => {
  const { t } = useLanguage();
  const schema = createColumnFormSchema(t);
  
  // Default values for form initialization
  const defaultValues: ColumnFormValues = {
    name: column?.name || '',
    type: column?.type || 'text',
    is_required: column?.is_required === undefined ? true : column?.is_required,
    placeholder: column?.placeholder || '',
    help_text: column?.help_text || '',
    status: column?.status || 'active',
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
    } else if (!form.getValues('options')?.length) {
      // Add default empty option if switching to a type that uses options
      form.setValue('options', [{ value: '', label: '' }]);
    }
  };
  
  return {
    form,
    watchType,
    showOptions,
    handleTypeChange
  };
};
