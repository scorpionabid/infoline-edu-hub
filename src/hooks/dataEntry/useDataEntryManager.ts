
import { useState, useCallback, useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { CategoryWithColumns } from '@/types/category';
import { DataEntryForm, DataEntry } from '@/types/dataEntry';
import { saveDataEntryForm, submitForApproval, getDataEntries, EntryValue, ServiceResponse } from '@/services/dataEntryService';
// Real-time updates are temporarily disabled
// import { useDataEntryRealTime } from '@/hooks/realtime/useRealTimeUpdates';

// Define the status type directly from DataEntry to avoid type errors
type DataEntryStatus = DataEntry['status'];

interface UseDataEntryManagerOptions {
  categoryId: string;
  schoolId: string;
  category: CategoryWithColumns | null;
}

export const useDataEntryManager = ({ categoryId, schoolId, category }: UseDataEntryManagerOptions) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [entryStatus, setEntryStatus] = useState<DataEntryStatus>('draft');
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Məlumatların sonsuz dövrə yüklənməsini idarə etmək üçün ref-lər
  const isDataLoaded = useRef<boolean>(false);
  const loadAttempts = useRef<number>(0);
  const lastLoadTime = useRef<number>(0);
  
  // Keş idarəsi üçün funksiyalar
  const getDataFromCache = useCallback(() => {
    try {
      const cacheKey = `data_${categoryId}_${schoolId}`;
      const cachedData = localStorage.getItem(cacheKey);
      if (!cachedData) return null;
      
      const { data, timestamp } = JSON.parse(cachedData);
      // 5 dəqiqəlik keş valid vaxtı
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        return data;
      }
      
      // Keş vaxtı keçibsə təmizlə
      localStorage.removeItem(cacheKey);
      return null;
    } catch (error) {
      console.warn('Cache parsing error:', error);
      return null;
    }
  }, [categoryId, schoolId]);
  
  const saveDataToCache = useCallback((data: any) => {
    try {
      const cacheKey = `data_${categoryId}_${schoolId}`;
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Cache saving error:', error);
    }
  }, [categoryId, schoolId]);

  // Təkmilləşdirilmiş loadData funksiyası
  const loadData = useCallback(async (forceRefresh: boolean = false): Promise<void> => {
    // İlkin yoxlama - əgər ID-lər yoxdursa, yükləmə prosesini dayandır
    if (!categoryId || categoryId === '' || !schoolId || schoolId === '') {
      console.log('Skipping data load - missing required IDs');
      setIsLoading(false);
      return;
    }
    
    // Qısa müddətli təkrar yükləmələrin qarşısını al
    const now = Date.now();
    if (!forceRefresh && now - lastLoadTime.current < 2000) {
      console.log('Throttling data load - too frequent requests');
      return;
    }
    lastLoadTime.current = now;
    
    // Yalnız yükləmə ilə məşğul deyiliksa davam et
    if (isLoading && !forceRefresh) {
      console.log('Already loading data - skipping duplicate request');
      return;
    }
    
    // Max yükləmə cəhdlərini məhdudlaşdır
    loadAttempts.current += 1;
    if (loadAttempts.current > 3 && !forceRefresh) {
      console.warn('Max load attempts reached, stopping auto-retries');
      setIsLoading(false);
      return;
    }
    
    // Əgər məcburi yeniləmə deyilsə və məlumat artıq yüklənibsə, keşdən oxu
    if (!forceRefresh && isDataLoaded.current) {
      const cachedData = getDataFromCache();
      if (cachedData) {
        console.log('Using cached data');
        setFormData(cachedData);
        setIsLoading(false);
        return;
      }
    }
    
    // Serverdən məlumat yükləmə prosesi
    setIsLoading(true);
    try {
      const result = await getDataEntries(schoolId, categoryId);
      if (result.success && result.data) {
        const dataMap: Record<string, any> = {};
        result.data.forEach(entry => {
          dataMap[entry.columnId] = entry.value;
        });
        
        setFormData(dataMap);
        setHasUnsavedChanges(false);
        
        // Status təyinatı
        if (result.data.length > 0) {
          setEntryStatus(result.data[0].status as DataEntryStatus);
        }
        
        // Uğurlu yükləmə ilə flag və keş yenilənir
        isDataLoaded.current = true;
        saveDataToCache(dataMap);
      } else {
        // 0 nəticə boşluğu fərqli qəbul edilir (xəta deyil)
        if (result.data?.length === 0) {
          isDataLoaded.current = true; // Data is just empty
          setFormData({});
          return;
        }
        
        console.error('Error in API response:', result.error || result.message);
        toast({
          title: t('error'),
          description: result.message || t('errorLoadingData'),
          variant: 'destructive'
        });
        setErrors(result.errors || {});
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
      
      // Məcburi yeniləmədə istifadəçiyə bildiriş göndəririk
      if (forceRefresh) {
        toast({
          title: t('error'),
          description: t('errorLoadingData'),
          variant: 'destructive'
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [categoryId, schoolId, t, toast, isLoading, getDataFromCache, saveDataToCache]);
  
  // Vahid əsas useEffect - ilkin yükləmə və polling birləşdirilib
  useEffect(() => {
    // Əgər ID-lər yoxdursa, yükləmə prosesini dayandır
    if (!categoryId || !schoolId) {
      setIsLoading(false);
      return;
    }
    
    // Məlumatları bir dəfə yüklə
    if (!isDataLoaded.current) {
      console.log('Initial data load');
      loadData(false);
    }
    
    // Polling və page visibility izləmə
    let isPageActive = true;
    
    const handleVisibilityChange = () => {
      isPageActive = document.visibilityState === 'visible';
      
      // Səhifə görünüş halına geri döndükdə və son yükləmədən çox vaxt keçibsə
      if (isPageActive && Date.now() - lastLoadTime.current > 60000) {
        console.log('Page became visible again, refreshing data');
        loadData(false);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Polling intervalı - əvvəlki kimi 30 saniyə, amma daha diqqətli şərtlərlə
    const pollInterval = setInterval(() => {
      if (isPageActive && !isSaving && !isSubmitting && isDataLoaded.current) {
        console.log('Polling for data updates...');
        // forceRefresh=false: serverdə dəyişiklik olmaya bilər, polling adi yoxlamadır
        loadData(false);
      }
    }, 30000);
    
    // Təmizləmə
    return () => {
      clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [categoryId, schoolId, loadData, isSaving, isSubmitting]);

  // Handle form data changes
  const handleFormDataChange = useCallback((newData: Record<string, any>) => {
    setFormData(newData);
    setErrors({}); // Clear errors when data changes
    setHasUnsavedChanges(true);
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const autoSaveTimer = setTimeout(() => {
      if (entryStatus === 'draft') {
        handleSave();
      }
    }, 30000); // Auto-save after 30 seconds

    return () => clearTimeout(autoSaveTimer);
  }, [formData, hasUnsavedChanges, entryStatus]);

  // Save as draft
  const handleSave = useCallback(async (): Promise<void> => {
    if (!categoryId || categoryId === '' || !schoolId || schoolId === '') {
      console.warn('Cannot save - missing category ID or school ID');
      toast({
        title: t('error'),
        description: t('missingRequiredData'),
        variant: 'destructive'
      });
      return;
    }
    
    if (!category || !category.columns) {
      console.warn('Cannot save - category or columns missing');
      toast({
        title: t('error'),
        description: t('categoryDataMissing'),
        variant: 'destructive'
      });
      throw new Error('Category data missing');
    }
    
    setIsSaving(true);
    setErrors({});
    
    try {
      // Create entries array from formData
      const entries: EntryValue[] = [];
      
      // Loop through columns to create entries
      category.columns.forEach(column => {
        const value = formData[column.id];
        if (value !== undefined) {
          entries.push({
            columnId: column.id,
            value: value
          });
        }
      });
      
      // Call service to save data
      const result = await saveDataEntryForm(schoolId, categoryId, entries);
      
      if (result.success) {
        setLastSaved(new Date().toISOString());
        setHasUnsavedChanges(false);
        // Update status if needed
        if (result.status) {
          setEntryStatus(result.status as DataEntryStatus);
        }
        
        toast({
          title: t('success'),
          description: result.message || t('dataSavedSuccessfully'),
        });
      } else {
        // Handle errors properly
        setErrors(result.errors || { general: result.error || 'Unknown error' });
        toast({
          title: t('error'),
          description: result.message || t('errorSavingData'),
          variant: 'destructive'
        });
        throw new Error(result.error || 'Error saving data');
      }
    } catch (error: any) {
      console.error('Error saving data:', error);
      toast({
        title: t('error'),
        description: error.message || t('errorSavingData'),
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [categoryId, schoolId, category, formData, t, toast]);

  // Submit for approval
  const handleSubmit = useCallback(async (): Promise<void> => {
    if (!categoryId || categoryId === '' || !schoolId || schoolId === '') {
      console.warn('Cannot submit - missing category ID or school ID');
      toast({
        title: t('error'),
        description: t('missingRequiredData'),
        variant: 'destructive'
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // First save the form to ensure all data is up to date
      await handleSave();
      
      // Then submit for approval
      const result = await submitForApproval(schoolId, categoryId);
      
      if (result.success) {
        // Update status from response or set to pending
        setEntryStatus(result.status as DataEntryStatus || 'pending');
        toast({
          title: t('success'),
          description: result.message || t('dataSubmittedForApproval'),
        });
      } else {
        // Handle errors properly
        setErrors(result.errors || { general: result.error || 'Unknown error' });
        toast({
          title: t('error'),
          description: result.message || t('errorSubmittingData'),
          variant: 'destructive'
        });
        throw new Error(result.error || 'Error submitting data');
      }
    } catch (error: any) {
      console.error('Error submitting data:', error);
      toast({
        title: t('error'),
        description: error.message || t('errorSubmittingData'),
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [categoryId, schoolId, handleSave, t, toast]);

  // Excel import handler
  const handleImportData = useCallback(async (data: Record<string, any>): Promise<void> => {
    if (!data || Object.keys(data).length === 0) {
      toast({
        title: t('error'),
        description: t('noDataToImport'),
        variant: 'destructive'
      });
      throw new Error('No data to import');
    }

    try {
      setFormData(prevData => ({ ...prevData, ...data }));
      setHasUnsavedChanges(true);
      
      // Auto-save imported data
      await handleSave();
      
      toast({
        title: t('success'),
        description: t('dataImportedAndSaved'),
      });
    } catch (error: any) {
      console.error('Error importing data:', error);
      toast({
        title: t('error'),
        description: error.message || t('errorImportingData'),
        variant: 'destructive'
      });
      throw error;
    }
  }, [handleSave, t, toast]);

  // Excel export template handler
  const handleExportTemplate = useCallback(() => {
    // This will be implemented with the Excel integration
    console.log('Export template for category:', categoryId);
  }, [categoryId]);

  // Manual refresh function with loading indicator
  const refreshData = useCallback(async (): Promise<void> => {
    if (!categoryId || categoryId === '' || !schoolId || schoolId === '') {
      console.warn('Cannot refresh - missing category ID or school ID');
      // Don't show error toast to users when the app is just initializing
      // Only show errors on explicit user actions
      return;
    }
    
    setIsRefreshing(true);
    try {
      await loadData();
      toast({
        title: t('success'),
        description: t('dataRefreshed'),
      });
    } catch (error: any) {
      console.error('Error refreshing data:', error);
      toast({
        title: t('error'),
        description: error.message || t('errorRefreshingData'),
        variant: 'destructive'
      });
      setErrors(error.errors || { general: error.message || 'Unknown error' });
      throw error;
    } finally {
      setIsRefreshing(false);
    }
  }, [categoryId, schoolId, loadData, t, toast]);

  return {
    formData,
    setFormData,
    isLoading,
    isSaving,
    isSubmitting,
    isRefreshing,
    errors,
    entryStatus,
    lastSaved,
    hasUnsavedChanges,
    handleFormDataChange,
    handleSave,
    handleSubmit,
    handleExportTemplate,
    handleImportData,
    refreshData
  };
};
