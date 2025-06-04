// Save management for data entry forms
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { DataEntryStatus } from '@/types/core/dataEntry';
import { CategoryWithColumns } from '@/types/category';

interface UseSaveManagerOptions {
  categoryId: string;
  schoolId: string;
  category: CategoryWithColumns | null;
  onSaveSuccess?: () => void;
  onSaveError?: (error: string) => void;
}

interface SaveResult {
  success: boolean;
  message?: string;
  error?: string;
  status?: DataEntryStatus;
}

export const useSaveManager = ({
  categoryId,
  schoolId,
  category,
  onSaveSuccess,
  onSaveError
}: UseSaveManagerOptions) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const user = useAuthStore(state => state.user);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  
  // Save as draft
  const saveAsDraft = useCallback(async (
    formData: Record<string, any>
  ): Promise<SaveResult> => {
    if (!categoryId || !schoolId || !category || !user) {
      const error = 'Missing required data for saving';
      onSaveError?.(error);
      return { success: false, error };
    }
    
    setIsSaving(true);
    
    try {
      // Convert form data to entries format
      const entriesToSave = category.columns?.map(column => ({
        school_id: schoolId,
        category_id: categoryId,
        column_id: column.id,
        value: formData[column.id] || '',
        status: 'draft' as const,
        created_by: user.id,
        updated_at: new Date().toISOString()
      })).filter(entry => entry.value !== '') || [];
      
      if (entriesToSave.length === 0) {
        return { success: true, message: 'No data to save' };
      }
      
      const { error } = await supabase
        .from('data_entries')
        .upsert(entriesToSave, {
          onConflict: 'school_id,category_id,column_id'
        });
      
      if (error) throw error;
      
      const saveTime = new Date().toISOString();
      setLastSaved(saveTime);
      
      const message = t('dataSavedAsDraft') || 'Data saved as draft';
      
      toast({
        title: t('success'),
        description: message,
      });
      
      onSaveSuccess?.();
      
      return { 
        success: true, 
        message,
        status: DataEntryStatus.DRAFT 
      };
    } catch (error: any) {
      const errorMessage = error.message || t('errorSavingData') || 'Error saving data';
      
      console.error('Error saving draft:', error);
      
      toast({
        title: t('error'),
        description: errorMessage,
        variant: 'destructive'
      });
      
      onSaveError?.(errorMessage);
      
      return { success: false, error: errorMessage };
    } finally {
      setIsSaving(false);
    }
  }, [categoryId, schoolId, category, user, t, toast, onSaveSuccess, onSaveError]);
  
  // Submit for approval
  const submitForApproval = useCallback(async (
    formData: Record<string, any>,
    comment?: string
  ): Promise<SaveResult> => {
    if (!categoryId || !schoolId || !category || !user) {
      const error = 'Missing required data for submission';
      onSaveError?.(error);
      return { success: false, error };
    }
    
    setIsSubmitting(true);
    
    try {
      // Validate required fields
      const requiredColumns = category.columns?.filter(col => col.is_required) || [];
      const missingFields = requiredColumns.filter(col => {
        const value = formData[col.id];
        return !value || String(value).trim() === '';
      });
      
      if (missingFields.length > 0) {
        const error = t('pleaseCompleteAllRequiredFields') || 'Please complete all required fields';
        toast({
          title: t('validationError'),
          description: error,
          variant: 'destructive'
        });
        return { success: false, error };
      }
      
      // Check if user is sector admin for auto-approval
      const isAutoApprove = user.role === 'sectoradmin';
      let status: DataEntryStatus = DataEntryStatus.PENDING;
      let approvalMetadata = {};
      
      if (isAutoApprove) {
        // Verify sector admin has access to this school
        const { data: schoolData, error: schoolError } = await supabase
          .from('schools')
          .select('sector_id')
          .eq('id', schoolId)
          .single();
        
        if (schoolError) throw schoolError;
        
        if (schoolData.sector_id === user.sector_id) {
          status = DataEntryStatus.APPROVED;
          approvalMetadata = {
            approved_by: user.id,
            approved_at: new Date().toISOString(),
            auto_approved: true,
            approval_reason: comment || 'Automatic approval by sector admin'
          };
        }
      }
      
      // Convert form data to entries format
      const entriesToSave = category.columns?.map(column => ({
        school_id: schoolId,
        category_id: categoryId,
        column_id: column.id,
        value: formData[column.id] || '',
        status,
        created_by: user.id,
        updated_at: new Date().toISOString(),
        ...approvalMetadata
      })) || [];
      
      const { error } = await supabase
        .from('data_entries')
        .upsert(entriesToSave, {
          onConflict: 'school_id,category_id,column_id'
        });
      
      if (error) throw error;
      
      const saveTime = new Date().toISOString();
      setLastSaved(saveTime);
      
      const message = isAutoApprove 
        ? t('dataApprovedAndSaved') || 'Data automatically approved and saved'
        : t('dataSubmittedForApproval') || 'Data submitted for approval';
      
      toast({
        title: t('success'),
        description: message,
      });
      
      onSaveSuccess?.();
      
      return { 
        success: true, 
        message,
        status 
      };
    } catch (error: any) {
      const errorMessage = error.message || t('errorSubmittingData') || 'Error submitting data';
      
      console.error('Error submitting for approval:', error);
      
      toast({
        title: t('error'),
        description: errorMessage,
        variant: 'destructive'
      });
      
      onSaveError?.(errorMessage);
      
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  }, [categoryId, schoolId, category, user, t, toast, onSaveSuccess, onSaveError]);
  
  // Save with specific status
  const saveWithStatus = useCallback(async (
    formData: Record<string, any>,
    status: DataEntryStatus,
    metadata?: Record<string, any>
  ): Promise<SaveResult> => {
    if (!categoryId || !schoolId || !category || !user) {
      const error = 'Missing required data for saving';
      onSaveError?.(error);
      return { success: false, error };
    }
    
    setIsSaving(true);
    
    try {
      // Convert form data to entries format
      const entriesToSave = category.columns?.map(column => ({
        school_id: schoolId,
        category_id: categoryId,
        column_id: column.id,
        value: formData[column.id] || '',
        status,
        created_by: user.id,
        updated_at: new Date().toISOString(),
        ...metadata
      })) || [];
      
      const { error } = await supabase
        .from('data_entries')
        .upsert(entriesToSave, {
          onConflict: 'school_id,category_id,column_id'
        });
      
      if (error) throw error;
      
      const saveTime = new Date().toISOString();
      setLastSaved(saveTime);
      
      const message = t('dataSavedSuccessfully') || 'Data saved successfully';
      
      toast({
        title: t('success'),
        description: message,
      });
      
      onSaveSuccess?.();
      
      return { 
        success: true, 
        message,
        status 
      };
    } catch (error: any) {
      const errorMessage = error.message || t('errorSavingData') || 'Error saving data';
      
      console.error('Error saving with status:', error);
      
      toast({
        title: t('error'),
        description: errorMessage,
        variant: 'destructive'
      });
      
      onSaveError?.(errorMessage);
      
      return { success: false, error: errorMessage };
    } finally {
      setIsSaving(false);
    }
  }, [categoryId, schoolId, category, user, t, toast, onSaveSuccess, onSaveError]);
  
  return {
    // State
    isSaving,
    isSubmitting,
    lastSaved,
    
    // Actions
    saveAsDraft,
    submitForApproval,
    saveWithStatus,
    
    // Status
    canSave: !isSaving && !isSubmitting && !!user && !!category,
    isWorking: isSaving || isSubmitting
  };
};

export default useSaveManager;
