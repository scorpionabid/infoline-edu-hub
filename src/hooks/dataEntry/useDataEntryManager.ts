
import { useState, useCallback, useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { CategoryWithColumns } from '@/types/category';
import { DataEntryForm, DataEntry } from '@/types/dataEntry';
import { saveDataEntryForm, submitForApproval, getDataEntries, EntryValue, ServiceResponse } from '@/services/dataEntryService';
import { StatusTransitionService, TransitionContext } from '@/services/statusTransitionService';
import { useStatusPermissions } from '@/hooks/auth/useStatusPermissions';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { DataEntryStatus } from '@/types/core/dataEntry';
// Real-time updates are temporarily disabled
// import { useDataEntryRealTime } from '@/hooks/realtime/useRealTimeUpdates';

// Status type is now imported from core types
// type DataEntryStatus = DataEntry['status']; // Removed - using imported type

interface UseDataEntryManagerOptions {
  categoryId: string;
  schoolId: string;
  category: CategoryWithColumns | null;
}

export const useDataEntryManager = ({ categoryId, schoolId, category }: UseDataEntryManagerOptions) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const user = useAuthStore(state => state.user);
  
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [entryStatus, setEntryStatus] = useState<DataEntryStatus | undefined>(undefined);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // ✅ YENİ: Status-based permissions
  const statusPermissions = useStatusPermissions(entryStatus, categoryId, schoolId);
  
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
        
        // ✅ DEĞİŞDİRİLMİŞ: Enhanced status assignment
        if (result.data.length > 0) {
          const status = result.data[0].status as DataEntryStatus;
          setEntryStatus(status);
          console.log('Status set from data:', status);
        } else {
          // Default to draft for new entries
          setEntryStatus(DataEntryStatus.DRAFT);
          console.log('Status set to default: draft');
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

  // ✅ ENHANCED: Save with status validation
  const handleSave = useCallback(async (): Promise<void> => {
    console.group('handleSave - Enhanced');
    console.log('Save attempt:', { categoryId, schoolId, canEdit: statusPermissions.canEdit });
    
    // Pre-validation checks
    if (!categoryId || categoryId === '' || !schoolId || schoolId === '') {
      console.warn('Cannot save - missing category ID or school ID');
      toast({
        title: t('error'),
        description: t('missingRequiredData'),
        variant: 'destructive'
      });
      console.groupEnd();
      return;
    }
    
    // ✅ YENİ: Status permission check
    if (!statusPermissions.canEdit) {
      const errorMessage = entryStatus === DataEntryStatus.APPROVED 
        ? t('cannotModifyApprovedData')
        : entryStatus === DataEntryStatus.PENDING
        ? t('cannotModifyPendingData')
        : t('cannotEditInCurrentStatus');
      
      console.warn('Save blocked by status permissions:', { entryStatus, canEdit: statusPermissions.canEdit });
      toast({
        title: t('error'),
        description: errorMessage,
        variant: 'destructive'
      });
      console.groupEnd();
      throw new Error(errorMessage);
    }
    
    if (!category || !category.columns) {
      console.warn('Cannot save - category or columns missing');
      toast({
        title: t('error'),
        description: t('categoryDataMissing'),
        variant: 'destructive'
      });
      console.groupEnd();
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
      
      console.log('Saving entries:', entries.length);
      
      // Call enhanced service to save data
      const result = await saveDataEntryForm(schoolId, categoryId, entries);
      
      if (result.success) {
        setLastSaved(new Date().toISOString());
        setHasUnsavedChanges(false);
        
        // Update status if changed
        if (result.status && result.status !== entryStatus) {
          setEntryStatus(result.status as DataEntryStatus);
          console.log('Status updated after save:', result.status);
        }
        
        toast({
          title: t('success'),
          description: result.message || t('dataSavedSuccessfully'),
        });
        
        console.log('Save successful');
      } else {
        // Handle errors properly
        setErrors(result.errors || { general: result.error || 'Unknown error' });
        
        // Special handling for status-related errors
        if (result.error?.includes('approved')) {
          setEntryStatus(DataEntryStatus.APPROVED); // Update local status
        }
        
        toast({
          title: t('error'),
          description: result.message || t('errorSavingData'),
          variant: 'destructive'
        });
        console.error('Save failed:', result.error);
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
      console.groupEnd();
    }
  }, [categoryId, schoolId, category, formData, statusPermissions, entryStatus, t, toast]);

  // ✅ ENHANCED: Submit with status transition validation
  const handleSubmit = useCallback(async (): Promise<void> => {
    console.group('handleSubmit - Enhanced');
    console.log('Submit attempt:', { categoryId, schoolId, canSubmit: statusPermissions.canSubmit });
    
    if (!categoryId || categoryId === '' || !schoolId || schoolId === '') {
      console.warn('Cannot submit - missing category ID or school ID');
      toast({
        title: t('error'),
        description: t('missingRequiredData'),
        variant: 'destructive'
      });
      console.groupEnd();
      return;
    }
    
    // ✅ YENİ: Status permission check
    if (!statusPermissions.canSubmit) {
      const errorMessage = entryStatus === DataEntryStatus.APPROVED 
        ? t('dataAlreadyApproved')
        : entryStatus === DataEntryStatus.PENDING
        ? t('dataAlreadyPending') 
        : t('cannotSubmitInCurrentStatus');
      
      console.warn('Submit blocked by status permissions:', { entryStatus, canSubmit: statusPermissions.canSubmit });
      toast({
        title: t('error'),
        description: errorMessage,
        variant: 'destructive'
      });
      console.groupEnd();
      throw new Error(errorMessage);
    }
    
    // ✅ YENİ: Check if all required fields are filled
    if (!statusPermissions.statusInfo.canTransitionTo.includes(DataEntryStatus.PENDING)) {
      toast({
        title: t('error'),
        description: t('pleaseCompleteAllRequiredFields'),
        variant: 'destructive'
      });
      console.groupEnd();
      throw new Error('Required fields not completed');
    }
    
    setIsSubmitting(true);
    try {
      // First save the form to ensure all data is up to date
      console.log('Saving before submit...');
      await handleSave();
      
      // ✅ YENİ: Enhanced submit with status transition
      console.log('Executing submit with status transition...');
      const result = await submitForApproval(schoolId, categoryId, 'Submitted for approval');
      
      if (result.success) {
        // Update status from response
        const newStatus = result.status as DataEntryStatus || DataEntryStatus.PENDING;
        setEntryStatus(newStatus);
        setHasUnsavedChanges(false);
        
        console.log('Submit successful, new status:', newStatus);
        
        toast({
          title: t('success'),
          description: result.message || t('dataSubmittedForApproval'),
        });
      } else {
        // Handle errors properly
        setErrors(result.errors || { general: result.error || 'Unknown error' });
        
        console.error('Submit failed:', result.error);
        
        // Special error messages for transition failures
        let errorMessage = result.message || t('errorSubmittingData');
        if (result.error?.includes('transition')) {
          errorMessage = t('statusTransitionNotAllowed');
        } else if (result.error?.includes('required')) {
          errorMessage = t('pleaseCompleteAllRequiredFields');
        }
        
        toast({
          title: t('error'),
          description: errorMessage,
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
      console.groupEnd();
    }
  }, [categoryId, schoolId, statusPermissions, entryStatus, handleSave, t, toast]);

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

  // ✅ YENİ: Status transition handler for approval/rejection actions
  const handleStatusTransition = useCallback(async (
    newStatus: DataEntryStatus,
    comment?: string
  ): Promise<void> => {
    if (!user || !entryStatus) {
      throw new Error('User or current status not available');
    }
    
    console.group('handleStatusTransition');
    console.log('Transition request:', { from: entryStatus, to: newStatus, comment });
    
    try {
      // Get user role
      const userRole = user.role;
      if (!userRole) {
        throw new Error('User role not found');
      }
      
      const transitionContext: TransitionContext = {
        schoolId,
        categoryId,
        userId: user.id,
        userRole,
        comment
      };
      
      // Execute transition
      const result = await StatusTransitionService.executeTransition(
        entryStatus,
        newStatus,
        transitionContext
      );
      
      if (result.success) {
        setEntryStatus(newStatus);
        await loadData(true); // Refresh data
        
        console.log('Status transition successful:', newStatus);
        
        toast({
          title: t('success'),
          description: result.message || t('statusUpdatedSuccessfully'),
        });
      } else {
        console.error('Status transition failed:', result.error);
        throw new Error(result.error || 'Status transition failed');
      }
    } catch (error: any) {
      console.error('Error in status transition:', error);
      toast({
        title: t('error'),
        description: error.message || t('statusTransitionFailed'),
        variant: 'destructive'
      });
      throw error;
    } finally {
      console.groupEnd();
    }
  }, [schoolId, categoryId, entryStatus, user, loadData, t, toast]);
  
  return {
    // Core data
    formData,
    setFormData,
    
    // Loading states
    isLoading,
    isSaving,
    isSubmitting,
    isRefreshing,
    
    // Status and errors
    errors,
    entryStatus,
    lastSaved,
    hasUnsavedChanges,
    
    // ✅ YENİ: Status-based permissions
    statusPermissions,
    canEdit: statusPermissions.canEdit,
    canSubmit: statusPermissions.canSubmit,
    canApprove: statusPermissions.canApprove,
    canReject: statusPermissions.canReject,
    readOnly: statusPermissions.readOnly,
    readOnlyReason: !statusPermissions.canEdit ? 
      (entryStatus === DataEntryStatus.APPROVED ? 'approved' : 
       entryStatus === DataEntryStatus.PENDING ? 'pending' : 'noPermission') : null,
    
    // Core actions
    handleFormDataChange,
    handleSave,
    handleSubmit,
    handleExportTemplate,
    handleImportData,
    refreshData,
    
    // ✅ YENİ: Status transition actions
    handleStatusTransition,
    handleApprove: (comment?: string) => handleStatusTransition(DataEntryStatus.APPROVED, comment),
    handleReject: (reason: string) => handleStatusTransition(DataEntryStatus.REJECTED, reason),
    handleReset: () => handleStatusTransition(DataEntryStatus.DRAFT, 'Reset to draft')
  };
};
