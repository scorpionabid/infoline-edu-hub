
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Column, ColumnOption, ColumnType, ColumnValidation, COLUMN_TYPE_DEFINITIONS } from '@/types/column';
import { useLanguage } from '@/context/LanguageContext';

// Tip üçün seçimlər
const columnTypeOptions = Object.entries(COLUMN_TYPE_DEFINITIONS).map(([value, def]) => ({
  value: value as ColumnType,
  label: def.label,
  icon: def.icon,
  description: def.description
}));

// Form dəyərləri üçün tip müəyyənləşdirməsi
export interface ColumnFormValues {
  name: string;
  type: ColumnType;
  description?: string;
  is_required: boolean;
  order_index: number;
  options: ColumnOption[];
  placeholder?: string;
  help_text?: string;
  parent_column_id?: string;
  default_value?: string;
  dependencies?: string[];
  visibility_conditions?: any;
  validation: {
    minValue?: string;
    maxValue?: string;
    minLength?: string;
    maxLength?: string;
    pattern?: string;
  };
}

// useColumnForm hook'unun dönüş tipi
export interface UseColumnFormReturn {
  form: ReturnType<typeof useForm<ColumnFormValues>>;
  isLoading: boolean;
  error: string | null;
  columnTypeOptions: { value: ColumnType; label: string; icon: string; description: string }[];
  saveColumn: (values: ColumnFormValues) => Promise<Column>;
  helpers: {
    convertOptionsToColumn: (options: ColumnOption[]) => any;
    convertValidationToColumn: (validation: ColumnFormValues['validation'], type: ColumnType) => ColumnValidation[];
  };
}

