import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import { CategoryWithColumns } from '@/types/category';
import { DataEntry, DataEntrySaveStatus } from '@/types/dataEntry';
import { 
  getDataEntries, 
  saveDataEntryForm, 
  submitForApproval 
} from '@/services/dataEntryService';

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
  
  // State
  const [categories, setCategories] = useState<CategoryWithColumns[]>([]);
  const [currentCategory, setCurrentCategory] = useState<CategoryWithColumns | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [loadingEntry, setLoadingEntry] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [entryError, setEntryError] = useState<string | null>(null);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [entryStatus, setEntryStatus] = useState<Record<string, string>>({});
  const [entryId, setEntryId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<DataEntrySaveStatus>(DataEntrySaveStatus.IDLE);
  
  // Kateqoriyaları yüklə
  const fetchCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      setCategoriesError(null);
      
      // Burada servis qatından kateqoriyaları əldə edəcəyik
      // Hələlik birbaşa Supabase sorğusu istifadə edirik
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('status', 'active')
        .order('priority', { ascending: true });
        
      if (categoriesError) throw categoriesError;
      
      if (!categoriesData || !Array.isArray(categoriesData) || categoriesData.length === 0) {
        setCategories([]);
        return;
      }
      
      // Bütün kateqoriyalar üçün sütunları əldə edək
      const { data: columnsData, error: columnsError } = await supabase
        .from('columns')
        .select('*')
        .in('category_id', categoriesData.map(cat => cat.id))
        .eq('status', 'active')
        .order('order_index', { ascending: true });
        
      if (columnsError) throw columnsError;
      
      // Kateqoriyaları və sütunları birləşdirək
      const categoriesWithColumns = categoriesData.map(category => {
        const categoryColumns = columnsData?.filter(col => col.category_id === category.id) || [];
        return {
          ...category,
          columns: categoryColumns
        } as CategoryWithColumns;
      });
      
      setCategories(categoriesWithColumns);
      
      // İlk kateqoriyanı və ya seçilmiş kateqoriyanı təyin edirik
      if (initialCategoryId) {
        const category = categoriesWithColumns.find(c => c.id === initialCategoryId);
        if (category) {
          setCurrentCategory(category);
        } else if (categoriesWithColumns.length > 0) {
          setCurrentCategory(categoriesWithColumns[0]);
        }
      } else if (categoriesWithColumns.length > 0) {
        setCurrentCategory(categoriesWithColumns[0]);
      }
    } catch (error: any) {
      console.error('Kateqoriyaları yükləyərkən xəta:', error);
      setCategoriesError(error.message);
    } finally {
      setLoadingCategories(false);
    }
  }, [initialCategoryId]);
  
  // Məktəb və kateqoriya üçün mövcud məlumatları yükləyirik
  const fetchExistingEntries = useCallback(async () => {
    if (!schoolId || !currentCategory) {
      setLoadingEntry(false);
      return;
    }
    
    setLoadingEntry(true);
    try {
      // Servis qatından məlumatları əldə edirik
      const { success, data, error } = await getDataEntries({
        schoolId,
        categoryId: currentCategory.id,
        status: statusFilter || undefined
      });
      
      if (!success) throw new Error(error);
      
      // Statusları qeyd edirik
      const statuses: Record<string, string> = {};
      data?.forEach((entry: any) => {
        statuses[entry.categoryId] = entry.status;
      });
      setEntryStatus(statuses);
      
      // Məlumatları formData formatına çeviririk
      const formattedData: Record<string, any> = {};
      data?.forEach((entry: any) => {
        formattedData[entry.columnId] = entry.value;
      });
      
      setFormData(formattedData);
      
      // Eyni kateqoriya üçün bütün sütunlar eyni ID-yə malik olmalıdır
      if (data && data.length > 0) {
        setEntryId(data[0].id);
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
  }, [schoolId, currentCategory, statusFilter]);
  
  // Form məlumatlarını yeniləyirik
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Dəyişiklik olduğunu qeyd edirik
    setSaveStatus(DataEntrySaveStatus.IDLE);
  }, []);
  
  // Formu təmizləyirik
  const handleReset = useCallback(() => {
    if (window.confirm(t('confirmReset'))) {
      setFormData({});
      setSaveStatus(DataEntrySaveStatus.IDLE);
    }
  }, [t]);
  
  // Qaralama olaraq saxlayırıq
  const handleSave = useCallback(async () => {
    if (!schoolId || !currentCategory || !user?.id) {
      toast.error(t('missingRequiredFields'));
      return;
    }
    
    setIsAutoSaving(true);
    setSaveStatus(DataEntrySaveStatus.SAVING);
    
    try {
      // Məlumatları servis qatı vasitəsilə saxlayırıq
      const entries = Object.entries(formData).map(([columnId, value]) => ({
        columnId,
        value: String(value || ''),
        status: 'draft'
      }));
      
      const { success, error } = await saveDataEntryForm({
        id: entryId || undefined,
        schoolId,
        categoryId: currentCategory.id,
        entries,
        isModified: true,
        saveStatus: DataEntrySaveStatus.SAVING,
        error: null
      });
      
      if (!success) throw new Error(error);
      
      // Status məlumatlarını yeniləyirik
      setEntryStatus(prev => ({
        ...prev,
        [currentCategory.id]: 'draft'
      }));
      
      setSaveStatus(DataEntrySaveStatus.SAVED);
      toast.success(t('draftSaved'));
    } catch (error: any) {
      console.error('Məlumatları saxlayarkən xəta:', error);
      setSaveStatus(DataEntrySaveStatus.ERROR);
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
    setSaveStatus(DataEntrySaveStatus.SUBMITTING);
    
    try {
      // Əvvəlcə məlumatları saxlayırıq
      await handleSave();
      
      // Sonra təsdiq üçün göndəririk
      const { success, error } = await submitForApproval({
        id: entryId || undefined,
        schoolId,
        categoryId: currentCategory.id,
        entries: Object.entries(formData).map(([columnId, value]) => ({
          columnId,
          value: String(value || ''),
          status: 'pending'
        })),
        isModified: false,
        saveStatus: DataEntrySaveStatus.SUBMITTING,
        error: null
      });
      
      if (!success) throw new Error(error);
      
      // Status məlumatlarını yeniləyirik
      setEntryStatus(prev => ({
        ...prev,
        [currentCategory.id]: 'pending'
      }));
      
      setSaveStatus(DataEntrySaveStatus.SUBMITTED);
      toast.success(t('formSubmitted'));
      
      // Məlumatları yenidən yükləyirik
      await fetchExistingEntries();
    } catch (error: any) {
      console.error('Formu təqdim edərkən xəta:', error);
      setSaveStatus(DataEntrySaveStatus.ERROR);
      toast.error(t('errorSubmittingForm'));
    } finally {
      setIsSubmitting(false);
    }
  }, [schoolId, currentCategory, formData, entryId, user?.id, t, handleSave, fetchExistingEntries]);
  
  // Kateqoriyanı dəyişdiririk
  const handleCategoryChange = useCallback((categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      setCurrentCategory(category);
    }
  }, [categories]);
  
  // Effektlər
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  
  useEffect(() => {
    fetchExistingEntries();
  }, [fetchExistingEntries]);
  
  return {
    categories,
    currentCategory,
    formData,
    entryStatus,
    isSubmitting,
    isAutoSaving,
    loadingEntry,
    loadingCategories,
    entryError,
    categoriesError,
    saveStatus,
    handleInputChange,
    handleReset,
    handleSave,
    handleSubmit,
    handleCategoryChange,
    setCurrentCategory
  };
};

export default useDataEntry;