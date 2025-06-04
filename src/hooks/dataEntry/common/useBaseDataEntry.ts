import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { 
  BaseDataEntryOptions, 
  DataEntryStatus, 
  SaveOptions, 
  SubmitOptions 
} from '../types';

/**
 * Base data entry hook - shared logic for both school and sector data entry
 * This hook provides the foundation for data entry operations
 */
export const useBaseDataEntry = (options: BaseDataEntryOptions) => {
  const { categoryId, entityId, entityType, autoSave = true, autoSaveInterval = 30000 } = options;
  
  const { toast } = useToast();
  const { t } = useLanguage();
  const user = useAuthStore(selectUser);
  
  // Core state
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [entryStatus, setEntryStatus] = useState<DataEntryStatus | undefined>();
  
  // Refs for managing auto-save
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastAutoSaveRef = useRef<number>(0);
  
  // Get table name based on entity type
  const getTableName = useCallback(() => {
    return entityType === 'school' ? 'data_entries' : 'sector_data_entries';
  }, [entityType]);
  
  // Get entity column name
  const getEntityColumn = useCallback(() => {
    return entityType === 'school' ? 'school_id' : 'sector_id';
  }, [entityType]);
  
  // Load existing data for the entity and category
  const loadData = useCallback(async () => {
    if (!categoryId || !entityId) return;
    
    setIsLoading(true);
    try {
      const tableName = getTableName();
      const entityColumn = getEntityColumn();
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq(entityColumn, entityId)
        .eq('category_id', categoryId);
      
      if (error) throw error;
      
      // Convert array of entries to form data object
      const formDataMap: Record<string, any> = {};
      if (data && Array.isArray(data)) {
        data.forEach(entry => {
          if (entry.column_id && entry.value !== null) {
            formDataMap[entry.column_id] = entry.value;
          }
        });
        
        // Set status from first entry if available
        if (data.length > 0) {
          setEntryStatus(data[0].status as DataEntryStatus);
        }
      }
      
      setFormData(formDataMap);
      setHasUnsavedChanges(false);
      setErrors({});
      
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast({
        title: t('error'),
        description: error.message || t('errorLoadingData'),
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [categoryId, entityId, getTableName, getEntityColumn, toast, t]);
  
  // Update form data
  const updateFormData = useCallback((newData: Record<string, any> | ((prev: Record<string, any>) => Record<string, any>)) => {
    setFormData(newData);
    setHasUnsavedChanges(true);
    setErrors({});
    
    // Reset auto-save timer
    if (autoSave && autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    // Set new auto-save timer
    if (autoSave) {
      autoSaveTimeoutRef.current = setTimeout(() => {
        handleSave({ autoSave: true, showToast: false });
      }, autoSaveInterval);
    }
  }, [autoSave, autoSaveInterval]);
  
  // Handle individual field changes
  const handleFieldChange = useCallback((columnId: string, value: any) => {
    updateFormData(prev => ({
      ...prev,
      [columnId]: value
    }));
  }, [updateFormData]);
  
  // Save data
  const handleSave = useCallback(async (saveOptions: SaveOptions = {}) => {
    const { 
      autoSave: isAutoSave = false, 
      validateBeforeSave = false, 
      showToast = true 
    } = saveOptions;
    
    if (!categoryId || !entityId || !user) {
      if (showToast) {
        toast({
          title: t('error'),
          description: t('missingRequiredData'),
          variant: 'destructive'
        });
      }
      return false;
    }
    
    // Prevent duplicate saves
    const now = Date.now();
    if (isAutoSave && now - lastAutoSaveRef.current < 5000) {
      return true; // Skip if auto-saved recently
    }
    
    setIsSaving(true);
    try {
      const tableName = getTableName();
      const entityColumn = getEntityColumn();
      
      // Convert form data to entries array
      const entries = Object.entries(formData)
        .filter(([columnId, value]) => columnId && value !== null && value !== undefined)
        .map(([columnId, value]) => ({
          [entityColumn]: entityId,
          category_id: categoryId,
          column_id: columnId,
          value: String(value),
          status: entryStatus || DataEntryStatus.DRAFT,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
      
      if (entries.length === 0) {
        if (showToast) {
          toast({
            title: t('warning'),
            description: t('noDataToSave'),
            variant: 'destructive'
          });
        }
        return false;
      }
      
      // Upsert entries
      const { error } = await supabase
        .from(tableName)
        .upsert(entries, {
          onConflict: `${entityColumn},category_id,column_id`,
          ignoreDuplicates: false
        });
      
      if (error) throw error;
      
      setHasUnsavedChanges(false);
      setLastSaved(new Date().toISOString());
      lastAutoSaveRef.current = now;
      
      if (showToast) {
        toast({
          title: t('success'),
          description: isAutoSave ? t('autoSaveComplete') : t('dataSavedSuccessfully')
        });
      }
      
      return true;
      
    } catch (error: any) {
      console.error('Error saving data:', error);
      if (showToast) {
        toast({
          title: t('error'),
          description: error.message || t('errorSavingData'),
          variant: 'destructive'
        });
      }
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [categoryId, entityId, user, formData, entryStatus, getTableName, getEntityColumn, toast, t]);
  
  // Submit data for approval
  const handleSubmit = useCallback(async (submitOptions: SubmitOptions = {}) => {
    const { 
      validateBeforeSubmit = true, 
      autoApprove = false, 
      comment = '' 
    } = submitOptions;
    
    if (!categoryId || !entityId || !user) {
      toast({
        title: t('error'),
        description: t('missingRequiredData'),
        variant: 'destructive'
      });
      return false;
    }
    
    setIsSubmitting(true);
    try {
      // First save the current data
      const saveSuccess = await handleSave({ 
        validateBeforeSave: validateBeforeSubmit, 
        showToast: false 
      });
      
      if (!saveSuccess) {
        throw new Error('Failed to save data before submission');
      }
      
      // Determine target status
      const targetStatus = autoApprove ? DataEntryStatus.APPROVED : DataEntryStatus.PENDING;
      
      // Update status of all entries for this entity/category
      const tableName = getTableName();
      const entityColumn = getEntityColumn();
      
      const updateData: any = {
        status: targetStatus,
        updated_at: new Date().toISOString()
      };
      
      if (autoApprove) {
        updateData.approved_by = user.id;
        updateData.approved_at = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq(entityColumn, entityId)
        .eq('category_id', categoryId);
      
      if (error) throw error;
      
      setEntryStatus(targetStatus);
      setHasUnsavedChanges(false);
      
      toast({
        title: t('success'),
        description: autoApprove 
          ? t('dataApprovedSuccessfully') 
          : t('dataSubmittedForApproval')
      });
      
      return true;
      
    } catch (error: any) {
      console.error('Error submitting data:', error);
      toast({
        title: t('error'),
        description: error.message || t('errorSubmittingData'),
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [categoryId, entityId, user, handleSave, getTableName, getEntityColumn, toast, t]);
  
  // Load data on mount and when dependencies change
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  // Cleanup auto-save timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);
  
  return {
    // State
    formData,
    isLoading,
    isSaving,
    isSubmitting,
    hasUnsavedChanges,
    lastSaved,
    errors,
    entryStatus,
    
    // Actions
    updateFormData,
    handleFieldChange,
    handleSave,
    handleSubmit,
    loadData,
    
    // Utilities
    canEdit: entryStatus !== DataEntryStatus.APPROVED,
    canSubmit: entryStatus !== DataEntryStatus.APPROVED && entryStatus !== DataEntryStatus.PENDING,
    isReadOnly: entryStatus === DataEntryStatus.APPROVED
  };
};

export default useBaseDataEntry;
