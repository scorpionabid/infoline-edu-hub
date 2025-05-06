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
  const [formData, setFormData] = useState<any>({
    schoolId: schoolId || '',
    categoryId: categoryId || '',
    entries: []
  });
  
  const [categories, setCategories] = useState<CategoryWithColumns[]>([]);
  const [entries, setEntries] = useState<DataEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<DataEntrySaveStatus>(DataEntrySaveStatus.IDLE);
  const [isDataModified, setIsDataModified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryWithColumns | undefined>(undefined);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const validation = useValidation(categories, formData.entries);
  
  // Kategorileri yüklə
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
  }, [categoryId]);
  
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
  const handleSave = useCallback(async () => {
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
      await handleSave();
      
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
  }, [schoolId, categoryId, handleSave, toast, t, onComplete]);
  
  // Kategori verilerini onay için gönder
  const submitForApproval = useCallback(async () => {
    await handleSubmitForApproval();
  }, [handleSubmitForApproval]);
  
  // İlk yükleme
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);
  
  // Belirli bir kategori seçildiğinde
  useEffect(() => {
    if (categories.length > 0 && categoryId) {
      const category = categories.find(c => c.id === categoryId);
      setSelectedCategory(category);
    }
  }, [categories, categoryId]);
  
  return {
    formData,
    updateFormData: setFormData,
    categories,
    selectedCategory,
    loading,
    submitting,
    handleEntriesChange,
    handleSave,
    handleSubmitForApproval,
    loadDataForSchool,
    entries,
    submitForApproval,
    saveStatus,
    isDataModified,
    error
  };
};

export default useDataEntry;
