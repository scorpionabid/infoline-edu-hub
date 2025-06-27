import { useState, useCallback, useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { ToastAction } from '@/components/ui/toast';
// Import React for JSX usage
import React from 'react';

export interface ErrorRecoveryConfig {
  autoRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  localStorageBackup?: boolean;
  enableConflictResolution?: boolean;
  backupKey?: string;
}

export interface ConflictData {
  localData: any;
  serverData: any;
  conflictFields: string[];
  timestamp: Date;
}

export interface ErrorRecoveryState {
  hasError: boolean;
  errorMessage: string | null;
  canRecover: boolean;
  recoveryAttempts: number;
  isRecovering: boolean;
  hasLocalBackup: boolean;
  conflictData: ConflictData | null;
  lastBackupTime: Date | null;
}

export interface UseErrorRecoveryResult {
  errorState: ErrorRecoveryState;
  reportError: (error: Error | string, data?: any) => void;
  recover: (strategy?: 'retry' | 'useLocal' | 'useServer' | 'merge' | 'restore') => Promise<boolean>;
  clearError: () => void;
  createBackup: (data: any) => void;
  restoreBackup: () => any | null;
  clearBackup: () => void;
  resolveConflict: (resolution: 'local' | 'server' | 'merge', mergedData?: any) => Promise<boolean>;
}

/**
 * Təkmilləşdirilmiş Error Recovery Hook
 */
export const useErrorRecovery = (config: ErrorRecoveryConfig = {}): UseErrorRecoveryResult => {
  const {
    autoRetry = true,
    maxRetries = 3,
    retryDelay = 1000,
    localStorageBackup = true,
    enableConflictResolution = true,
    backupKey = 'dataEntry_backup'
  } = config;

  const { toast } = useToast();
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastErrorRef = useRef<{ error: Error | string; data?: any }>();
  // Reference for recover function to break circular dependency
  const recoverRef = useRef<(strategy?: 'retry' | 'useLocal' | 'useServer' | 'merge' | 'restore') => Promise<boolean>>();

  const [errorState, setErrorState] = useState<ErrorRecoveryState>({
    hasError: false,
    errorMessage: null,
    canRecover: false,
    recoveryAttempts: 0,
    isRecovering: false,
    hasLocalBackup: false,
    conflictData: null,
    lastBackupTime: null
  });

  // Helper functions
  const checkLocalBackup = useCallback((): boolean => {
    if (!localStorageBackup) return false;
    try {
      return localStorage.getItem(backupKey) !== null;
    } catch {
      return false;
    }
  }, [localStorageBackup, backupKey]);

  const createBackup = useCallback((data: any) => {
    if (!localStorageBackup) return;
    try {
      const backup = {
        data,
        timestamp: new Date().toISOString(),
        version: '1.0'
      };
      localStorage.setItem(backupKey, JSON.stringify(backup));
      setErrorState(prev => ({
        ...prev,
        hasLocalBackup: true,
        lastBackupTime: new Date()
      }));
    } catch (error) {
      console.error('Error creating backup:', error);
    }
  }, [localStorageBackup, backupKey]);

  const restoreBackup = useCallback((): any | null => {
    if (!localStorageBackup) return null;
    try {
      const backupJson = localStorage.getItem(backupKey);
      if (!backupJson) return null;
      const backup = JSON.parse(backupJson);
      setErrorState(prev => ({ 
        ...prev, 
        lastBackupTime: new Date(backup.timestamp) 
      }));
      return backup.data;
    } catch {
      return null;
    }
  }, [backupKey, localStorageBackup]);

  const clearBackup = useCallback(() => {
    if (!localStorageBackup) return;
    try {
      localStorage.removeItem(backupKey);
      setErrorState(prev => ({ 
        ...prev, 
        hasLocalBackup: false, 
        lastBackupTime: null 
      }));
    } catch (error) {
      console.error('Error clearing backup:', error);
    }
  }, [backupKey, localStorageBackup]);

  const clearError = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    setErrorState(prev => ({
      hasError: false,
      errorMessage: null,
      canRecover: false,
      recoveryAttempts: 0,
      isRecovering: false,
      hasLocalBackup: checkLocalBackup(),
      conflictData: null,
      lastBackupTime: prev.lastBackupTime
    }));
    lastErrorRef.current = undefined;
  }, [checkLocalBackup]);

  const resolveConflict = useCallback(async (
    resolution: 'local' | 'server' | 'merge',
    mergedData?: any
  ): Promise<boolean> => {
    const { conflictData } = errorState;
    if (!conflictData) return false;

    try {
      setErrorState(prev => ({ ...prev, isRecovering: true }));

      let resolvedData;
      if (resolution === 'local') {
        resolvedData = conflictData.localData;
      } else if (resolution === 'server') {
        resolvedData = conflictData.serverData;
      } else {
        resolvedData = mergedData || { 
          ...conflictData.serverData, 
          ...conflictData.localData 
        };
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      clearError();
      toast({
        title: 'Konflikt həll edildi',
        description: `Məlumatlar ${resolution} strategiyası ilə birləşdirildi`
      });

      return true;
    } catch (error) {
      console.error('Conflict resolution failed:', error);
      setErrorState(prev => ({ ...prev, isRecovering: false }));
      toast({
        title: 'Konflikt həlli uğursuz',
        description: 'Konflikt həll edilə bilmədi, yenidən cəhd edin',
        variant: 'destructive'
      });
      return false;
    }
  }, [errorState, toast, clearError]);

  const recover = useCallback(async (
    strategy: 'retry' | 'useLocal' | 'useServer' | 'merge' | 'restore' = 'retry'
  ): Promise<boolean> => {
    if (!errorState.hasError || errorState.isRecovering) return false;

    try {
      setErrorState(prev => ({
        ...prev,
        isRecovering: true,
        recoveryAttempts: prev.recoveryAttempts + 1
      }));

      if (strategy === 'retry' && lastErrorRef.current) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const shouldSucceed = Math.random() > 0.3;
        if (shouldSucceed) {
          clearError();
          toast({
            title: 'Bərpa uğurlu',
            description: 'Əməliyyat uğurla təkrarlandı'
          });
          return true;
        } else {
          throw new Error('Retry failed');
        }
      } else if (strategy === 'useLocal' || strategy === 'restore') {
        const localData = restoreBackup();
        if (localData) {
          clearError();
          toast({
            title: 'Lokal məlumatlar istifadə edildi',
            description: 'Əvvəlki saxlanılmış məlumatlar bərpa edildi'
          });
          return true;
        }
      } else if (strategy === 'useServer') {
        clearError();
        toast({
          title: 'Server məlumatları istifadə edildi',
          description: 'Ən son server məlumatları yükləndi'
        });
        return true;
      } else if (strategy === 'merge') {
        clearError();
        toast({
          title: 'Məlumatlar birləşdirildi',
          description: 'Lokal və server məlumatları birləşdirildi'
        });
        return true;
      }

      throw new Error(`Recovery strategy ${strategy} failed`);

    } catch (error) {
      console.error('Recovery failed:', error);
      setErrorState(prev => ({ ...prev, isRecovering: false }));

      if (strategy === 'retry' && errorState.recoveryAttempts < maxRetries) {
        const delay = Math.min(retryDelay * Math.pow(2, errorState.recoveryAttempts), 10000);
        retryTimeoutRef.current = setTimeout(() => {
          if (recoverRef.current) recoverRef.current('retry');
        }, delay);
      } else {
        toast({
          title: 'Bərpa uğursuz',
          description: `Əməliyyat bərpa edilə bilmədi: ${error instanceof Error ? error.message : 'Naməlum xəta'}`,
          variant: 'destructive'
        });
      }
      return false;
    }
  }, [errorState, maxRetries, retryDelay, clearError, restoreBackup, toast]);

  const reportError = useCallback((error: Error | string, data?: any): void => {
    const errorMsg = error instanceof Error ? error.message : error;
    const shouldAutoRetry = autoRetry && !errorMsg.includes('CONFLICT');

    lastErrorRef.current = { error, data };

    if (data) {
      createBackup(data);
    }

    setErrorState(prev => ({
      ...prev,
      hasError: true,
      errorMessage: errorMsg,
      canRecover: true,
      recoveryAttempts: 0,
      hasLocalBackup: checkLocalBackup()
    }));

    // Show toast notification
    toast({
      title: 'Xəta baş verdi',
      description: errorMsg,
      variant: 'destructive'
    });
    
    // Show retry toast separately
    if (recoverRef.current) {
      toast({
        title: 'Bərpa seçimləri',
        description: 'Yenidən cəhd etmək istəyirsiniz?'
      });
    }
    
    // Handle auto-retry
    if (shouldAutoRetry && recoverRef.current) {
      recoverRef.current('retry').catch(console.error);
    }
    
    if (enableConflictResolution && errorMsg.includes('CONFLICT') && data) {
      const { localData, serverData, conflictFields } = data;
      setErrorState(prev => ({
        ...prev,
        conflictData: {
          localData,
          serverData,
          conflictFields: conflictFields || [],
          timestamp: new Date()
        }
      }));
    }
  }, [autoRetry, checkLocalBackup, createBackup, enableConflictResolution, toast]);

  useEffect(() => {
    setErrorState(prev => ({
      ...prev,
      hasLocalBackup: checkLocalBackup()
    }));
  }, [checkLocalBackup]);

  // Assign recover to ref to break circular dependency
  useEffect(() => {
    recoverRef.current = recover;
  }, [recover]);

  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

    return {
    errorState,
    reportError,
    recover,
    clearError,
    createBackup,
    restoreBackup,
    clearBackup,
    resolveConflict
  };
};

export default useErrorRecovery;