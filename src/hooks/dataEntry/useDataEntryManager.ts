
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth/useAuth';
import { CategoryWithColumns } from '@/types/category';
import { DataEntry } from '@/types/dataEntry';
import { toast } from 'sonner';

interface DataEntryManagerProps {
  schoolId?: string;
  categoryId?: string;
  onDataSubmitted?: () => void;
}

export const useDataEntryManager = ({ schoolId, categoryId, onDataSubmitted }: DataEntryManagerProps) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<CategoryWithColumns[]>([]);
  const [entries, setEntries] = useState<DataEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});

  const effectiveUserId = user?.id;

  const fetchCategories = useCallback(async () => {
    try {
      let query = supabase
        .from('categories')
        .select(`
          *,
          columns(*)
        `)
        .eq('status', 'active');

      if (categoryId) {
        query = query.eq('id', categoryId);
      }

      const { data, error } = await query.order('order_index');

      if (error) throw error;

      const categoriesWithColumns: CategoryWithColumns[] = (data || []).map(category => ({
        ...category,
        columns: category.columns || []
      }));

      setCategories(categoriesWithColumns);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      toast.error('Kateqoriyalar yüklənərkən xəta baş verdi');
    }
  }, [categoryId]);

  const fetchEntries = useCallback(async () => {
    if (!schoolId) return;

    try {
      let query = supabase
        .from('data_entries')
        .select('*')
        .eq('school_id', schoolId);

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setEntries(data || []);
      
      // Populate form values from existing entries
      const formValues: Record<string, string> = {};
      (data || []).forEach(entry => {
        formValues[entry.column_id] = entry.value || '';
      });
      setValues(formValues);
    } catch (error: any) {
      console.error('Error fetching entries:', error);
      toast.error('Məlumatlar yüklənərkən xəta baş verdi');
    }
  }, [schoolId, categoryId]);

  const handleValueChange = useCallback((columnId: string, value: string) => {
    setValues(prev => ({
      ...prev,
      [columnId]: value
    }));
  }, []);

  const submitData = useCallback(async (targetCategoryId: string) => {
    if (!schoolId || !effectiveUserId) {
      toast.error('Giriş məlumatları tapılmadı');
      return false;
    }

    try {
      setSubmitting(true);

      const category = categories.find(cat => cat.id === targetCategoryId);
      if (!category) {
        toast.error('Kateqoriya tapılmadı');
        return false;
      }

      const dataEntries = category.columns
        .filter(column => values[column.id] && values[column.id].trim() !== '')
        .map(column => ({
          category_id: targetCategoryId,
          column_id: column.id,
          school_id: schoolId,
          value: values[column.id],
          status: 'pending' as const,
          created_by: effectiveUserId
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
      
      if (onDataSubmitted) {
        onDataSubmitted();
      }

      await fetchEntries();
      return true;
    } catch (error: any) {
      console.error('Error submitting data:', error);
      toast.error('Məlumatlar yadda saxlanılarkən xəta baş verdi');
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [schoolId, effectiveUserId, categories, values, onDataSubmitted, fetchEntries]);

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await Promise.all([fetchCategories(), fetchEntries()]);
      setLoading(false);
    };

    initializeData();
  }, [fetchCategories, fetchEntries]);

  return {
    categories,
    entries,
    values,
    loading,
    submitting,
    handleValueChange,
    submitData,
    refetch: () => Promise.all([fetchCategories(), fetchEntries()])
  };
};
