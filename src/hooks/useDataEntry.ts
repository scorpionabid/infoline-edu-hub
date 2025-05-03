import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import { useCategoryData } from './dataEntry/useCategoryData';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';

interface UseDataEntryProps {
  schoolId?: string | null;
  initialCategoryId?: string | null;
  statusFilter?: string | null;
}

export const useDataEntry = ({
  schoolId,
  initialCategoryId,
  statusFilter
}: UseDataEntryProps = {}) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategoryData(schoolId || undefined);
  
  const [currentCategory, setCurrentCategory] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [loadingEntry, setLoadingEntry] = useState(true);
  const [entryError, setEntryError] = useState<string | null>(null);
  const [entryStatus, setEntryStatus] = useState<Record<string, string>>({});
  const [entryId, setEntryId] = useState<string | null>(null);
  
  // Kateqoriyaları yüklədikdən sonra ilk kateqoriyanı və ya seçilmiş kateqoriyanı təyin edirik
  useEffect(() => {
    if (!categoriesLoading && categories && categories.length > 0) {
      if (initialCategoryId) {
        const category = categories.find(c => c.id === initialCategoryId);
        if (category) {
          setCurrentCategory(category);
        } else {
          setCurrentCategory(categories[0]);
        }
      } else {
        setCurrentCategory(categories[0]);
      }
    }
  }, [categories, categoriesLoading, initialCategoryId]);
  
  // Məktəb və kateqoriya üçün mövcud məlumatları yükləyirik
  useEffect(() => {
    const fetchExistingEntries = async () => {
      if (!schoolId || !currentCategory) {
        setLoadingEntry(false);
        return;
      }
      
      setLoadingEntry(true);
      try {
        // Bütün kateqoriyalar üçün statusları əldə edirik
        const { data: statusData, error: statusError } = await supabase
          .from('data_entries')
          .select('id, category_id, status')
          .eq('school_id', schoolId);
          
        if (statusError) throw statusError;
        
        // Statusları qeyd edirik
        const statuses: Record<string, string> = {};
        statusData?.forEach(entry => {
          statuses[entry.category_id] = entry.status;
        });
        setEntryStatus(statuses);
        
        // Cari kateqoriya üçün məlumatları əldə edirik
        const { data: entryData, error: entryError } = await supabase
          .from('data_entries')
          .select('id, column_id, value, status')
          .eq('school_id', schoolId)
          .eq('category_id', currentCategory.id);
          
        if (entryError) throw entryError;
        
        if (entryData && entryData.length > 0) {
          // Məlumatları formData formatına çeviririk
          const formattedData: Record<string, any> = {};
          entryData.forEach(entry => {
            formattedData[entry.column_id] = entry.value;
          });
          
          setFormData(formattedData);
          setEntryId(entryData[0].id); // Eyni kateqoriya üçün bütün sütunlar eyni ID-yə malik olmalıdır
        } else {
          setFormData({});
          setEntryId(null);
        }
      } catch (error: any) {
        console.error('Məlumatları yükləyərkən xəta:', error);
        setEntryError(error.message);
      } finally {
        setLoadingEntry(false);
      }
    };
    
    fetchExistingEntries();
  }, [schoolId, currentCategory]);
  
  // Form məlumatlarını yeniləyirik
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);
  
  // Formu təmizləyirik
  const handleReset = useCallback(() => {
    if (window.confirm(t('confirmReset'))) {
      setFormData({});
    }
  }, [t]);
  
  // Qaralama olaraq saxlayırıq
  const handleSave = useCallback(async () => {
    if (!schoolId || !currentCategory || !user?.id) {
      toast.error(t('missingRequiredFields'));
      return;
    }
    
    setIsAutoSaving(true);
    try {
      // Əvvəlcə köhnə məlumatları silirik (əgər varsa)
      if (entryId) {
        const { error: deleteError } = await supabase
          .from('data_entries')
          .delete()
          .eq('school_id', schoolId)
          .eq('category_id', currentCategory.id);
          
        if (deleteError) throw deleteError;
      }
      
      // Sonra yeni məlumatları əlavə edirik
      const entries = Object.entries(formData).map(([columnId, value]) => ({
        school_id: schoolId,
        category_id: currentCategory.id,
        column_id: columnId,
        value: String(value || ''),
        status: 'draft',
        created_by: user.id,
        updated_at: new Date().toISOString()
      }));
      
      if (entries.length > 0) {
        const { error: insertError } = await supabase
          .from('data_entries')
          .insert(entries);
          
        if (insertError) throw insertError;
      }
      
      // Status məlumatlarını yeniləyirik
      setEntryStatus(prev => ({
        ...prev,
        [currentCategory.id]: 'draft'
      }));
      
      toast.success(t('draftSaved'));
    } catch (error: any) {
      console.error('Məlumatları saxlayarkən xəta:', error);
      toast.error(t('errorSavingData'));
    } finally {
      setIsAutoSaving(false);
    }
  }, [schoolId, currentCategory, formData, entryId, user?.id, t]);
  
  // Təsdiq üçün göndəririk
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!schoolId || !currentCategory || !user?.id) {
      toast.error(t('missingRequiredFields'));
      return;
    }
    
    // Bütün məcburi sahələri yoxlayırıq
    const requiredFields = currentCategory.columns.filter(col => col.is_required).map(col => col.id);
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      toast.error(t('fillRequiredFields'));
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Əvvəlcə köhnə məlumatları silirik (əgər varsa)
      if (entryId) {
        const { error: deleteError } = await supabase
          .from('data_entries')
          .delete()
          .eq('school_id', schoolId)
          .eq('category_id', currentCategory.id);
          
        if (deleteError) throw deleteError;
      }
      
      // Sonra yeni məlumatları əlavə edirik
      const entries = Object.entries(formData).map(([columnId, value]) => ({
        school_id: schoolId,
        category_id: currentCategory.id,
        column_id: columnId,
        value: String(value || ''),
        status: 'pending',
        created_by: user.id,
        updated_at: new Date().toISOString()
      }));
      
      if (entries.length > 0) {
        const { error: insertError } = await supabase
          .from('data_entries')
          .insert(entries);
          
        if (insertError) throw insertError;
      }
      
      // Status məlumatlarını yeniləyirik
      setEntryStatus(prev => ({
        ...prev,
        [currentCategory.id]: 'pending'
      }));
      
      toast.success(t('dataSubmitted'));
    } catch (error: any) {
      console.error('Məlumatları göndərərkən xəta:', error);
      toast.error(t('errorSubmittingData'));
    } finally {
      setIsSubmitting(false);
    }
  }, [schoolId, currentCategory, formData, entryId, user?.id, t]);
  
  // Kateqoriyanı dəyişirik
  const handleCategoryChange = useCallback((category: any) => {
    setCurrentCategory(category);
  }, []);
  
  return {
    formData,
    isAutoSaving,
    isSubmitting,
    handleInputChange,
    handleSubmit,
    handleSave,
    handleReset,
    handleCategoryChange,
    currentCategory,
    loadingEntry,
    entryStatus,
    entryError,
    entryId
  };
};
