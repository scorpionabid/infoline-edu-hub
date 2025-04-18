
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Column, ColumnFormData, ColumnType } from '@/types/column';
import { toast } from 'sonner';

export const useColumns = (categoryId?: string) => {
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchColumns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from('columns').select('*');
      
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      
      query = query.order('order_index', { ascending: true });

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      const formattedColumns = data.map((column: any) => ({
        id: column.id,
        category_id: column.category_id,
        name: column.name,
        type: column.type as ColumnType,
        is_required: column.is_required,
        placeholder: column.placeholder,
        help_text: column.help_text,
        order_index: column.order_index,
        options: column.options ? JSON.parse(JSON.stringify(column.options)) : [],
        validation: column.validation ? JSON.parse(JSON.stringify(column.validation)) : {},
        default_value: column.default_value,
        status: column.status || 'active',
        created_at: column.created_at,
        updated_at: column.updated_at,
        parent_column_id: column.parent_column_id
      }));

      setColumns(formattedColumns);
    } catch (err: any) {
      console.error('Error fetching columns:', err);
      setError(err.message || 'Sütunları əldə edərkən xəta baş verdi');
      toast.error('Sütunları yükləmək mümkün olmadı');
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    fetchColumns();
  }, [fetchColumns]);

  const createColumn = async (columnData: ColumnFormData, categoryId: string) => {
    try {
      setError(null);
      
      const { data, error: insertError } = await supabase
        .from('columns')
        .insert({
          category_id: categoryId,
          name: columnData.name,
          type: columnData.type,
          is_required: columnData.is_required,
          placeholder: columnData.placeholder,
          help_text: columnData.help_text,
          order_index: columnData.order_index,
          options: columnData.options || [],
          validation: columnData.validation || {},
          default_value: columnData.default_value,
          status: columnData.status,
          parent_column_id: columnData.parent_column_id
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      toast.success('Sütun uğurla əlavə edildi');
      
      // Yeni sütunu daxil et və siyahını yenilə
      await fetchColumns();
      
      return data;
    } catch (err: any) {
      console.error('Error creating column:', err);
      setError(err.message || 'Sütun yaradarkən xəta baş verdi');
      toast.error('Sütun yaratmaq mümkün olmadı');
      return null;
    }
  };

  const updateColumn = async (id: string, columnData: Partial<ColumnFormData>) => {
    try {
      setError(null);
      
      const { data, error: updateError } = await supabase
        .from('columns')
        .update({
          name: columnData.name,
          type: columnData.type,
          is_required: columnData.is_required,
          placeholder: columnData.placeholder,
          help_text: columnData.help_text,
          order_index: columnData.order_index,
          options: columnData.options,
          validation: columnData.validation,
          default_value: columnData.default_value,
          status: columnData.status,
          parent_column_id: columnData.parent_column_id
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      toast.success('Sütun uğurla yeniləndi');
      
      // Siyahını yenilə
      await fetchColumns();
      
      return data;
    } catch (err: any) {
      console.error('Error updating column:', err);
      setError(err.message || 'Sütunu yeniləyərkən xəta baş verdi');
      toast.error('Sütunu yeniləmək mümkün olmadı');
      return null;
    }
  };

  const deleteColumn = async (id: string) => {
    try {
      setError(null);
      
      const { error: deleteError } = await supabase
        .from('columns')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      toast.success('Sütun uğurla silindi');
      
      // Sütunu sil və siyahını yenilə
      await fetchColumns();
      
      return true;
    } catch (err: any) {
      console.error('Error deleting column:', err);
      setError(err.message || 'Sütunu silmək mümkün olmadı');
      toast.error('Sütunu silmək mümkün olmadı');
      return false;
    }
  };

  return {
    columns,
    loading,
    error,
    fetchColumns,
    createColumn,
    updateColumn,
    deleteColumn
  };
};
