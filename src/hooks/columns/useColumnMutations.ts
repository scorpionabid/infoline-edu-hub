
import { useState } from 'react';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabase';
import { Column } from '@/types/column';
import { useQueryClient } from '@tanstack/react-query';

export const useColumnMutations = () => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const createColumn = async (columnData: Omit<Column, 'id'>): Promise<{ success: boolean; data?: Column; error?: string }> => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('columns')
        .insert(columnData)
        .select()
        .single();

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['columns'] });
      toast.success(t('columnCreated'));

      return { success: true, data };
    } catch (error: any) {
      console.error('Error creating column:', error);
      toast.error(t('errorCreatingColumn'));
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateColumn = async (columnData: Partial<Column>): Promise<{ success: boolean; data?: Column; error?: string }> => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('columns')
        .update(columnData)
        .eq('id', columnData.id)
        .select()
        .single();

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['columns'] });
      toast.success(t('columnUpdated'));

      return { success: true, data };
    } catch (error: any) {
      console.error('Error updating column:', error);
      toast.error(t('errorUpdatingColumn'));
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteColumn = async (columnId: string, categoryId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('columns')
        .delete()
        .eq('id', columnId);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['columns'] });
      toast.success(t('columnDeleted'));

      return { success: true };
    } catch (error: any) {
      console.error('Error deleting column:', error);
      toast.error(t('errorDeletingColumn'));
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createColumn,
    updateColumn,
    deleteColumn,
    isLoading
  };
};
