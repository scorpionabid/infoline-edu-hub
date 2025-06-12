
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ColumnFormValues, Column, UseColumnFormProps } from '@/types/column';
import { useColumnMutations } from './mutations/useColumnMutations';

const columnFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.string().min(1, 'Type is required'),
  category_id: z.string().min(1, 'Category is required'),
  placeholder: z.string().optional(),
  help_text: z.string().optional(),
  is_required: z.boolean().default(true),
  default_value: z.string().optional(),
  options: z.any().optional(),
  validation: z.any().optional(),
  order_index: z.number().default(0),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const useColumnForm = ({ column, categoryId, onSuccess }: UseColumnFormProps) => {
  const { createColumnAsync, updateColumnAsync, isCreating, isUpdating } = useColumnMutations();
  
  const form = useForm<ColumnFormValues>({
    resolver: zodResolver(columnFormSchema),
    defaultValues: {
      name: column?.name || '',
      type: column?.type || 'text',
      category_id: categoryId,
      placeholder: column?.placeholder || '',
      help_text: column?.help_text || '',
      is_required: column?.is_required ?? true,
      default_value: column?.default_value || '',
      options: column?.options || [],
      validation: column?.validation || {},
      order_index: column?.order_index || 0,
      status: column?.status || 'active',
    },
  });

  const isLoading = isCreating || isUpdating;

  const onSubmit = async (data: ColumnFormValues) => {
    try {
      if (column) {
        await updateColumnAsync({ columnId: column.id, data });
        toast.success('Column updated successfully');
      } else {
        await createColumnAsync({ categoryId, data });
        toast.success('Column created successfully');
      }
      onSuccess();
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Failed to save column');
    }
  };

  return {
    form,
    isLoading,
    onSubmit: form.handleSubmit(onSubmit),
  };
};
