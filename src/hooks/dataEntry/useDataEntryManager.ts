// Refactored and simplified DataEntry Manager
// Combines specialized hooks for a complete data entry solution
import { useState, useCallback, useEffect } from 'react';
import { CategoryWithColumns } from '@/types/category';
import { DataEntryStatus } from '@/types/core/dataEntry';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';

// Import our specialized hooks
import useFormManager from './common/useFormManager';
import useDataLoader from './common/useDataLoader';
import useSaveManager from './common/useSaveManager';
import useStatusManager from './common/useStatusManager';
import useCacheManager from './common/useCacheManager';
import { useRealTimeDataEntry } from './common/useRealTimeDataEntry';
import { useAuthStore } from '@/hooks/auth/useAuthStore';

interface UseDataEntryManagerOptions {
  categoryId: string;
  schoolId: string;
  category: CategoryWithColumns | null;
  enableRealTime?: boolean;
  enableCache?: boolean;
  autoSave?: boolean;
}

export const useDataEntryManager = ({ 
  categoryId, 
  schoolId, 
  category,
  enableRealTime = true,
  enableCache = true,
  autoSave = true
}: UseDataEntryManagerOptions) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const user = useAuthStore(state => state.user);
  
  // Additional state for integration
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  
  // Initialize specialized hooks
  const formManager = useFormManager({ categoryId, schoolId, category });
  
  const dataLoader = useDataLoader({ 
    categoryId, 
    schoolId, 
    useCache: enableCache 
  });
  
  const saveManager = useSaveManager({
    categoryId,
    schoolId,
    category,
    onSaveSuccess: () => {
      setLastSaved(new Date().toISOString());
      formManager.setInitialData(formManager.formData); // Reset modification tracking
    },
    onSaveError: (error) => {
      console.error('Save error:', error);
    }
  });
  
  const statusManager = useStatusManager({
    categoryId,
    schoolId,
    onStatusChange: (newStatus) => {
      console.log('Status changed:', newStatus);
    }
  });
  
  const cacheManager = useCacheManager({ categoryId, schoolId });
  
  // Real-time data change handler
  const handleRealTimeDataChange = useCallback((payload: any) => {
    console.log('Real-time data change received:', payload);
    
    if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
      formManager.handleFieldChange(payload.new.column_id, payload.new.value);
    } else if (payload.eventType === 'DELETE') {
      const newData = { ...formManager.formData };
      delete newData[payload.old.column_id];
      formManager.updateFormData(newData);
    }
  }, [formManager]);
  
  // Real-time hook (optional)
  const realTimeHook = useRealTimeDataEntry({
    categoryId,
    schoolId,
    userId: user?.id,
    onDataChange: handleRealTimeDataChange,
    enabled: enableRealTime && !saveManager.isSaving && !saveManager.isSubmitting
  });
  
  // Load initial data
  const loadData = useCallback(async (forceRefresh = false) => {
    try {
      const result = await dataLoader.loadData(schoolId, categoryId, forceRefresh);
      
      if (result) {
        formManager.setInitialData(result.data);
        formManager.setEntries(result.entries);
        
        // Set status from first entry
        if (result.entries.length > 0) {
          const status = result.entries[0].status as DataEntryStatus;
          statusManager.updateStatus(status);
        } else {
          statusManager.updateStatus(DataEntryStatus.DRAFT);
        }
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast({
        title: t('error'),
        description: error.message || t('errorLoadingData'),
        variant: 'destructive'
      });
    }
  }, [dataLoader, formManager, statusManager, schoolId, categoryId, t, toast]);
  
  // Enhanced save function
  const handleSave = useCallback(async () => {
    if (!statusManager.canEdit) {
      const errorMessage = statusManager.readOnlyReason === 'approved' 
        ? t('cannotModifyApprovedData')
        : statusManager.readOnlyReason === 'pending'
        ? t('cannotModifyPendingData')
        : t('cannotEditInCurrentStatus');
      
      toast({
        title: t('error'),
        description: errorMessage,
        variant: 'destructive'
      });
      return;
    }
    
    const result = await saveManager.saveAsDraft(formManager.formData);
    
    if (result.success && result.status) {
      statusManager.updateStatus(result.status);
    }
    
    return result;
  }, [formManager, saveManager, statusManager, t, toast]);
  
  // Enhanced submit function
  const handleSubmit = useCallback(async () => {
    if (!statusManager.canSubmit) {
      const errorMessage = statusManager.entryStatus === DataEntryStatus.APPROVED 
        ? t('dataAlreadyApproved')
        : statusManager.entryStatus === DataEntryStatus.PENDING
        ? t('dataAlreadyPending') 
        : t('cannotSubmitInCurrentStatus');
      
      toast({
        title: t('error'),
        description: errorMessage,
        variant: 'destructive'
      });
      return;
    }
    
    // Validate before submit
    const validation = formManager.validateForm();
    if (!validation.isValid) {
      toast({
        title: t('validationError'),
        description: t('pleaseFixErrors'),
        variant: 'destructive'
      });
      return;
    }
    
    const result = await saveManager.submitForApproval(formManager.formData);
    
    if (result.success && result.status) {
      statusManager.updateStatus(result.status);
    }
    
    return result;
  }, [formManager, saveManager, statusManager, t, toast]);
  
  // Manual refresh
  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await dataLoader.refreshData(schoolId, categoryId);
      await loadData(true);
      
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
    } finally {
      setIsRefreshing(false);
    }
  }, [dataLoader, loadData, schoolId, categoryId, t, toast]);
  
  // Excel import handler
  const handleImportData = useCallback(async (data: Record<string, any>) => {
    if (!data || Object.keys(data).length === 0) {
      toast({
        title: t('error'),
        description: t('noDataToImport'),
        variant: 'destructive'
      });
      return;
    }
    
    try {
      formManager.updateFormData({ ...formManager.formData, ...data });
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
    }
  }, [formManager, handleSave, t, toast]);
  
  // Load data when IDs change
  useEffect(() => {
    if (categoryId && schoolId) {
      loadData();
    }
  }, [categoryId, schoolId, loadData]);
  
  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !formManager.isDataModified || saveManager.isSaving) return;
    
    const timer = setTimeout(() => {
      if (statusManager.canEdit) {
        handleSave();
      }
    }, 30000); // Auto-save after 30 seconds
    
    return () => clearTimeout(timer);
  }, [autoSave, formManager.isDataModified, saveManager.isSaving, statusManager.canEdit, handleSave]);
  
  return {
    // Core data from form manager
    formData: formManager.formData,
    isDataModified: formManager.isDataModified,
    validationErrors: formManager.validationErrors,
    entries: formManager.entries,
    
    // Loading states
    isLoading: dataLoader.isLoading,
    isSaving: saveManager.isSaving,
    isSubmitting: saveManager.isSubmitting,
    isRefreshing,
    
    // Status and permissions
    entryStatus: statusManager.entryStatus,
    statusPermissions: statusManager.statusPermissions,
    canEdit: statusManager.canEdit,
    canSubmit: statusManager.canSubmit,
    canApprove: statusManager.canApprove,
    canReject: statusManager.canReject,
    readOnly: statusManager.readOnly,
    readOnlyReason: statusManager.readOnlyReason,
    
    // Form actions
    handleFormDataChange: formManager.updateFormData,
    handleFieldChange: formManager.handleFieldChange,
    validateForm: formManager.validateForm,
    resetForm: formManager.resetForm,
    
    // Save actions
    handleSave,
    handleSubmit,
    handleImportData,
    
    // Status actions
    handleStatusTransition: statusManager.executeTransition,
    handleApprove: statusManager.approveDraft,
    handleReject: statusManager.rejectEntry,
    handleReset: statusManager.resetToDraft,
    
    // Data actions
    refreshData,
    loadData,
    
    // Status info
    statusDisplay: statusManager.statusDisplay,
    completionStatus: formManager.completionStatus,
    lastSaved,
    
    // Real-time (if enabled)
    realTime: enableRealTime ? {
      isConnected: realTimeHook.isConnected,
      activeUsers: realTimeHook.activeUsers,
      activeUserCount: realTimeHook.activeUserCount,
      connectionStatus: realTimeHook.connectionStatus
    } : undefined,
    
    // Cache utilities (if enabled)
    cache: enableCache ? {
      stats: cacheManager.getCacheStats(),
      clear: cacheManager.clearCache,
      isValid: cacheManager.isCacheValid
    } : undefined,
    
    // Legacy compatibility
    errors: formManager.validationErrors,
    hasUnsavedChanges: formManager.isDataModified,
    setFormData: formManager.updateFormData,
    error: dataLoader.error
  };
};

export default useDataEntryManager;
