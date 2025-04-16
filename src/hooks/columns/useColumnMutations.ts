
import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Column } from '@/types/column';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { useColumnAdapters } from './useColumnAdapters';

/**
 * @description Sütun əlavə etmə, düzənləmə və silmə əməliyyatları üçün hook
 */
export const useColumnMutations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();
  const { adaptColumnToDb } = useColumnAdapters();

  /**
   * @description Sütun əlavə etmə və ya düzənləmə üçün məlumatları göndərir
   */
  const saveColumn = useCallback(async (column: Partial<Column>) => {
    setIsLoading(true);
    
    try {
      // Sütun tipi əlavə edilməlidi
      if (!column.type) {
        throw new Error(t('columnTypeMissing'));
      }
      
      // Sütun adı əlavə edilməlidi
      if (!column.name) {
        throw new Error(t('columnNameMissing'));
      }
      
      // Kateqoriya ID-si əlavə edilməlidi
      if (!column.category_id) {
        throw new Error(t('categoryIdMissing'));
      }
      
      // Sütun məlumatlarını verilənlər bazasına uyğunlaşdır
      const dbColumn = adaptColumnToDb(column);
      
      // Convert complex types to string (JSON)
      const dbColumnForInsert = {
        ...dbColumn,
        options: dbColumn.options ? JSON.stringify(dbColumn.options) : null,
        validation: dbColumn.validation ? JSON.stringify(dbColumn.validation) : null
      };
      
      let result;
      
      if (column.id) {
        // Mövcud sütunu yenilə
        const { data, error } = await supabase
          .from('columns')
          .update(dbColumnForInsert)
          .eq('id', column.id)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
        
        toast.success(t('columnUpdated'), {
          description: t('columnUpdatedDesc')
        });
      } else {
        // Yeni sütun əlavə et
        const { data, error } = await supabase
          .from('columns')
          .insert([dbColumnForInsert])
          .select()
          .single();
        
        if (error) throw error;
        result = data;
        
        // Kateqoriyanın sütun sayını bir artır
        await supabase.rpc('increment_column_count', {
          p_category_id: column.category_id
        });
        
        toast.success(t('columnAdded'), {
          description: t('columnAddedDesc')
        });
      }
      
      return { success: true, data: result };
    } catch (error: any) {
      console.error('Sütun saxlama zamanı xəta:', error.message);
      
      toast.error(column.id ? t('columnUpdateError') : t('columnAddError'), {
        description: error.message
      });
      
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  }, [t, adaptColumnToDb]);

  /**
   * @description Sütunu verilənlər bazasından silir
   */
  const deleteColumn = useCallback(async (columnId: string) => {
    setIsLoading(true);
    
    try {
      // Sütunu silmədən əvvəl kateqoriya ID-sini əldə et
      const { data: columnData, error: columnError } = await supabase
        .from('columns')
        .select('category_id')
        .eq('id', columnId)
        .single();
      
      if (columnError) throw columnError;
      
      // Sütunu sil
      const { error } = await supabase
        .from('columns')
        .delete()
        .eq('id', columnId);
      
      if (error) throw error;
      
      // Kateqoriyanın sütun sayını bir azalt
      await supabase.rpc('decrement_column_count', {
        p_category_id: columnData.category_id
      });
      
      toast.success(t('columnDeleted'), {
        description: t('columnDeletedDesc')
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Sütun silmə zamanı xəta:', error.message);
      
      toast.error(t('columnDeleteError'), {
        description: error.message
      });
      
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  return {
    saveColumn,
    deleteColumn,
    isLoading
  };
};
