
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { CategoryWithColumns, CategoryAssignment } from '@/types/category';
import { ColumnType } from '@/types/column';
import { toast } from 'sonner';

interface DataEntryFormData {
  [columnId: string]: any;
}

interface DataEntryManagerOptions {
  categoryId?: string;
  schoolId?: string;
  userId?: string;
  category?: CategoryWithColumns;
  enableRealTime?: boolean;
  autoSave?: boolean;
}

export type EntryStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export const useDataEntryManager = (options?: DataEntryManagerOptions | CategoryAssignment) => {
  const user = useAuthStore(selectUser);
  const [categories, setCategories] = useState<CategoryWithColumns[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Enhanced form management
  const [formData, setFormData] = useState<DataEntryFormData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDataModified, setIsDataModified] = useState(false);
  const [entryStatus, setEntryStatus] = useState<EntryStatus>('draft');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Handle both old and new usage patterns
  const assignmentFilter = typeof options === 'string' ? options : options?.category?.assignment;
  const categoryId = typeof options === 'object' ? options?.categoryId : undefined;
  const schoolId = typeof options === 'object' ? options?.schoolId : undefined;
  const enableAutoSave = typeof options === 'object' ? options?.autoSave : false;

  const fetchCategories = async () => {
    if (!user) return;

    try {
      setLoading(true);
      let query = supabase
        .from('categories')
        .select(`
          *,
          columns(*)
        `)
        .eq('status', 'active')
        .order('order_index');

      if (assignmentFilter && assignmentFilter !== 'all') {
        query = query.in('assignment', [assignmentFilter, 'all']);
      }

      const { data, error } = await query;

      if (error) throw error;

      const categoriesWithColumns: CategoryWithColumns[] = (Array.isArray(data) ? data : []).map((category: any) => ({
        ...category,
        assignment: (category.assignment || 'all') as CategoryAssignment,
        columns: Array.isArray(category.columns)
          ? (category.columns || []).map((column: any) => ({
              ...column,
              type: column.type as ColumnType,
              status: column.status,
              options: column.options ? 
                (typeof column.options === 'string' ? JSON.parse(column.options) : column.options) : 
                [],
              validation: column.validation ? 
                (typeof column.validation === 'string' ? JSON.parse(column.validation) : column.validation) : 
                {}
            }))
          : []
      }));

      setCategories(categoriesWithColumns);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError(err.message);
      toast.error('Kateqoriyalar yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const loadData = useCallback(async () => {
    if (!schoolId || !categoryId) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('data_entries')
        .select('column_id, value, status')
        .eq('school_id', schoolId)
        .eq('category_id', categoryId);

      if (error) throw error;

      const loadedData: DataEntryFormData = {};
      data.forEach(entry => {
        loadedData[entry.column_id] = entry.value;
      });

      setFormData(loadedData);
      // Fix: Ensure status is one of the allowed types
      const status = data[0]?.status;
      if (status === 'draft' || status === 'pending' || status === 'approved' || status === 'rejected') {
        setEntryStatus(status);
      } else {
        setEntryStatus('draft');
      }
      setIsDataModified(false);
    } catch (err: any) {
      console.error('Error loading data:', err);
      toast.error('Məlumatlar yüklənərkən xəta baş verdi');
    } finally {
      setIsLoading(false);
    }
  }, [schoolId, categoryId]);

  const handleFormDataChange = useCallback((newData: DataEntryFormData) => {
    setFormData(newData);
    setIsDataModified(true);
  }, []);

  const handleFieldChange = useCallback((columnId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [columnId]: value
    }));
    setIsDataModified(true);
  }, []);

  const handleSave = useCallback(async (status: EntryStatus = 'draft') => {
    if (!schoolId || !categoryId || !user) return false;

    try {
      setIsSaving(true);
      
      const entries = Object.entries(formData).map(([columnId, value]) => ({
        school_id: schoolId,
        category_id: categoryId,
        column_id: columnId,
        value: value?.toString() || '',
        status,
        created_by: user.id,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('data_entries')
        .upsert(entries, {
          onConflict: 'school_id,category_id,column_id'
        });

      if (error) throw error;

      setLastSaved(new Date());
      setIsDataModified(false);
      setEntryStatus(status);
      toast.success('Məlumatlar yadda saxlanıldı');
      return true;
    } catch (err: any) {
      console.error('Error saving data:', err);
      toast.error('Məlumatlar yadda saxlanılan zaman xəta baş verdi');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [formData, schoolId, categoryId, user]);

  const handleSubmit = useCallback(async () => {
    if (!schoolId || !categoryId) return false;

    try {
      setIsSubmitting(true);
      const success = await handleSave('pending');
      if (success) {
        toast.success('Məlumatlar təsdiq üçün göndərildi');
      }
      return success;
    } catch (err: any) {
      console.error('Error submitting data:', err);
      toast.error('Məlumatlar göndərilərkən xəta baş verdi');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [handleSave, schoolId, categoryId]);

  const resetForm = useCallback(() => {
    setFormData({});
    setIsDataModified(false);
    setEntryStatus('draft');
    setLastSaved(null);
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (enableAutoSave && isDataModified && !isSaving) {
      const timer = setTimeout(() => {
        handleSave('draft');
      }, 5000); // Auto-save after 5 seconds of inactivity

      return () => clearTimeout(timer);
    }
  }, [enableAutoSave, isDataModified, isSaving, handleSave]);

  useEffect(() => {
    fetchCategories();
  }, [user, assignmentFilter]);

  useEffect(() => {
    if (schoolId && categoryId) {
      loadData();
    }
  }, [schoolId, categoryId, loadData]);

  return {
    // Basic data
    categories,
    loading,
    error,
    refetch: fetchCategories,
    
    // Enhanced form management
    formData,
    isLoading,
    isSubmitting,
    isSaving,
    isDataModified,
    entryStatus,
    lastSaved,
    
    // Enhanced operations
    handleFormDataChange,
    handleFieldChange,
    handleSubmit,
    handleSave,
    resetForm,
    loadData
  };
};
