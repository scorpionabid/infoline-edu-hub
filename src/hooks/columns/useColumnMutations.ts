
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { Column } from '@/types/column';
import { adaptColumnToSupabase } from './useColumnAdapters';
import { updateCategoryColumnCount } from './useColumnCounter';

export const useColumnMutations = () => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  // Add column mutation
  const addColumnMutation = useMutation({
    mutationFn: async (column: Omit<Column, "id">) => {
      const supabaseColumn = adaptColumnToSupabase(column as Partial<Column>);
      
      // JSON tipləri üçün uyğunlaşma
      const sanitizedData = {
        ...supabaseColumn,
        options: supabaseColumn.options ? JSON.parse(JSON.stringify(supabaseColumn.options)) : null,
        validation: supabaseColumn.validation ? JSON.parse(JSON.stringify(supabaseColumn.validation)) : null
      };
      
      const { data, error } = await supabase
        .from('columns')
        .insert([sanitizedData])
        .select()
        .single();

      if (error) throw error;
      
      // Kateqoriya sütun sayını yenilə
      if (column.category_id) {
        await updateCategoryColumnCount(column.category_id);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      toast.success(t('columnAdded'), {
        description: t('columnAddedSuccessfully')
      });
    },
    onError: (error) => {
      console.error('Error adding column:', error);
      toast.error(t('errorOccurred'), {
        description: t('couldNotAddColumn')
      });
    }
  });

  // Update column mutation
  const updateColumnMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<Column> }) => {
      const supabaseUpdates = adaptColumnToSupabase(updates);
      
      // JSON tipləri üçün uyğunlaşma
      const sanitizedUpdates = {
        ...supabaseUpdates,
        options: supabaseUpdates.options ? JSON.parse(JSON.stringify(supabaseUpdates.options)) : null,
        validation: supabaseUpdates.validation ? JSON.parse(JSON.stringify(supabaseUpdates.validation)) : null
      };
      
      const { data, error } = await supabase
        .from('columns')
        .update(sanitizedUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      toast.success(t('columnUpdated'), {
        description: t('columnUpdatedSuccessfully')
      });
    },
    onError: (error) => {
      console.error('Error updating column:', error);
      toast.error(t('errorOccurred'), {
        description: t('couldNotUpdateColumn')
      });
    }
  });

  // Delete column mutation
  const deleteColumnMutation = useMutation({
    mutationFn: async ({ id, categoryId }: { id: string, categoryId?: string }) => {
      const { error } = await supabase
        .from('columns')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Kateqoriya sütun sayını yenilə
      if (categoryId) {
        await updateCategoryColumnCount(categoryId);
      }
      
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      toast.success(t('columnDeleted'), {
        description: t('columnDeletedSuccessfully')
      });
    },
    onError: (error) => {
      console.error('Error deleting column:', error);
      toast.error(t('errorOccurred'), {
        description: t('couldNotDeleteColumn')
      });
    }
  });

  // API-i sadələşdirmək üçün funksiyalar
  const addColumn = async (column: Omit<Column, "id">) => {
    return addColumnMutation.mutateAsync(column);
  };

  const updateColumn = async (id: string, updates: Partial<Column>) => {
    return updateColumnMutation.mutateAsync({ id, updates });
  };

  const deleteColumn = async (id: string) => {
    // Əvvəlcə silinən sütunun kategoriya ID-sini alaq
    const queryClient = useQueryClient();
    const columns = queryClient.getQueryData<Column[]>(['columns']) || [];
    const column = columns.find(c => c.id === id);
    const categoryId = column?.category_id;
    
    return deleteColumnMutation.mutateAsync({ id, categoryId });
  };

  return {
    addColumn,
    updateColumn,
    deleteColumn,
    addColumnMutation,
    updateColumnMutation,
    deleteColumnMutation
  };
};
