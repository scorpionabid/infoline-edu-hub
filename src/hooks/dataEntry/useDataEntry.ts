import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { useValidation } from './validation';
import { CategoryWithColumns } from '@/types/column';
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
  
  // Safe form data handling
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    if (!name) return;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setIsDataModified(true);
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (!schoolId || !currentCategory?.id) {
        throw new Error('Missing required school or category ID');
      }

      // Convert form data to entries format
      const entriesToSave = Object.entries(formData).map(([columnId, value]) => ({
        column_id: columnId,
        category_id: currentCategory.id,
        school_id: schoolId,
        value: String(value || ''),
        status: 'pending' as DataEntryStatus
      }));

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

  // Handle save as draft
  const handleSave = useCallback(async () => {
    setIsAutoSaving(true);
    
    try {
      if (!schoolId || !currentCategory?.id) {
        throw new Error('Missing required school or category ID');
      }

      // Convert form data to entries format
      const entriesToSave = Object.entries(formData).map(([columnId, value]) => ({
        column_id: columnId,
        category_id: currentCategory.id,
        school_id: schoolId,
        value: String(value || ''),
        status: 'draft' as DataEntryStatus
      }));

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
  }, []);

  // Handle category change
  const handleCategoryChange = useCallback((category: CategoryWithColumns) => {
    setCurrentCategory(category);
    setSelectedCategory(category);
    
    // Reset form data when category changes
    setFormData({});
    
    // Load existing data for this category
    if (schoolId && category.id) {
      loadDataForCategory(schoolId, category.id);
    }
  }, [schoolId]);

  // Load data for specific category
  const loadDataForCategory = useCallback(async (schoolId: string, categoryId: string) => {
    setLoadingEntry(true);
    setEntryError(null);
    
    try {
      const { data, error } = await supabase
        .from('data_entries')
        .select('*')
        .eq('school_id', schoolId)
        .eq('category_id', categoryId);

      if (error) throw error;

      // Convert entries to form data
      const newFormData: Record<string, string> = {};
      if (data && Array.isArray(data)) {
        data.forEach(entry => {
          if (entry.column_id && entry.value !== null) {
            newFormData[entry.column_id] = String(entry.value);
          }
        });
      }

      setFormData(newFormData);
      setEntries(data || []);
    } catch (err: any) {
      console.error('Error loading category data:', err);
      setEntryError(err.message || 'Failed to load data');
    } finally {
      setLoadingEntry(false);
    }
  }, []);
  
  const loadCategories = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('priority', { ascending: true });
      
      if (error) throw error;
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        setCategories([]);
        setLoading(false);
        return;
      }
      
      // Kategoriler için sütunları yükle
      const columnsPromises = data.map(async (category) => {
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
      });
      
      const categoriesWithColumns = await Promise.all(columnsPromises);
      setCategories(categoriesWithColumns);
      
      if (categoryId) {
        setSelectedCategory(categoriesWithColumns.find(cat => cat.id === categoryId));
      }
      
    } catch (err: any) {
      console.error('Kategoriler yüklenirken hata:', err);
      setError(err.message || 'Kategoriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  
  // Belirli bir okul için veri yükle
  const loadDataForSchool = useCallback(async (schoolId: string) => {
    try {
      setLoading(true);
      
      // Önce kategorileri yükle
      await loadCategories();
      
      // Sonra bu okul için verileri yükle
      const { data, error } = await supabase
        .from('data_entries')
        .select('*')
        .eq('school_id', schoolId);
      
      if (error) throw error;
      
      if (data && Array.isArray(data)) {
        setEntries(data);
      }
      
    } catch (err: any) {
      console.error('Okul verileri yüklenirken hata:', err);
      setError(err.message || 'Okul verileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [loadCategories]);
  
  // Veri girişi değişikliğini işle
  const handleEntriesChange = useCallback((updatedEntries: DataEntry[]) => {
    if (!Array.isArray(updatedEntries)) {
      console.error('handleEntriesChange: updatedEntries is not an array', updatedEntries);
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      entries: updatedEntries
    }));
    
    setIsDataModified(true);
  }, []);
  
  // Kaydet
  const handleSaveFunc = useCallback(async () => {
    try {
      setSaveStatus(DataEntrySaveStatus.SAVING);
      
      if (!schoolId || !categoryId) {
        throw new Error('School ID or Category ID is missing');
      }
      
      if (!Array.isArray(formData.entries)) {
        throw new Error('Entries must be an array');
      }
      
      // Mevcut girişleri güncelle veya yeni girişler oluştur
      for (const entry of formData.entries) {
        if (entry.id) {
          // Mevcut giriş - güncelle
          const { error } = await supabase
            .from('data_entries')
            .update({
              value: entry.value,
              updated_at: new Date().toISOString()
            })
            .eq('id', entry.id);
          
          if (error) throw error;
        } else {
          // Yeni giriş - oluştur
          const { error } = await supabase
            .from('data_entries')
            .insert({
              school_id: schoolId,
              category_id: categoryId,
              column_id: entry.columnId,
              value: entry.value,
              status: 'draft',
              created_by: user?.id
            });
          
          if (error) throw error;
        }
      }
      
      setIsDataModified(false);
      setSaveStatus(DataEntrySaveStatus.SAVED);
      
      toast({
        title: t('success'),
        description: t('dataSavedSuccessfully'),
      });
      
      // Verileri tekrar yükle
      await loadDataForSchool(schoolId);
      
    } catch (err: any) {
      console.error('Veriler kaydedilirken hata:', err);
      setSaveStatus(DataEntrySaveStatus.ERROR);
      
      toast({
        title: t('error'),
        description: err.message || t('errorSavingData'),
        variant: 'destructive'
      });
    }
  }, [formData, schoolId, categoryId, user, toast, t, loadDataForSchool]);
  
  // Onay için gönder
  const handleSubmitForApproval = useCallback(async () => {
    try {
      setSubmitting(true);
      
      if (!schoolId || !categoryId) {
        throw new Error('School ID or Category ID is missing');
      }
      
      // Önce kaydet
      await handleSaveFunc();
      
      // Sonra durumu 'pending' olarak güncelle
      const { error } = await supabase
        .from('data_entries')
        .update({
          status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('school_id', schoolId)
        .eq('category_id', categoryId);
      
      if (error) throw error;
      
      toast({
        title: t('success'),
        description: t('dataSubmittedForApproval'),
      });
      
      if (onComplete) onComplete();
      
    } catch (err: any) {
      console.error('Veriler onay için gönderilirken hata:', err);
      
      toast({
        title: t('error'),
        description: err.message || t('errorSubmittingData'),
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  }, [schoolId, categoryId, handleSaveFunc, toast, t, onComplete]);
  
  // Kategori verilerini onay için gönder
  const submitForApproval = useCallback(async () => {
    await handleSubmitForApproval();
  }, [handleSubmitForApproval]);
  
  // İlk yükleme
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('priority', { ascending: true });
        
        if (error) throw error;
        
        if (!data || !Array.isArray(data) || data.length === 0) {
          setCategories([]);
          setLoading(false);
          return;
        }
        
        // Load columns for categories
        const columnsPromises = data.map(async (category) => {
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
        });
        
        const categoriesWithColumns = await Promise.all(columnsPromises);
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
    };

    loadCategories();
  }, [categoryId]);

  // Load data when category and school are selected
  useEffect(() => {
    if (currentCategory && schoolId) {
      loadDataForCategory(schoolId, currentCategory.id);
    }
  }, [currentCategory, schoolId, loadDataForCategory]);
  
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
    handleSubmit,
    handleSave: handleSaveFunc,
    handleReset,
    handleCategoryChange,
    loadDataForSchool: () => {}, // Placeholder
    entries,
    submitForApproval: () => Promise.resolve(), // Placeholder
    saveStatus,
    isDataModified,
    error,
    entryStatus,
    entryError,
    entryId
  };
};

export default useDataEntry;
