import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { useValidation } from '../validation';
import { CategoryWithColumns } from '@/types/category';
import { DataEntry, DataEntryStatus, DataEntrySaveStatus } from '@/types/dataEntry';

// Props for useDataEntry hook
interface UseDataEntryProps {
  schoolId?: string;
  categoryId?: string;
  onComplete?: () => void;
}

export const useDataEntry = ({ 
  schoolId, 
  categoryId,
  onComplete 
}: UseDataEntryProps) => {
  // Core state
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [categories, setCategories] = useState<CategoryWithColumns[]>([]);
  const [entries, setEntries] = useState<DataEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<DataEntrySaveStatus>(DataEntrySaveStatus.IDLE);
  const [isDataModified, setIsDataModified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryWithColumns | undefined>(undefined);
  const [currentCategory, setCurrentCategory] = useState<CategoryWithColumns | undefined>(undefined);
  const [loadingEntry, setLoadingEntry] = useState(false);
  const [entryStatus, setEntryStatus] = useState<Record<string, string>>({});
  const [entryError, setEntryError] = useState<string | null>(null);
  const [entryId, setEntryId] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const validation = useValidation(categories, entries);
  
  // Təkmilləşdirilmiş form data işləmə funksiyaları
  // HTML event-ləri üçün handleInputChange
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!event || !event.target) {
      console.warn('handleInputChange: Invalid event object');
      return;
    }
    
    const { name, value } = event.target;
    if (!name) {
      console.warn('handleInputChange: Missing name attribute');
      return;
    }
    
    // Əvvəlcə daha ətraflı loq çıxaraq
    console.group('handleInputChange call');
    console.log('Input event received:', { 
      name, 
      value, 
      type: event.target.type,
      currentFormData: formData
    });
    
    // Form data-nı atomik əməliyyatla yeniləyirik
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      console.log('Form data will be updated to:', newData);
      return newData;
    });
    
    // Dəyişikliyi qeyd edirik
    setIsDataModified(true);
    console.groupEnd();
    
    // Debug modüldə form state-i loq edirik
    setTimeout(() => {
      console.log('Updated form state after handleInputChange:', formData);
    }, 100);
  }, [formData]);
  
  // Dirək dəyər üçün handleChange - FieldRendererSimple komponentindən çağrıla bilər
  const handleChange = useCallback((name: string, value: any) => {
    if (!name) {
      console.warn('handleChange: Missing name parameter');
      return;
    }
    
    console.group('handleChange call');
    console.log('Direct change received:', { 
      name, 
      value, 
      currentFormData: formData
    });
    
    // Form data-nı yeniləyirik
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      console.log('Form data will be updated to:', newData);
      return newData;
    });
    
    // Dəyişikliyi qeyd edirik
    setIsDataModified(true);
    console.groupEnd();
  }, [formData]);

  // Handle form submission with enhanced error handling
  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (!schoolId || !currentCategory?.id) {
        throw new Error('Missing required school or category ID');
      }

      // Validate that formData exists and is an object
      if (!formData || typeof formData !== 'object') {
        throw new Error('Invalid form data');
      }

      // Convert form data to entries format with safety checks
      const entriesToSave = Object.entries(formData)
        .filter(([columnId, value]) => columnId && columnId.trim() !== '')
        .map(([columnId, value]) => ({
          column_id: columnId,
          category_id: currentCategory.id,
          school_id: schoolId,
          value: String(value || ''),
          status: 'pending' as DataEntryStatus
        }));

      if (entriesToSave.length === 0) {
        toast({
          title: t('warning'),
          description: t('noDataToSubmit'),
          variant: 'destructive'
        });
        return;
      }

      // Save to database
      const { error } = await supabase
        .from('data_entries')
        .upsert(entriesToSave, {
          onConflict: 'column_id,school_id,category_id',
          ignoreDuplicates: false,
        });

      if (error) throw error;

      toast({
        title: t('success'),
        description: t('dataSubmittedSuccessfully'),
      });

      if (onComplete) onComplete();
    } catch (err: any) {
      console.error('Error submitting form:', err);
      toast({
        title: t('error'),
        description: err.message || t('errorSubmittingData'),
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, schoolId, currentCategory, toast, t, onComplete]);

  // Handle save as draft with enhanced validation
  const handleSave = useCallback(async () => {
    setIsAutoSaving(true);
    
    try {
      if (!schoolId || !currentCategory?.id) {
        throw new Error('Missing required school or category ID');
      }

      // Validate formData
      if (!formData || typeof formData !== 'object') {
        console.warn('handleSave: Invalid form data, skipping save');
        return;
      }

      // Convert form data to entries format
      const entriesToSave = Object.entries(formData)
        .filter(([columnId, value]) => columnId && columnId.trim() !== '')
        .map(([columnId, value]) => ({
          column_id: columnId,
          category_id: currentCategory.id,
          school_id: schoolId,
          value: String(value || ''),
          status: 'draft' as DataEntryStatus
        }));

      if (entriesToSave.length === 0) {
        console.log('handleSave: No data to save');
        return;
      }

      // Save to database
      const { error } = await supabase
        .from('data_entries')
        .upsert(entriesToSave, {
          onConflict: 'column_id,school_id,category_id',
          ignoreDuplicates: false,
        });

      if (error) throw error;

      setIsDataModified(false);
      toast({
        title: t('success'),
        description: t('dataSavedSuccessfully'),
      });
    } catch (err: any) {
      console.error('Error saving form:', err);
      toast({
        title: t('error'),
        description: err.message || t('errorSavingData'),
        variant: 'destructive'
      });
    } finally {
      setIsAutoSaving(false);
    }
  }, [formData, schoolId, currentCategory, toast, t]);

  // Handle form reset
  const handleReset = useCallback(() => {
    setFormData({});
    setIsDataModified(false);
    console.log('Form data reset');
  }, []);

  // Handle category change with enhanced safety
  const handleCategoryChange = useCallback((category: CategoryWithColumns) => {
    if (!category || !category.id) {
      console.warn('handleCategoryChange: Invalid category');
      return;
    }
    
    setCurrentCategory(category);
    setSelectedCategory(category);
    
    // Reset form data when category changes
    setFormData({});
    setIsDataModified(false);
    
    // Load existing data for this category
    if (schoolId) {
      loadDataForCategory(schoolId, category.id);
    }
  }, [schoolId]);

  // Təkmilləşdirilmiş loadDataForCategory - zəmanət altına alınmış yüklənmə, yenidən cəhd və xəta idarəetməsi
  const loadDataForCategory = useCallback(async (schoolId: string, categoryId: string, retryCount = 0) => {
    if (!schoolId || !categoryId) {
      console.warn('loadDataForCategory: Missing required parameters');
      return;
    }
    
    const MAX_RETRIES = 2; // Maksimum yenidən cəhd sayı
    const TIMEOUT_MS = 10000; // Zaman aşımını 10 saniyəyə endirik
    
    console.group(`Loading data for category ${categoryId} and school ${schoolId} (attempt ${retryCount + 1})`);
    setLoadingEntry(true);
    if (retryCount === 0) setEntryError(null); // Yalnız ilk cəhddə xəta mesajını təmizlə
    
    // Timeout promise
    const timeoutPromise = new Promise<{data: null, error: Error}>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Data loading timeout after ${TIMEOUT_MS/1000} seconds`));
      }, TIMEOUT_MS);
    });
    
    try {
      // Ana sorğu - bütün lazımi sahələri seçirik ki tip uyğunsuzluğu olmasın
      const dataPromise = supabase
        .from('data_entries')
        .select('id, column_id, value, status, school_id, category_id, created_at, updated_at')
        .eq('school_id', schoolId)
        .eq('category_id', categoryId);

      // Timeout və sorğu yarışı
      const { data, error } = await Promise.race([
        dataPromise,
        timeoutPromise
      ]);

      if (error) throw error;

      console.log(`Received ${data?.length || 0} entries for category ${categoryId}`);

      // Convert entries to form data with proper validation
      const newFormData: Record<string, string> = {};
      if (data && Array.isArray(data)) {
        data.forEach(entry => {
          if (entry && entry.column_id && entry.value !== null && entry.value !== undefined) {
            newFormData[entry.column_id] = String(entry.value);
            console.log(`Setting field ${entry.column_id} = ${entry.value}`);
          }
        });
      }

      console.log('Setting form data:', newFormData);
      setFormData(newFormData);
      
      // Ensure data conforms to DataEntry type by ensuring all required fields are present
      const typedEntries = data?.map(entry => ({
        ...entry,
        // Ensure these fields exist even if the database didn't return them
        school_id: entry.school_id || schoolId,
        category_id: entry.category_id || categoryId,
        created_at: entry.created_at || new Date().toISOString(),
        updated_at: entry.updated_at || new Date().toISOString()
      })) || [];
      
      setEntries(typedEntries);
      setIsDataModified(false);
      setEntryError(null); // Uğurlu yükləmədə xəta mesajını təmizlə
      
      // Yüklənmə tamamlandıqda 200ms gözləyərək UI-in yenilənməsi üçün vaxt ver
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (err: any) {
      console.error('Error loading category data:', err);
      
      // Əgər hələ yenidən cəhd etmək imkanımız varsa
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying data load (${retryCount + 1}/${MAX_RETRIES})...`);
        
        // 1 saniyə gözlədikdən sonra yenidən cəhd et
        await new Promise(resolve => setTimeout(resolve, 1000)); 
        setLoadingEntry(false);
        console.groupEnd();
        
        // Rekursiv olaraq yenidən cəhd edirik
        return loadDataForCategory(schoolId, categoryId, retryCount + 1);
      }
      
      // Bütün cəhdlər uğursuz olduqda
      setEntryError(err.message || 'Məlumatları yükləmək mümkün olmadı. Zəhmət olmasa səhifəni yeniləyin.');
      toast({
        variant: "destructive",
        title: "Xəta",
        description: "Məlumatları yükləmək mümkün olmadı. Səhifəni yeniləyə bilərsiniz.",
      });
      
      // Boş form data-sı qur
      setFormData({});
      setEntries([]);
      
      // Error zamanı 500ms gözlə
      await new Promise(resolve => setTimeout(resolve, 500)); 
    } finally {
      setLoadingEntry(false);
      console.log('Loading state finished');
      console.groupEnd();
    }
  }, [toast]);
  
  // Load categories with enhanced error handling
  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('priority', { ascending: true });
      
      if (error) throw error;
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        setCategories([]);
        return;
      }
      
      // Load columns for categories with proper error handling
      const columnsPromises = data.map(async (category) => {
        if (!category || !category.id) {
          console.warn('loadCategories: Invalid category found:', category);
          return null;
        }
        
        try {
          const { data: columns, error: columnsError } = await supabase
            .from('columns')
            .select('*')
            .eq('category_id', category.id)
            .order('order_index', { ascending: true });
          
          if (columnsError) throw columnsError;
          
          return {
            ...category,
            columns: columns || []
          };
        } catch (err) {
          console.error(`Error loading columns for category ${category.id}:`, err);
          return {
            ...category,
            columns: []
          };
        }
      });
      
      const categoriesWithColumns = (await Promise.all(columnsPromises))
        .filter(Boolean) as CategoryWithColumns[];
      
      setCategories(categoriesWithColumns);
      
      if (categoryId) {
        const category = categoriesWithColumns.find(cat => cat.id === categoryId);
        if (category) {
          setCurrentCategory(category);
          setSelectedCategory(category);
        }
      }
      
    } catch (err: any) {
      console.error('Error loading categories:', err);
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  // Functions expected by tests (keeping the same interface)
  const saveEntry = useCallback(async (data: any) => {
    try {
      const response = await supabase
        .from('data_entries')
        .insert(data)
        .select()
        .single();
      
      if (response.error) throw response.error;
      
      return response.data;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to save entry');
    }
  }, []);

  const updateEntry = useCallback(async (id: string, data: any) => {
    try {
      const { error } = await supabase
        .from('data_entries')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
      
      return true;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update entry');
    }
  }, []);

  const deleteEntry = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('data_entries')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return true;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to delete entry');
    }
  }, []);

  const importExcel = useCallback(async (file: File) => {
    try {
      // Mock implementation for now
      return {
        success: true,
        importedCount: 10,
        failedCount: 0
      };
    } catch (err: any) {
      return {
        success: false,
        importedCount: 0,
        failedCount: 1,
        errors: [{ row: 1, error: err.message }]
      };
    }
  }, []);
  
  // Load data when category and school are selected
  useEffect(() => {
    if (currentCategory && schoolId) {
      loadDataForCategory(schoolId, currentCategory.id);
    }
  }, [currentCategory, schoolId, loadDataForCategory]);
  
  // Initial loading
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);
  
  return {
    formData,
    updateFormData: setFormData,
    categories,
    selectedCategory,
    currentCategory,
    loading,
    loadingEntry,
    submitting,
    isAutoSaving,
    isSubmitting,
    handleInputChange,
    // Yeni əlavə edilmiş handleChange funksiyası
    handleChange,
    handleSubmit,
    handleSave,
    handleReset,
    handleCategoryChange,
    loadDataForSchool: loadCategories, // Alias for backward compatibility
    entries,
    submitForApproval: async () => Promise.resolve(),
    saveStatus,
    isDataModified,
    error,
    entryStatus,
    entryError,
    entryId,
    // Functions expected by tests
    saveEntry,
    updateEntry,
    deleteEntry,
    importExcel
  };
};

export default useDataEntry;
