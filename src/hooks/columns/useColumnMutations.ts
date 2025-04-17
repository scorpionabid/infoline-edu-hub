
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Column, ColumnType } from '@/types/column';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { columnAdapter } from '@/utils/columnAdapter';

// Sütunları verilənlər bazası formatına çevirmək üçün köməkçi funksiya
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

  // Yeni sütun yaratma
  const createColumn = async (column: Partial<Column>) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Sütun yaratma məlumatları:', column);

      const columnToCreate = adaptColumnToDb(column);
      console.log('Adaptasiya edilmiş sütun məlumatları:', columnToCreate);

      // Sütunu yaratmaq üçün sorğu
      const { data, error: columnError } = await supabase
        .from('columns')
        .insert(columnToCreate)
        .select()
        .single();

      console.log('Supabase cavabı:', data, columnError);
      
      if (columnError) {
        console.error('Sütun yaratma xətası:', columnError);
        throw columnError;
      }

      // Kateqoriyanın sütun sayını artırmaq üçün cəhd edirik
      try {
        // Öncə RPC funksiyasını çağırmağa çalışaq
        await supabase.rpc('increment_column_count', {
          category_id: column.category_id
        });
      } catch (rpcError) {
        console.error('RPC xətası, alternativ metoda keçid:', rpcError);
        
        // Alternativ: Əgər RPC funksiyası mövcud deyilsə, manual yeniləmə
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

      // Audit jurnalı əlavə et
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
        console.error('Audit jurnalı xətası:', auditError);
        // Audit xətası əsas əməliyyatı dayandırmamalıdır
      }

      toast.success(t('columnCreated'));
      
      // API-nin qaytardığı məlumatları adaptasiya edib qaytaraq
      return {
        success: true,
        data: columnAdapter.adaptSupabaseToColumn(data)
      };
    } catch (err: any) {
      setError(err.message);
      console.error('Sütun yaratma xətası:', err);
      toast.error(t('errorCreatingColumn'));
      return {
        success: false,
        error: err.message
      };
    } finally {
      setLoading(false);
    }
  };

  // Sütunu silmək
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

      // Kateqoriyanın sütun sayını azaltmaq üçün cəhd edirik
      try {
        // Öncə RPC funksiyasını çağırmağa çalışaq
        await supabase.rpc('decrement_column_count', {
          category_id: categoryId
        });
      } catch (rpcError) {
        console.error('RPC xətası, alternativ metoda keçid:', rpcError);
        
        // Alternativ: Əgər RPC funksiyası mövcud deyilsə, manual yeniləmə
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

      // Audit jurnalı əlavə et
      try {
        await supabase.from('audit_logs').insert({
          action: 'delete',
          entity_type: 'column',
          entity_id: columnId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          old_value: columnData
        });
      } catch (auditError) {
        console.error('Audit jurnalı xətası:', auditError);
        // Audit xətası əsas əməliyyatı dayandırmamalıdır
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

  // Sütunu yeniləmək
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
      console.log('Yenilənən sütun məlumatları:', columnToUpdate);

      const { data, error: updateError } = await supabase
        .from('columns')
        .update(columnToUpdate)
        .eq('id', column.id)
        .select()
        .single();

      if (updateError) {
        console.error('Sütun yeniləmə xətası:', updateError);
        throw updateError;
      }

      // Audit jurnalı əlavə et
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
        console.error('Audit jurnalı xətası:', auditError);
        // Audit xətası əsas əməliyyatı dayandırmamalıdır
      }

      toast.success(t('columnUpdated'));
      
      // API-nin qaytardığı məlumatları adaptasiya edib qaytaraq
      return {
        success: true,
        data: columnAdapter.adaptSupabaseToColumn(data)
      };
    } catch (err: any) {
      setError(err.message);
      console.error('Sütun yeniləmə xətası:', err);
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
