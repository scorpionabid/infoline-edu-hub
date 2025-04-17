
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Column, ColumnType, ColumnValidation } from '@/types/column';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { columnAdapter } from '@/utils/columnAdapter';
import { useAuth } from '@/context/auth';

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
  const { user } = useAuth();

  // Yeni sütun yaratma
  const createColumn = async (column: Partial<Column>) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Sütun yaratma məlumatları:', column);

      // İstifadəçi məlumatlarını alaq
      const userId = user?.id;
      if (!userId) {
        throw new Error('İstifadəçi məlumatları tapılmadı');
      }

      const columnToCreate = adaptColumnToDb(column);
      console.log('Adaptasiya edilmiş sütun məlumatları:', columnToCreate);

      // Edge Function çağıraq
      const { data, error: functionError } = await supabase.functions.invoke('create-column', {
        body: {
          column: columnToCreate,
          userId
        }
      });

      if (functionError || !data?.success) {
        console.error('Edge function xətası:', functionError || data?.error);
        throw new Error(functionError?.message || data?.error || 'Sütun yaratma xətası');
      }

      // Audit jurnalı əlavə et
      try {
        const userResponse = await supabase.auth.getUser();
        await supabase.from('audit_logs').insert({
          action: 'create',
          entity_type: 'column',
          entity_id: data.data.id,
          user_id: userResponse.data.user?.id,
          new_value: {
            name: data.data.name,
            type: data.data.type,
            category_id: data.data.category_id
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
        data: data.data ? columnAdapter.adaptSupabaseToColumn(data.data) : null
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

      const userId = user?.id;
      if (!userId) {
        throw new Error('İstifadəçi məlumatları tapılmadı');
      }

      // Silinəcək sütunu əvvəlcədən götürək (audit log üçün)
      const { data: columnData } = await supabase
        .from('columns')
        .select('*')
        .eq('id', columnId)
        .single();

      // Edge function çağıraq
      const { data, error: functionError } = await supabase.functions.invoke('delete-column', {
        body: {
          columnId,
          categoryId,
          userId
        }
      });

      if (functionError || !data?.success) {
        throw new Error(functionError?.message || data?.error || 'Sütun silinə bilmədi');
      }

      // Audit jurnalı əlavə et
      try {
        const userResponse = await supabase.auth.getUser();
        await supabase.from('audit_logs').insert({
          action: 'delete',
          entity_type: 'column',
          entity_id: columnId,
          user_id: userResponse.data.user?.id,
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

      const userId = user?.id;
      if (!userId) {
        throw new Error('İstifadəçi məlumatları tapılmadı');
      }

      // Əvvəlki məlumatları əldə edək (audit log üçün)
      const { data: oldColumn } = await supabase
        .from('columns')
        .select('*')
        .eq('id', column.id)
        .single();

      const columnToUpdate = adaptColumnToDb(column);
      console.log('Yenilənən sütun məlumatları:', columnToUpdate);

      // Edge function çağıraq
      const { data, error: functionError } = await supabase.functions.invoke('update-column', {
        body: {
          column: columnToUpdate,
          userId
        }
      });

      if (functionError || !data?.success) {
        console.error('Sütun yeniləmə xətası:', functionError || data?.error);
        throw new Error(functionError?.message || data?.error || 'Sütun yeniləmə xətası');
      }

      // Audit jurnalı əlavə et
      try {
        const userResponse = await supabase.auth.getUser();
        await supabase.from('audit_logs').insert({
          action: 'update',
          entity_type: 'column',
          entity_id: column.id,
          user_id: userResponse.data.user?.id,
          old_value: oldColumn,
          new_value: data.data
        });
      } catch (auditError) {
        console.error('Audit jurnalı xətası:', auditError);
        // Audit xətası əsas əməliyyatı dayandırmamalıdır
      }

      toast.success(t('columnUpdated'));
      
      // API-nin qaytardığı məlumatları adaptasiya edib qaytaraq
      return {
        success: true,
        data: data.data ? columnAdapter.adaptSupabaseToColumn(data.data) : null
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
