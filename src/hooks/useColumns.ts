
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { Column, adaptSupabaseColumn, adaptColumnToSupabase } from '@/types/column';

export const useColumns = (categoryId?: string) => {
  const [columns, setColumns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { t } = useLanguage();

  const fetchColumns = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('columns')
        .select('*')
        .order('order_index');
      
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      setColumns(data || []);
    } catch (err: any) {
      console.error('Error fetching columns:', err);
      setError(err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotLoadColumns')
      });
    } finally {
      setLoading(false);
    }
  };

  const addColumn = async (column: Omit<Column, "id">) => {
    try {
      const supabaseColumn = adaptColumnToSupabase(column);
      
      const { data, error } = await supabase
        .from('columns')
        .insert([supabaseColumn])
        .select()
        .single();

      if (error) throw error;
      
      setColumns(prev => [...prev, data]);
      
      // Kateqoriyadakı sütun sayını yeniləyirik
      if (column.categoryId) {
        await updateCategoryColumnCount(column.categoryId);
      }
      
      toast.success(t('columnAdded'), {
        description: t('columnAddedDesc')
      });
      
      return data;
    } catch (err: any) {
      console.error('Error adding column:', err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotAddColumn')
      });
      throw err;
    }
  };

  const updateColumn = async (id: string, updates: Partial<Column>) => {
    try {
      const supabaseUpdates = adaptColumnToSupabase(updates);
      
      const { data, error } = await supabase
        .from('columns')
        .update(supabaseUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setColumns(prev => prev.map(column => 
        column.id === id ? data : column
      ));
      
      toast.success(t('columnUpdated'), {
        description: t('columnUpdatedDesc')
      });
      
      return data;
    } catch (err: any) {
      console.error('Error updating column:', err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotUpdateColumn')
      });
      throw err;
    }
  };

  const deleteColumn = async (id: string) => {
    try {
      // Əvvəlcə silinən sütunun kategoriya ID-sini almaq lazımdır
      const column = columns.find(c => c.id === id);
      const categoryId = column?.category_id;
      
      const { error } = await supabase
        .from('columns')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setColumns(prev => prev.filter(column => column.id !== id));
      
      // Kateqoriyadakı sütun sayını yeniləyirik
      if (categoryId) {
        await updateCategoryColumnCount(categoryId);
      }
      
      toast.success(t('columnDeleted'), {
        description: t('columnDeletedDesc')
      });
    } catch (err: any) {
      console.error('Error deleting column:', err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotDeleteColumn')
      });
      throw err;
    }
  };

  // Kateqoriyada sütun sayını yeniləmək
  const updateCategoryColumnCount = async (categoryId: string) => {
    try {
      // Kateqoriyadakı sütun sayını hesablayırıq
      const { count, error: countError } = await supabase
        .from('columns')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', categoryId);
      
      if (countError) throw countError;
      
      // Kateqoriyanı yeniləyirik
      const { error: updateError } = await supabase
        .from('categories')
        .update({ column_count: count || 0 })
        .eq('id', categoryId);
      
      if (updateError) throw updateError;
      
    } catch (err) {
      console.error('Error updating category column count:', err);
    }
  };

  useEffect(() => {
    fetchColumns();
  }, [categoryId]);

  return {
    columns,
    loading,
    error,
    fetchColumns,
    addColumn,
    updateColumn,
    deleteColumn
  };
};
