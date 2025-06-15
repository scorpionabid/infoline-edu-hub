
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Column, ColumnFormData, UseColumnFormProps } from '@/types/column';
import { toast } from 'sonner';

export const useColumnForm = ({ column, categoryId, onSuccess }: UseColumnFormProps) => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialData: ColumnFormData = {
    name: column?.name || '',
    type: column?.type || 'text',
    category_id: column?.category_id || categoryId,
    is_required: column?.is_required || false,
    placeholder: column?.placeholder || '',
    help_text: column?.help_text || '',
    description: column?.description || '',
    default_value: column?.default_value || '',
    options: column?.options || [],
    validation: column?.validation || null,
    order_index: column?.order_index || 0,
    status: column?.status || 'active'
  };

  const createMutation = useMutation({
    mutationFn: async (data: ColumnFormData) => {
      const { data: result, error } = await supabase
        .from('columns')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      queryClient.invalidateQueries({ queryKey: ['category-columns'] });
      toast.success('Sütun uğurla yaradıldı');
      onSuccess();
    },
    onError: (error) => {
      console.error('Error creating column:', error);
      toast.error('Sütun yaradılarkən xəta baş verdi');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ColumnFormData) => {
      if (!column?.id) throw new Error('Column ID is required for update');

      const { data: result, error } = await supabase
        .from('columns')
        .update(data)
        .eq('id', column.id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      queryClient.invalidateQueries({ queryKey: ['category-columns'] });
      toast.success('Sütun uğurla yeniləndi');
      onSuccess();
    },
    onError: (error) => {
      console.error('Error updating column:', error);
      toast.error('Sütun yenilənərkən xəta baş verdi');
    }
  });

  const handleSubmit = async (formData: ColumnFormData) => {
    setIsSubmitting(true);
    try {
      if (column?.id) {
        await updateMutation.mutateAsync(formData);
      } else {
        await createMutation.mutateAsync(formData);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    initialData,
    handleSubmit,
    isSubmitting: isSubmitting || createMutation.isPending || updateMutation.isPending,
    isLoading: createMutation.isPending || updateMutation.isPending
  };
};
