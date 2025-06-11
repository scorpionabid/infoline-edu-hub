import { useEffect, useRef, useState, useCallback } from 'react';
import { useDebounce } from './common/useDebounce';
import { DataEntryService, SaveDataEntryOptions } from '@/services/dataEntry';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';

export interface UseAutoSaveConfig {
  categoryId: string;
  schoolId: string;
  formData: Record<string, any>;
  isDataModified: boolean;
  enabled?: boolean;
  debounceMs?: number;
  autoSaveDelay?: number;
  onSaveSuccess?: (savedAt: Date) => void;
  onSaveError?: (error: string) => void;
  enableRetry?: boolean;
  maxRetries?: number;
}

export interface UseAutoSaveResult {
  // State
  isSaving: boolean;
  autoSaveEnabled: boolean;
  lastSaveTime: Date | null;
  saveError: string | null;
  saveAttempts: number;
  
  // Actions
  saveNow: () => Promise<{ success: boolean; error?: string }>;
  cancelAutoSave: () => void;
  resetError: () => void;
  
  // Status
  hasUnsavedChanges: boolean;
}

/**
 * Birləşdirilmiş və təkmilləşdirilmiş Auto-Save Hook-u
 * 
 * Bu hook aşağıdakı funksiyaları təmin edir:
 * - Real Supabase API ilə auto-save
 * - Debounced save mechanism
 * - Error handling və retry logic
 * - Manual save trigger
 * - Auto-save status tracking
 */
export const useAutoSave = ({
  categoryId,
  schoolId,
  formData,
  isDataModified,
  enabled = true,
  debounceMs = 2000,
  autoSaveDelay = 30000, // 30 seconds
  onSaveSuccess,
  onSaveError,
  enableRetry = true,
  maxRetries = 3
}: UseAutoSaveConfig): UseAutoSaveResult => {
  
  const user = useAuthStore(selectUser);
  const { toast } = useToast();
  
  // State
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveAttempts, setSaveAttempts] = useState(0);
  
  // Refs
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSaveDataRef = useRef<string>('');
  
  // Debounced form data for auto-save
  const debouncedFormData = useDebounce(formData, debounceMs);
  
  // Check if there are unsaved changes
  const hasUnsavedChanges = isDataModified && enabled;
  
  // Cancel auto-save
  const cancelAutoSave = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
      autoSaveTimeoutRef.current = undefined;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = undefined;
    }
  }, []);
  
  // Reset error state
  const resetError = useCallback(() => {
    setSaveError(null);
    setSaveAttempts(0);
  }, []);
  
  // Core save function
  const performSave = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!enabled || !categoryId || !schoolId || isSaving) {
      return { success: false, error: 'Save conditions not met' };
    }
    
    try {
      setIsSaving(true);
      setSaveError(null);
      
      // Mərkəzləşdirilmiş service istifadə et
      const saveOptions: SaveDataEntryOptions = {
        categoryId,
        schoolId,
        userId: user?.id,
        status: 'draft'
      };
      
      const result = await DataEntryService.saveFormData(formData, saveOptions);
      
      if (!result.success) {
        throw new Error(result.error || 'Save failed');
      }
      
      // Update state
      const saveTime = new Date();
      setLastSaveTime(saveTime);
      setSaveAttempts(0);
      lastSaveDataRef.current = JSON.stringify(formData);
      
      // Callbacks
      onSaveSuccess?.(saveTime);
      
      console.log(`Auto-save successful at ${saveTime.toLocaleTimeString()}, saved ${result.savedCount} entries`);
      return { success: true };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Save failed';
      console.error('Auto-save failed:', error);
      
      setSaveError(errorMessage);
      setSaveAttempts(prev => prev + 1);
      onSaveError?.(errorMessage);
      
      return { success: false, error: errorMessage };
    } finally {
      setIsSaving(false);
    }
  }, [
    enabled, categoryId, schoolId, isSaving, formData, user?.id, 
    onSaveSuccess, onSaveError
  ]);
  
  // Save with retry logic
  const saveWithRetry = useCallback(async (isManual = false): Promise<{ success: boolean; error?: string }> => {
    const result = await performSave();
    
    if (!result.success && enableRetry && saveAttempts < maxRetries && !isManual) {
      // Schedule retry
      const retryDelay = Math.min(1000 * Math.pow(2, saveAttempts), 10000); // Exponential backoff
      console.log(`Scheduling retry in ${retryDelay}ms (attempt ${saveAttempts + 1}/${maxRetries})`);
      
      retryTimeoutRef.current = setTimeout(() => {
        saveWithRetry(false);
      }, retryDelay);
    } else if (!result.success && isManual) {
      // Show error toast for manual saves
      toast({
        title: 'Yadda saxlama xətası',
        description: result.error || 'Məlumatlar saxlanılmadı',
        variant: 'destructive'
      });
    }
    
    return result;
  }, [performSave, enableRetry, saveAttempts, maxRetries, toast]);
  
  // Manual save function
  const saveNow = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    cancelAutoSave();
    return await saveWithRetry(true);
  }, [cancelAutoSave, saveWithRetry]);
  
  // Auto-save effect
  useEffect(() => {
    if (!enabled || !isDataModified || isSaving) {
      return;
    }
    
    // Check if data actually changed
    const currentDataString = JSON.stringify(debouncedFormData);
    if (currentDataString === lastSaveDataRef.current) {
      return;
    }
    
    // Clear existing timeout
    cancelAutoSave();
    
    // Set new auto-save timeout
    autoSaveTimeoutRef.current = setTimeout(() => {
      console.log('Auto-save triggered after delay');
      saveWithRetry(false);
    }, autoSaveDelay);
    
    return cancelAutoSave;
  }, [
    debouncedFormData, enabled, isDataModified, isSaving, 
    autoSaveDelay, cancelAutoSave, saveWithRetry
  ]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAutoSave();
    };
  }, [cancelAutoSave]);
  
  return {
    // State
    isSaving,
    autoSaveEnabled: enabled,
    lastSaveTime,
    saveError,
    saveAttempts,
    
    // Actions
    saveNow,
    cancelAutoSave,
    resetError,
    
    // Status
    hasUnsavedChanges
  };
};

export default useAutoSave;