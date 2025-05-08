
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Column, ColumnFormValues, ColumnType, columnTypes } from '@/types/column';
import { toast } from 'sonner';

// Formun defolt dəyərləri
const defaultValues: ColumnFormValues = {
  name: '',
  type: 'text',
  is_required: false,
  status: 'active',
};

// Schema validasiyası üçün
const formSchema = z.object({
  name: z.string().min(2, 'Ad ən azı 2 simvol olmalıdır'),
  type: z.string(),
  category_id: z.string().optional(),
  is_required: z.boolean(),
  order_index: z.number().optional(),
  help_text: z.string().optional(),
  placeholder: z.string().optional(),
  default_value: z.union([z.string(), z.number(), z.boolean()]).optional(),
  status: z.enum(['active', 'inactive', 'draft']),
  description: z.string().optional(),
});

interface UseColumnFormProps {
  column?: Column | null;
  categoryId?: string;
  onSuccess?: (data: Column) => void;
  onSave?: (data: ColumnFormValues) => Promise<Column>;
}

export const useColumnForm = ({
  column,
  categoryId,
  onSuccess,
  onSave,
}: UseColumnFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOptionsMode, setIsOptionsMode] = useState(
    column?.type === 'select' || column?.type === 'radio' || column?.type === 'checkbox'
  );

  // Form yaratma
  const form = useForm<ColumnFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: column
      ? {
          name: column.name,
          type: column.type as ColumnType,
          category_id: column.category_id,
          is_required: column.is_required || false,
          order_index: column.order_index || 0,
          help_text: column.help_text,
          placeholder: column.placeholder,
          default_value: column.default_value,
          status: (column.status as 'active' | 'inactive' | 'draft') || 'active',
          description: column.description,
        }
      : {
          ...defaultValues,
          category_id: categoryId,
        },
  });

  // Tip dəyişdikdə təsdiqlənmə qaydalarını yeniləmək
  const updateValidationByType = (type: string) => {
    const validation = form.getValues('validation') || {};

    switch (type) {
      case 'number':
        validation.min = validation.min !== undefined ? Number(validation.min) : undefined;
        validation.max = validation.max !== undefined ? Number(validation.max) : undefined;
        validation.minValue = validation.minValue !== undefined ? Number(validation.minValue) : undefined;
        validation.maxValue = validation.maxValue !== undefined ? Number(validation.maxValue) : undefined;
        break;
      case 'text':
      case 'textarea':
        validation.minLength = validation.minLength !== undefined ? Number(validation.minLength) : undefined;
        validation.maxLength = validation.maxLength !== undefined ? Number(validation.maxLength) : undefined;
        break;
      case 'phone':
        validation.tel = true;
        break;
      case 'date':
        validation.minDate = validation.minDate || undefined;
        validation.maxDate = validation.maxDate || undefined;
        break;
      case 'email':
        validation.email = true;
        break;
      case 'url':
        validation.url = true;
        break;
    }

    form.setValue('validation', validation);
  };

  // Tip dəyişdikdə optionsMode ayarla
  const onTypeChange = (type: string) => {
    const isOption = type === 'select' || type === 'radio' || type === 'checkbox';
    setIsOptionsMode(isOption);
    
    // Təsdiqlənmə qaydalarını yenilə
    updateValidationByType(type);

    // Əgər options tipinə keçirsə və options mövcud deyilsə, 
    // varsayılan bir option əlavə et
    if (isOption && (!form.getValues('options') || form.getValues('options')?.length === 0)) {
      form.setValue('options', [
        {
          id: crypto.randomUUID(),
          label: 'Option 1',
          value: 'option_1',
        },
      ]);
    }
  };

  // Form təqdim edildikdə
  const onSubmit = async (values: ColumnFormValues) => {
    try {
      setIsLoading(true);
      
      // Toxunduğumuzdan əmin olmaq üçün dəyərlərdən kopiya yaradaq
      const submissionValues = { ...values };

      // Select, radio və checkbox tipləri üçün options obyektlərini təmin edin
      if (isOptionsMode && (!submissionValues.options || submissionValues.options.length === 0)) {
        toast.error('Ən azı bir seçim əlavə edilməlidir');
        setIsLoading(false);
        return;
      }

      // Validation obyekti üçün təsdiqləmə
      if (submissionValues.validation) {
        Object.entries(submissionValues.validation).forEach(([key, value]) => {
          if (value === '' || value === undefined) {
            delete submissionValues.validation![key as keyof typeof submissionValues.validation];
          }
        });
      }

      // Əgər onSave təmin edilmişdirsə, onu çağırın
      if (onSave) {
        const result = await onSave(submissionValues);
        if (result && onSuccess) {
          onSuccess(result);
        }
      }

      toast.success(column ? 'Sütun yeniləndi' : 'Sütun yaradıldı');
    } catch (error) {
      console.error('Form təqdim edilərkən xəta:', error);
      toast.error('Sütun saxlanılarkən xəta baş verdi');
    } finally {
      setIsLoading(false);
    }
  };

  // Tip dəyişdikdə onTypeChange çağırın
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'type') {
        onTypeChange(value.type as string);
      }
    });

    return () => subscription.unsubscribe();
  }, [form.watch]);

  return {
    form,
    isLoading,
    isOptionsMode,
    onSubmit: form.handleSubmit(onSubmit),
    onTypeChange,
  };
};

export default useColumnForm;