export const useColumnForm = (
  initialColumn?: Column,
  categoryId?: string,
  onSaved?: (column: Column) => void
): UseColumnFormReturn => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Default Zod schema for column form
  const columnFormSchema = z.object({
    name: z.string().min(1, { message: t('nameRequired') }),
    type: z.string() as z.ZodType<ColumnType>,
    description: z.string().optional(),
    is_required: z.boolean().default(false),
    order_index: z.number().default(0),
    options: z.array(
      z.object({
        value: z.string().optional(),
        label: z.string(),
        color: z.string().optional(),
        disabled: z.boolean().optional()
      })
    ).default([]),
    placeholder: z.string().optional(),
    help_text: z.string().optional(),
    parent_column_id: z.string().optional().nullable(),
    default_value: z.string().optional(),
    dependencies: z.array(z.string()).optional().nullable(),
    visibility_conditions: z.any().optional().nullable(),
    validation: z.object({
      minValue: z.string().optional(),
      maxValue: z.string().optional(),
      minLength: z.string().optional(),
      maxLength: z.string().optional(),
      pattern: z.string().optional(),
    }).default({})
  });
  
  // Form
  const form = useForm<ColumnFormValues>({
    resolver: zodResolver(columnFormSchema),
    defaultValues: initialColumn ? {
      name: initialColumn.name,
      type: initialColumn.type,
      description: initialColumn.description,
      is_required: initialColumn.is_required,
      order_index: initialColumn.order_index,
      options: Array.isArray(initialColumn.options) ? 
        initialColumn.options.map(opt => typeof opt === 'string' ? { value: opt, label: opt } : opt as ColumnOption) : 
        [],
      placeholder: initialColumn.placeholder || '',
      help_text: initialColumn.help_text || '',
      parent_column_id: initialColumn.parent_column_id || undefined,
      default_value: initialColumn.default_value || '',
      dependencies: initialColumn.dependencies || [],
      visibility_conditions: initialColumn.visibility_conditions || undefined,
      validation: initialColumn.validation ? 
        initialColumn.validation.reduce((acc, v) => {
          if (v.type === 'min') acc.minValue = String(v.value);
          else if (v.type === 'max') acc.maxValue = String(v.value);
          else if (v.type === 'minLength') acc.minLength = String(v.value);
          else if (v.type === 'maxLength') acc.maxLength = String(v.value);
          else if (v.type === 'pattern') acc.pattern = String(v.value);
          return acc;
        }, {} as ColumnFormValues['validation']) : 
        {}
    } : {
      name: '',
      type: 'text',
      description: '',
      is_required: true,
      order_index: 0,
      options: [],
      placeholder: '',
      help_text: '',
      validation: {}
    }
  });
  
  // Form dəyərləri əsasında Column obyekti yaratmaq üçün köməkçi funksiyalar
  const convertOptionsToColumn = (options: ColumnOption[]) => {
    // Boş options massivini undefined et
    if (!options.length) return undefined;
    
    // Əgər value hissəsi mövcud deyilsə, label-i value kimi istifadə et
    return options.map(opt => ({
      ...opt,
      value: opt.value || opt.label
    }));
  };
  
  const convertValidationToColumn = (
    validation: ColumnFormValues['validation'], 
    type: ColumnType
  ): ColumnValidation[] => {
    const result: ColumnValidation[] = [];
    
    if (type === 'number') {
      if (validation.minValue) {
        result.push({
          type: 'min',
          value: Number(validation.minValue),
          message: `Minimum dəyər ${validation.minValue} olmalıdır`
        });
      }
      
      if (validation.maxValue) {
        result.push({
          type: 'max',
          value: Number(validation.maxValue),
          message: `Maksimum dəyər ${validation.maxValue} olmalıdır`
        });
      }
    }
    
    if (type === 'text' || type === 'textarea' || type === 'email' || type === 'url') {
      if (validation.minLength) {
        result.push({
          type: 'minLength',
          value: Number(validation.minLength),
          message: `Minimum ${validation.minLength} simvol olmalıdır`
        });
      }
      
      if (validation.maxLength) {
        result.push({
          type: 'maxLength',
          value: Number(validation.maxLength),
          message: `Maksimum ${validation.maxLength} simvol olmalıdır`
        });
      }
    }
    
    if (validation.pattern) {
      result.push({
        type: 'pattern',
        value: validation.pattern,
        message: `Düzgün format daxil edin`
      });
    }
    
    return result.length ? result : undefined;
  };
  
  // Sütunu yadda saxlama
  const saveColumn = async (values: ColumnFormValues): Promise<Column> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const columnData: Partial<Column> = {
        id: initialColumn?.id,
        category_id: categoryId || initialColumn?.category_id,
        name: values.name,
        type: values.type,
        description: values.description,
        is_required: values.is_required,
        order_index: values.order_index,
        options: convertOptionsToColumn(values.options),
        validation: convertValidationToColumn(values.validation, values.type),
        placeholder: values.placeholder,
        help_text: values.help_text,
        default_value: values.default_value,
        parent_column_id: values.parent_column_id,
        dependencies: values.dependencies,
        visibility_conditions: values.visibility_conditions
      };
      
      // TODO: API ilə bağlantı qurmaq
      /*
      const savedColumn = initialColumn?.id
        ? await updateColumn(columnData)
        : await createColumn(columnData);
      */
      
      // Mock response - real API integration xaric
      const savedColumn: Column = {
        id: initialColumn?.id || 'new-column-' + Date.now(),
        category_id: categoryId || initialColumn?.category_id || '',
        name: values.name,
        type: values.type,
        description: values.description,
        is_required: values.is_required,
        order_index: values.order_index,
        status: initialColumn?.status || 'active',
        created_at: initialColumn?.created_at || new Date(),
        updated_at: new Date(),
        options: convertOptionsToColumn(values.options),
        validation: convertValidationToColumn(values.validation, values.type),
        placeholder: values.placeholder,
        help_text: values.help_text,
        default_value: values.default_value,
        parent_column_id: values.parent_column_id,
        dependencies: values.dependencies,
        visibility_conditions: values.visibility_conditions
      };
      
      if (onSaved) onSaved(savedColumn);
      
      return savedColumn;
    } catch (err) {
      setError(err.message || 'Sütun saxlanılarkən xəta baş verdi');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    form,
    isLoading,
    error,
    columnTypeOptions,
    saveColumn,
    helpers: {
      convertOptionsToColumn,
      convertValidationToColumn,
    }
  };
};
