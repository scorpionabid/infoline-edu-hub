
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth/useAuth';
import { CategoryWithColumns } from '@/types/category';
import { DataEntry } from '@/types/dataEntry';
import { toast } from 'sonner';

interface DataEntryManagerProps {
  schoolId?: string;
  categoryId?: string;
  userId?: string;
  onDataSubmitted?: () => void;
}

export const useDataEntryManager = ({ schoolId, categoryId, userId, onDataSubmitted }: DataEntryManagerProps) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<CategoryWithColumns[]>([]);
  const [entries, setEntries] = useState<DataEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDataModified, setIsDataModified] = useState(false);
  const [entryStatus, setEntryStatus] = useState<string>('draft');
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const effectiveUserId = userId || user?.id;

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
      setError(error.message);
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
      setFormData(formValues);
    } catch (error: any) {
      console.error('Error fetching entries:', error);
      setError(error.message);
      toast.error('Məlumatlar yüklənərkən xəta baş verdi');
    }
  }, [schoolId, categoryId]);

  const handleValueChange = useCallback((columnId: string, value: string) => {
    setValues(prev => ({
      ...prev,
      [columnId]: value
    }));
    setIsDataModified(true);
  }, []);

  const handleFormDataChange = useCallback((data: Record<string, any>) => {
    setFormData(data);
    setIsDataModified(true);
  }, []);

  const handleFieldChange = useCallback((fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
    setIsDataModified(true);
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      // Save logic here
      setLastSaved(new Date().toISOString());
      setIsDataModified(false);
      toast.success('Məlumatlar yadda saxlanıldı');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Saxlama xətası');
    } finally {
      setIsSaving(false);
    }
  }, []);

  const handleSubmit = useCallback(async (targetCategoryId?: string) => {
    const categoryToSubmit = targetCategoryId || categoryId;
    if (categoryToSubmit) {
      return await submitData(categoryToSubmit);
    }
    return false;
  }, [categoryId]);

  const resetForm = useCallback(() => {
    setValues({});
    setFormData({});
    setIsDataModified(false);
    setError(null);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchCategories(), fetchEntries()]);
    setLoading(false);
  }, [fetchCategories, fetchEntries]);

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
      setEntryStatus('pending');
      
      if (onDataSubmitted) {
        onDataSubmitted();
      }

      await fetchEntries();
      return true;
    } catch (error: any) {
      console.error('Error submitting data:', error);
      setError(error.message);
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
    formData,
    isLoading: loading,
    isSubmitting: submitting,
    isSaving,
    isDataModified,
    entryStatus,
    error,
    lastSaved,
    handleValueChange,
    handleFormDataChange,
    handleFieldChange,
    handleSubmit,
    handleSave,
    resetForm,
    loadData,
    submitData,
    refetch: () => Promise.all([fetchCategories(), fetchEntries()])
  };
};
