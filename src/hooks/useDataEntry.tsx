
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { Column } from '@/types/column';
import { useValidation } from './validation';
import { DataEntryForm, CategoryEntryData } from '@/types/form';

interface UseDataEntryProps {
  initialFormData?: DataEntryForm;
  schoolId?: string;
  categories?: any[];
}

export const useDataEntry = ({
  initialFormData,
  schoolId,
  categories = []
}: UseDataEntryProps) => {
  const [formData, setFormData] = useState<DataEntryForm>(
    initialFormData || {
      id: '',
      schoolId: schoolId || '',
      status: 'draft',
      categories: [],
      overallCompletionPercentage: 0
    }
  );
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const validation = useValidation(); // Düzəldiləcək

  // Formun kategori və sütunlarını hazırla
  const initializeForm = useCallback((categories: any[]) => {
    if (!categories || categories.length === 0) return;
    
    const categoryData = categories.map(category => {
      // Kateqoriya üçün sətirlər (entries) yaradın
      const entries = category.columns.map((column: Column) => ({
        columnId: column.id,
        value: '',
        errors: [],
        touched: false
      }));

      return {
        categoryId: category.id,
        entries,
        completionPercentage: 0
      };
    });

    setFormData(prev => ({
      ...prev,
      categories: categoryData,
      overallCompletionPercentage: 0
    }));
  }, []);

  useEffect(() => {
    if (categories && categories.length > 0) {
      initializeForm(categories);
    }
  }, [categories, initializeForm]);

  // Form dəyəri yeniləyin
  const updateValue = useCallback((categoryId: string, columnId: string, value: any) => {
    setFormData(prevData => {
      const newData = { ...prevData };
      
      // Əvvəlcə lazımi kateqoriyanı tapın
      const categoryIndex = newData.categories.findIndex(cat => cat.categoryId === categoryId);
      if (categoryIndex === -1) return prevData;
      
      // Sonra, lazımi sütunu tapın
      const entryIndex = newData.categories[categoryIndex].entries.findIndex(entry => entry.columnId === columnId);
      if (entryIndex === -1) return prevData;
      
      // Dəyəri yeniləyin və toxunulmuş olaraq işarələyin
      newData.categories[categoryIndex].entries[entryIndex].value = value;
      newData.categories[categoryIndex].entries[entryIndex].touched = true;
      
      // Xətaları təmizləyin (yeni dəyər üçün doğrulanma daha sonra aparılacaq)
      newData.categories[categoryIndex].entries[entryIndex].errors = [];
      
      // Dəyişikliklər bildirildi
      setHasPendingChanges(true);
      
      return newData;
    });
  }, []);

  // Tamamlanma faizini yenidən hesablayın
  const recalculateCompletionPercentage = useCallback(() => {
    setFormData(prevData => {
      const newData = { ...prevData };
      
      // Hər kateqoriya üçün tamamlanma faizini hesablayın
      newData.categories.forEach((category, catIndex) => {
        const totalEntries = category.entries.length;
        if (totalEntries === 0) {
          newData.categories[catIndex].completionPercentage = 100;
          return;
        }
        
        const filledEntries = category.entries.filter(entry => entry.value !== '' && entry.value !== null && entry.value !== undefined).length;
        const percentage = Math.round((filledEntries / totalEntries) * 100);
        newData.categories[catIndex].completionPercentage = percentage;
      });
      
      // Ümumi tamamlanma faizini hesablayın
      const totalCategories = newData.categories.length;
      if (totalCategories === 0) {
        newData.overallCompletionPercentage = 0;
      } else {
        const totalPercentage = newData.categories.reduce((sum, category) => sum + category.completionPercentage, 0);
        newData.overallCompletionPercentage = Math.round(totalPercentage / totalCategories);
      }
      
      return newData;
    });
  }, []);

  // Form məlumatlarını yeniləyin (tam dəyişiklik)
  const updateFormData = useCallback((newData: Partial<DataEntryForm>) => {
    setFormData(prevData => {
      const updatedData = { ...prevData, ...newData };
      setHasPendingChanges(true);
      return updatedData;
    });
  }, []);

  // Avtomatik qeyd etmə aralığı
  useEffect(() => {
    let autoSaveTimer: NodeJS.Timeout;
    
    if (hasPendingChanges && !isSubmitting && !isSaving && user) {
      autoSaveTimer = setTimeout(() => {
        setIsAutoSaving(true);
        saveFormData(formData);
      }, 30000); // 30 saniyə
    }
    
    return () => {
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
    };
  }, [hasPendingChanges, isSubmitting, isSaving, formData, user]);

  // Form məlumatlarını verilənlər bazasında saxlayın
  const saveFormData = async (data: DataEntryForm) => {
    if (!user || !schoolId) return false;
    
    try {
      setIsSaving(true);
      
      // Əvvəlcə tamamlanma faizini hesablayın
      recalculateCompletionPercentage();
      
      // Hər bir daxil edilmiş dəyər üçün upsert əməliyyatı aparın
      const entriesBatch = [];
      
      for (const category of data.categories) {
        for (const entry of category.entries) {
          if (entry.touched) {
            entriesBatch.push({
              category_id: category.categoryId,
              column_id: entry.columnId,
              school_id: schoolId,
              value: entry.value !== undefined ? String(entry.value) : '',
              status: 'pending',
              created_by: user.id,
              updated_at: new Date().toISOString()
            });
          }
        }
      }
      
      if (entriesBatch.length > 0) {
        const { error } = await supabase
          .from('data_entries')
          .upsert(entriesBatch, { 
            onConflict: 'category_id,column_id,school_id',
            ignoreDuplicates: false
          });
        
        if (error) throw error;
      }
      
      // Məktəb tamamlanma faizini yeniləyin
      await supabase
        .from('schools')
        .update({
          completion_rate: data.overallCompletionPercentage,
          updated_at: new Date().toISOString()
        })
        .eq('id', schoolId);
      
      setLastSaved(new Date());
      setHasPendingChanges(false);
      
      return true;
    } catch (error: any) {
      console.error('Form məlumatlarını saxlayarkən xəta:', error);
      toast({
        title: t('saveError'),
        description: error.message || t('unexpectedError'),
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSaving(false);
      setIsAutoSaving(false);
    }
  };

  // İstinad edilmiş dəyəri əldə edin
  const getEntryValue = useCallback((categoryId: string, columnId: string): any => {
    const category = formData.categories.find(cat => cat.categoryId === categoryId);
    if (!category) return '';
    
    const entry = category.entries.find(entry => entry.columnId === columnId);
    return entry ? entry.value : '';
  }, [formData]);

  // Mövcud dəyərləri əldə edin
  const fetchExistingEntries = useCallback(async () => {
    if (!user || !schoolId) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('data_entries')
        .select('*')
        .eq('school_id', schoolId);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setFormData(prevData => {
          const newData = { ...prevData };
          
          data.forEach(entry => {
            const categoryIndex = newData.categories.findIndex(cat => cat.categoryId === entry.category_id);
            if (categoryIndex !== -1) {
              const entryIndex = newData.categories[categoryIndex].entries.findIndex(e => e.columnId === entry.column_id);
              if (entryIndex !== -1) {
                newData.categories[categoryIndex].entries[entryIndex].value = entry.value || '';
              }
            }
          });
          
          return newData;
        });
        
        // Tamamlanma faizini yenidən hesablayın
        recalculateCompletionPercentage();
      }
    } catch (error: any) {
      console.error('Mövcud daxiletmələri əldə edərkən xəta:', error);
      toast({
        title: t('error'),
        description: t('errorFetchingData'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [schoolId, user, recalculateCompletionPercentage, t, toast]);

  useEffect(() => {
    if (schoolId && categories.length > 0) {
      fetchExistingEntries();
    }
  }, [schoolId, categories, fetchExistingEntries]);

  const [loading, setLoading] = useState(false);

  return {
    formData,
    updateFormData,
    isAutoSaving,
    lastSaved,
    setIsAutoSaving,
    loading,
    updateValue,
    getEntryValue,
    recalculateCompletionPercentage,
    saveFormData,
    isSubmitting,
    setIsSubmitting,
    isSaving,
    validation
  };
};

export default useDataEntry;
