
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Column, ColumnType } from '@/types/column';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { columnAdapter } from '@/utils/columnAdapter';

// Helper function to adapt a column to the database format
const adaptColumnToDb = (column: Partial<Column>) => {
  return {
    id: column.id,
    category_id: column.category_id,
    name: column.name,
    type: column.type,
    is_required: column.is_required,
    placeholder: column.placeholder,
    help_text: column.help_text,
    order_index: column.order_index,
    status: column.status,
    validation: column.validation ? JSON.stringify(column.validation) : null,
    default_value: column.default_value,
    options: column.options ? JSON.stringify(column.options) : null,
    parent_column_id: column.parent_column_id
  };
};

export const useColumnMutations = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a new column
  const createColumn = async (column: Partial<Column>) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Creating column with data:', column);

      const columnToCreate = adaptColumnToDb(column);
      console.log('Adapted column data:', columnToCreate);

      // Əvvəlcə sütunu yaradırıq
      const { data, error: columnError } = await supabase
        .from('columns')
        .insert(columnToCreate)
        .select()
        .single();

      console.log('Supabase response:', data, columnError);
      
      if (columnError) {
        console.error('Column creation error:', columnError);
        throw columnError;
      }

      // Kateqoriyanı yeniləyirik (sütun sayını artırırıq)
      try {
        // Bu funksiya kateqoriyanın sütun sayını artırır
        // Əgər bu rpc funksiyası mövcud deyilsə, aşağıdakı kodla əvəz edilə bilər
        await supabase.rpc('increment_column_count', {
          category_id: column.category_id
        });
      } catch (rpcError) {
        console.error('RPC error, using fallback method:', rpcError);
        
        // Fallback metodu: Əgər RPC mövcud deyilsə, manual update edə bilərik
        const { data: category } = await supabase
          .from('categories')
          .select('column_count')
          .eq('id', column.category_id)
          .single();
        
        if (category) {
          await supabase
            .from('categories')
            .update({ column_count: (category.column_count || 0) + 1 })
            .eq('id', column.category_id);
        }
      }

      // Audit log əlavə edək
      try {
        await supabase.from('audit_logs').insert({
          action: 'create',
          entity_type: 'column',
          entity_id: data.id,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          new_value: {
            name: data.name,
            type: data.type,
            category_id: data.category_id
          }
        });
      } catch (auditError) {
        console.error('Audit log error:', auditError);
        // Audit log xətası əsas əməliyyatı dayandırmamalıdır
      }

      toast.success(t('columnCreated'));
      
      // API-nin qaytardığı məlumatları adaptasiya edib qaytaraq
      return {
        success: true,
        data: columnAdapter.adaptSupabaseToColumn(data)
      };
    } catch (err: any) {
      setError(err.message);
      console.error('Column creation error:', err);
      toast.error(t('errorCreatingColumn'));
      return {
        success: false,
        error: err.message
      };
    } finally {
      setLoading(false);
    }
  };

  // Delete a column
  const deleteColumn = async (columnId: string, categoryId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Silinəcək sütunu əvvəlcədən götürək (audit log üçün)
      const { data: columnData } = await supabase
        .from('columns')
        .select('*')
        .eq('id', columnId)
        .single();

      const { error: deleteError } = await supabase
        .from('columns')
        .delete()
        .eq('id', columnId);

      if (deleteError) throw deleteError;

      // Kateqoriyanı yeniləyirik (sütun sayını azaldırıq)
      try {
        // Bu funksiya kateqoriyanın sütun sayını azaldır
        // Əgər bu rpc funksiyası mövcud deyilsə, aşağıdakı kodla əvəz edilə bilər
        await supabase.rpc('decrement_column_count', {
          category_id: categoryId
        });
      } catch (rpcError) {
        console.error('RPC error, using fallback method:', rpcError);
        
        // Fallback metodu: Əgər RPC mövcud deyilsə, manual update edə bilərik
        const { data: category } = await supabase
          .from('categories')
          .select('column_count')
          .eq('id', categoryId)
          .single();
        
        if (category) {
          await supabase
            .from('categories')
            .update({ column_count: Math.max((category.column_count || 0) - 1, 0) })
            .eq('id', categoryId);
        }
      }

      // Audit log əlavə edək
      try {
        await supabase.from('audit_logs').insert({
          action: 'delete',
          entity_type: 'column',
          entity_id: columnId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          old_value: columnData
        });
      } catch (auditError) {
        console.error('Audit log error:', auditError);
        // Audit log xətası əsas əməliyyatı dayandırmamalıdır
      }

      toast.success(t('columnDeleted'));
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      toast.error(t('errorDeletingColumn'));
      return {
        success: false,
        error: err.message
      };
    } finally {
      setLoading(false);
    }
  };

  // Update a column
  const updateColumn = async (column: Partial<Column>) => {
    try {
      setLoading(true);
      setError(null);

      // Əvvəlki məlumatları əldə edək (audit log üçün)
      const { data: oldColumn } = await supabase
        .from('columns')
        .select('*')
        .eq('id', column.id)
        .single();

      const columnToUpdate = adaptColumnToDb(column);

      const { data, error: updateError } = await supabase
        .from('columns')
        .update(columnToUpdate)
        .eq('id', column.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Audit log əlavə edək
      try {
        await supabase.from('audit_logs').insert({
          action: 'update',
          entity_type: 'column',
          entity_id: column.id,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          old_value: oldColumn,
          new_value: data
        });
      } catch (auditError) {
        console.error('Audit log error:', auditError);
        // Audit log xətası əsas əməliyyatı dayandırmamalıdır
      }

      toast.success(t('columnUpdated'));
      
      // API-nin qaytardığı məlumatları adaptasiya edib qaytaraq
      return {
        success: true,
        data: columnAdapter.adaptSupabaseToColumn(data)
      };
    } catch (err: any) {
      setError(err.message);
      toast.error(t('errorUpdatingColumn'));
      return {
        success: false,
        error: err.message
      };
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
