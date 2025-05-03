import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Column, ColumnOption, ColumnType, ColumnValidation, COLUMN_TYPE_DEFINITIONS } from '@/types/column';
import { useLanguage } from '@/context/LanguageContext';
import { v4 as uuidv4 } from 'uuid';

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
  selectedType: ColumnType;
  handleTypeChange: (type: string) => void;
  options: ColumnOption[];
  addOption: () => void;
  removeOption: (index: number) => void;
  newOption: { label: string; value: string; color: string };
  setNewOption: React.Dispatch<React.SetStateAction<{ label: string; value: string; color: string }>>;
  onSubmit: (values: ColumnFormValues) => Promise<boolean>;
  isEditMode: boolean;
}

export const useColumnForm = (
  categories: any[],
  editColumn?: Column | null,
  onAddColumn?: (newColumn: Omit<Column, "id">) => Promise<boolean>
): UseColumnFormReturn => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<ColumnType>(editColumn?.type || 'text');
  
  // options sahəsini işləyək
  const [options, setOptions] = useState<ColumnOption[]>(() => {
    if (!editColumn?.options) return [];
    
    // Əgər options stringdirsə, parse edək
    if (typeof editColumn.options === 'string') {
      try {
        const parsedOptions = JSON.parse(editColumn.options);
        return Array.isArray(parsedOptions) ? parsedOptions.map(opt => ({
          id: opt.id || uuidv4(),
          label: opt.label || '',
          value: opt.value || opt.label || '',
          color: opt.color || '#000000'
        })) : [];
      } catch (e) {
        console.error('Options parsing error:', e);
        return [];
      }
    }
    
    // Əgər options artıq array formatındadırsa
    if (Array.isArray(editColumn.options)) {
      return editColumn.options.map(opt => ({
        id: typeof opt === 'object' ? (opt.id || uuidv4()) : uuidv4(),
        label: typeof opt === 'object' ? (opt.label || '') : String(opt),
        value: typeof opt === 'object' ? (opt.value || opt.label || '') : String(opt),
        color: typeof opt === 'object' ? (opt.color || '#000000') : '#000000'
      }));
    }
    
    return [];
  });
  
  const [newOption, setNewOption] = useState({ label: '', value: '', color: '#000000' });
  const isEditMode = !!editColumn;
  
  // Default Zod schema for column form
  const columnFormSchema = z.object({
    name: z.string().min(1, { message: t('nameRequired') }),
    type: z.string() as z.ZodType<ColumnType>,
    description: z.string().optional(),
    is_required: z.boolean().default(false),
    order_index: z.number().default(0),
    options: z.array(
      z.object({
        id: z.string().optional(),
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
    defaultValues: editColumn ? {
      name: editColumn.name || '',
      type: editColumn.type || 'text',
      description: editColumn.description || '',
      is_required: editColumn.is_required || false,
      order_index: editColumn.order_index || 0,
      options: options,
      placeholder: editColumn.placeholder || '',
      help_text: editColumn.help_text || '',
      parent_column_id: editColumn.parent_column_id || undefined,
      default_value: editColumn.default_value || '',
      dependencies: editColumn.dependencies || [],
      visibility_conditions: editColumn.visibility_conditions || undefined,
      validation: typeof editColumn.validation === 'string' ?
        JSON.parse(editColumn.validation || '{}') :
        editColumn.validation || {}
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
  
  // Type dəyişdikdə formu yeniləyirik
  useEffect(() => {
    form.setValue('type', selectedType);
  }, [selectedType, form]);
  
  // Form dəyərləri əsasında Column obyekti yaratmaq üçün köməkçi funksiyalar
  const convertOptionsToColumn = (options: ColumnOption[]) => {
    // Boş options massivini undefined et
    if (!options.length) return [];
    
    // Əgər value hissəsi mövcud deyilsə, label-i value kimi istifadə et
    return options.map(opt => ({
      ...opt,
      id: opt.id || uuidv4(),
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
    
    return result;
  };
  
  const handleTypeChange = (type: string) => {
    setSelectedType(type as ColumnType);
    form.setValue('type', type as ColumnType);
  };
  
  // Options işləmə funksiyaları
  const addOption = () => {
    if (!newOption.label.trim()) return;
    
    const option = {
      id: uuidv4(),
      label: newOption.label,
      value: newOption.value || newOption.label,
      color: newOption.color
    };
    
    setOptions([...options, option]);
    form.setValue('options', [...options, option]);
    setNewOption({ label: '', value: '', color: '#000000' });
  };
  
  const removeOption = (index: number) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
    form.setValue('options', newOptions);
  };
  
  // Form təqdim etmə funksiyası
  const onSubmit = async (values: ColumnFormValues) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Validate options
      if (['select', 'checkbox', 'radio'].includes(selectedType) && options.length === 0) {
        setError('Bu tip üçün ən azı bir seçim əlavə edilməlidir');
        return false;
      }
      
      // Prepare column data
      const columnData: Partial<Column> = {
        ...values,
        type: selectedType,
        options: convertOptionsToColumn(options),
        validation: convertValidationToColumn(values.validation, selectedType),
      };
      
      // Add column
      if (onAddColumn) {
        const success = await onAddColumn(columnData as Omit<Column, "id">);
        return success;
      }
      
      return true;
    } catch (error: any) {
      setError(error.message || 'Sütun əlavə edilərkən xəta baş verdi');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Sütunu yadda saxlama
  const saveColumn = async (values: ColumnFormValues): Promise<Column> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const columnData: Partial<Column> = {
        id: editColumn?.id,
        category_id: values.parent_column_id || editColumn?.category_id,
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
      
      // Mock response - real API integration xaric
      const savedColumn: Column = {
        id: editColumn?.id || 'new-column-' + Date.now(),
        category_id: columnData.category_id || '',
        name: values.name,
        type: values.type,
        description: values.description,
        is_required: values.is_required,
        order_index: values.order_index,
        status: editColumn?.status || 'active',
        // String'dən Date'ə çevrilmə problemini aradan qaldıraq
        created_at: editColumn?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        options: convertOptionsToColumn(values.options),
        validation: convertValidationToColumn(values.validation, values.type),
        placeholder: values.placeholder,
        help_text: values.help_text,
        default_value: values.default_value
      };
      
      return savedColumn;
    } catch (err: any) {
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
    },
    selectedType,
    handleTypeChange,
    options,
    addOption,
    removeOption,
    newOption,
    setNewOption,
    onSubmit,
    isEditMode
  };
};
