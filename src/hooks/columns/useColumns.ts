
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Column } from '@/types/column';
import { toast } from 'sonner';

export interface ColumnFormData {
  name: string;
  type: string;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  validation?: any;
  options?: any;
  default_value?: string;
}

export const useColumns = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createColumn = async (categoryId: string, columnData: ColumnFormData) => {
    try {
      setLoading(true);
      setError(null);

      // Get the highest order_index for this category
      const { data: existingColumns, error: fetchError } = await supabase
        .from('columns')
        .select('order_index')
        .eq('category_id', categoryId)
        .order('order_index', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      const orderIndex = existingColumns && existingColumns.length > 0 
        ? (existingColumns[0].order_index || 0) + 1 
        : 0;

      const { data, error } = await supabase
        .from('columns')
        .insert([{
          ...columnData,
          category_id: categoryId,
          status: 'active',
          order_index: orderIndex
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Column created successfully');
      return data;
    } catch (err: any) {
      console.error('Error creating column:', err);
      setError(err.message || 'Error creating column');
      toast.error(err.message || 'Error creating column');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateColumn = async (columnId: string, columnData: Partial<Column>) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('columns')
        .update(columnData)
        .eq('id', columnId)
        .select()
        .single();

      if (error) throw error;

      toast.success('Column updated successfully');
      return data;
    } catch (err: any) {
      console.error('Error updating column:', err);
      setError(err.message || 'Error updating column');
      toast.error(err.message || 'Error updating column');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteColumn = async (columnId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('columns')
        .delete()
        .eq('id', columnId);

      if (error) throw error;

      toast.success('Column deleted successfully');
      return true;
    } catch (err: any) {
      console.error('Error deleting column:', err);
      setError(err.message || 'Error deleting column');
      toast.error(err.message || 'Error deleting column');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    createColumn,
    updateColumn,
    deleteColumn,
    loading,
    error
  };
};
