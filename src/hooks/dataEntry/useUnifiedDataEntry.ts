
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CategoryWithColumns } from '@/types/category';
import { toast } from 'sonner';

interface DataEntryValue {
  columnId: string;
  value: string;
  categoryId: string;
}

export const useUnifiedDataEntry = (entityId: string, entityType: 'school' | 'sector') => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});

  const handleValueChange = useCallback((columnId: string, value: string) => {
    setValues(prev => ({
      ...prev,
      [columnId]: value
    }));
  }, []);

  const submitData = useCallback(async (categoryId: string) => {
    try {
      setIsSubmitting(true);
      
      const dataEntries = Object.entries(values)
        .filter(([_, value]) => value.trim() !== '')
        .map(([columnId, value]) => ({
          category_id: categoryId,
          column_id: columnId,
          value,
          school_id: entityType === 'school' ? entityId : null,
          sector_id: entityType === 'sector' ? entityId : null,
          status: 'pending'
        }));

      if (dataEntries.length === 0) {
        toast.warning('Heç bir məlumat daxil edilməyib');
        return false;
      }

      const { error } = await supabase
        .from('data_entries')
        .upsert(dataEntries, {
          onConflict: 'category_id,column_id,school_id'
        });

      if (error) throw error;

      toast.success('Məlumatlar uğurla yadda saxlanıldı');
      return true;
    } catch (error: any) {
      console.error('Error submitting data:', error);
      toast.error('Məlumatlar yadda saxlanılarkən xəta baş verdi');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [values, entityId, entityType]);

  return {
    values,
    isSubmitting,
    handleValueChange,
    submitData
  };
};
