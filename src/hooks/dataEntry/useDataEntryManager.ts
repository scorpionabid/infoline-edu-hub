import { useState, useEffect, useCallback, useRef } from 'react';
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
  autoSaveInterval?: number; // in milliseconds
}

export type EntryStatus = 'draft' | 'pending' | 'approved' | 'rejected';

interface AutoSaveState {
  isEnabled: boolean;
  interval: number;
  lastSave: Date | null;
  pendingChanges: boolean;
  error: string | null;
  attempts: number;
}

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

  // Auto-save state
  const [autoSaveState, setAutoSaveState] = useState<AutoSaveState>({
    isEnabled: false,
    interval: 3000, // 3 seconds default
    lastSave: null,
    pendingChanges: false,
    error: null,
    attempts: 0
  });

  // Refs for auto-save
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastFormDataRef = useRef<string>('');

  // Handle both old and new usage patterns
  const assignmentFilter = typeof options === 'string' ? options : options?.category?.assignment;
  const categoryId = typeof options === 'object' ? options?.categoryId : undefined;
  const schoolId = typeof options === 'object' ? options?.schoolId : undefined;
  const enableAutoSave = typeof options === 'object' ? (options?.autoSave ?? false) : false;
  const autoSaveInterval = typeof options === 'object' ? (options?.autoSaveInterval ?? 3000) : 3000;

  // Update auto-save state when options change
  useEffect(() => {
    setAutoSaveState(prev => ({
      ...prev,
      isEnabled: enableAutoSave,
      interval: autoSaveInterval
    }));
  }, [enableAutoSave, autoSaveInterval]);

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
        .order('name');

      // Filter by assignment for SchoolAdmin - only show 'all' assignment categories
      if (assignmentFilter && assignmentFilter !== 'all') {
        query = query.in('assignment', [assignmentFilter, 'all']);
      } else {
        // For SchoolAdmin, only show 'all' assignments
        const userRoles = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);
        
        if (userRoles.data?.some(role => role.role === 'schooladmin')) {
          query = query.eq('assignment', 'all');
        }
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
    if (!schoolId || !categoryId) {
      console.log('LoadData: schoolId or categoryId missing', { schoolId, categoryId });
      return;
    }

    try {
      setIsLoading(true);
      console.log('Loading data for:', { schoolId, categoryId });
      
      const { data, error } = await supabase
        .from('data_entries')
        .select('column_id, value, status')
        .eq('school_id', schoolId)
        .eq('category_id', categoryId);

      if (error) {
        console.error('Error loading data:', error);
        throw error;
      }

      console.log('Loaded data entries:', data);

      const loadedData: DataEntryFormData = {};
      let statusFound: EntryStatus = 'draft';
      
      if (data && data.length > 0) {
        data.forEach(entry => {
          loadedData[entry.column_id] = entry.value;
        });
        
        // Set status from the first entry
        const status = data[0]?.status;
        if (status === 'draft' || status === 'pending' || status === 'approved' || status === 'rejected') {
          statusFound = status;
        }
      }

      console.log('Setting form data:', loadedData);
      console.log('Setting status:', statusFound);

      setFormData(loadedData);
      setEntryStatus(statusFound);
      lastFormDataRef.current = JSON.stringify(loadedData);
      setIsDataModified(false);
      setAutoSaveState(prev => ({ ...prev, pendingChanges: false }));
      
      // Set last saved time if there's existing data
      if (data && data.length > 0) {
        setLastSaved(new Date());
      }
      
    } catch (err: any) {
      console.error('Error loading data:', err);
      toast.error('Məlumatlar yüklənərkən xəta baş verdi: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [schoolId, categoryId]);

  const handleFormDataChange = useCallback((newData: DataEntryFormData) => {
    console.log('Form data changed:', newData);
    setFormData(newData);
    setIsDataModified(true);
    setAutoSaveState(prev => ({ ...prev, pendingChanges: true, error: null }));
  }, []);

  const handleFieldChange = useCallback((columnId: string, value: any) => {
    console.log('Field changed:', { columnId, value });
    setFormData(prev => {
      const newData = { ...prev, [columnId]: value };
      setIsDataModified(true);
      setAutoSaveState(prevState => ({ ...prevState, pendingChanges: true, error: null }));
      return newData;
    });
  }, []);

  const performSave = useCallback(async (status: EntryStatus = 'draft', isAutoSave = false): Promise<boolean> => {
    if (!schoolId || !categoryId || !user) {
      console.error('PerformSave: Missing required data', { schoolId, categoryId, user: !!user });
      return false;
    }

    try {
      if (isAutoSave) {
        setAutoSaveState(prev => ({ ...prev, attempts: prev.attempts + 1 }));
      } else {
        setIsSaving(true);
      }
      
      console.log('Saving data:', { formData, status, isAutoSave });
      
      // Only save non-empty values
      const entriesToSave = Object.entries(formData)
        .filter(([_, value]) => value !== null && value !== undefined && String(value).trim() !== '')
        .map(([columnId, value]) => ({
          school_id: schoolId,
          category_id: categoryId,
          column_id: columnId,
          value: String(value),
          status,
          created_by: user.id,
          updated_at: new Date().toISOString()
        }));

      console.log('Entries to save:', entriesToSave);

      if (entriesToSave.length === 0) {
        console.log('No data to save');
        if (!isAutoSave) {
          toast.info('Saxlamaq üçün məlumat yoxdur');
        }
        return true;
      }

      const { error } = await supabase
        .from('data_entries')
        .upsert(entriesToSave, {
          onConflict: 'school_id,category_id,column_id'
        });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      const now = new Date();
      setLastSaved(now);
      setIsDataModified(false);
      setEntryStatus(status);
      lastFormDataRef.current = JSON.stringify(formData);
      
      if (isAutoSave) {
        setAutoSaveState(prev => ({
          ...prev,
          lastSave: now,
          pendingChanges: false,
          error: null,
          attempts: 0
        }));
        console.log('Auto-save successful');
      } else {
        setAutoSaveState(prev => ({ ...prev, pendingChanges: false, error: null }));
        toast.success('Məlumatlar uğurla saxlanıldı');
      }
      
      return true;
    } catch (err: any) {
      console.error('Error saving data:', err);
      
      if (isAutoSave) {
        setAutoSaveState(prev => ({
          ...prev,
          error: err.message,
          attempts: prev.attempts + 1
        }));
        
        // Only show toast for auto-save errors after multiple attempts
        if (autoSaveState.attempts >= 2) {
          toast.error('Avtomatik saxlama xətası. Zəhmət olmasa manual saxlayın.');
        }
      } else {
        toast.error('Məlumatlar saxlanılan zaman xəta baş verdi: ' + err.message);
      }
      
      return false;
    } finally {
      if (!isAutoSave) {
        setIsSaving(false);
      }
    }
  }, [formData, schoolId, categoryId, user, autoSaveState.attempts]);

  const handleSave = useCallback(async (status: EntryStatus = 'draft') => {
    return await performSave(status, false);
  }, [performSave]);

  const handleSubmit = useCallback(async () => {
    if (!schoolId || !categoryId) return false;

    try {
      setIsSubmitting(true);
      
      // Clear any pending auto-save before submitting
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
        autoSaveTimeoutRef.current = null;
      }
      
      const success = await performSave('pending', false);
      if (success) {
        toast.success('Məlumatlar təsdiq üçün göndərildi');
        setAutoSaveState(prev => ({ ...prev, pendingChanges: false }));
      }
      return success;
    } catch (err: any) {
      console.error('Error submitting data:', err);
      toast.error('Məlumatlar göndərilərkən xəta baş verdi: ' + err.message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [performSave, schoolId, categoryId]);

  const resetForm = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
      autoSaveTimeoutRef.current = null;
    }
    
    setFormData({});
    setIsDataModified(false);
    setEntryStatus('draft');
    setLastSaved(null);
    lastFormDataRef.current = '';
    
    setAutoSaveState(prev => ({
      ...prev,
      lastSave: null,
      pendingChanges: false,
      error: null,
      attempts: 0
    }));
  }, []);

  // Auto-save effect
  useEffect(() => {
    if (!enableAutoSave || !autoSaveState.isEnabled || !autoSaveState.pendingChanges || isSaving || isSubmitting) {
      return;
    }

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Only auto-save if data has actually changed
    const currentFormDataString = JSON.stringify(formData);
    if (currentFormDataString === lastFormDataRef.current) {
      return;
    }

    console.log('Setting auto-save timeout');
    // Set new timeout
    autoSaveTimeoutRef.current = setTimeout(async () => {
      console.log('Auto-save timeout triggered');
      if (autoSaveState.pendingChanges && schoolId && categoryId) {
        await performSave('draft', true);
      }
    }, autoSaveState.interval);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
        autoSaveTimeoutRef.current = null;
      }
    };
  }, [
    enableAutoSave,
    autoSaveState.isEnabled,
    autoSaveState.pendingChanges,
    autoSaveState.interval,
    formData,
    isSaving,
    isSubmitting,
    schoolId,
    categoryId,
    // performSave
  ]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [user, assignmentFilter]);

  // Debug effect for categoryId and schoolId changes
  useEffect(() => {
    console.log('UseEffect dependency change:', { schoolId, categoryId });
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
    
    // Auto-save state
    autoSaveState,
    
    // Enhanced operations
    handleFormDataChange,
    handleFieldChange,
    handleSubmit,
    handleSave,
    resetForm,
    // loadData
  };
};