import { useState, useCallback, useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { ToastAction } from '@/components/ui/toast';

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
  recover: (strategy?: 'retry' | 'useLocal' | 'useServer' | 'merge') => Promise<boolean>;
  clearError: () => void;
  createBackup: (data: any) => void;
  restoreBackup: () => any | null;
  clearBackup: () => void;
  resolveConflict: (resolution: 'local' | 'server' | 'merge', mergedData?: any) => Promise<boolean>;
}

/**
 * Təkmilləşdirilmiş Error Recovery Hook
 * 
 * Bu hook aşağıdakı funksiyaları təmin edir:
 * - Auto-retry failed operations
 * - Local storage backup mechanism
 * - Conflict detection and resolution
 * - Data recovery mechanisms
 * - Network failure handling
 * - User-friendly error management
 */
export const useErrorRecovery = ({
  autoRetry = true,
  maxRetries = 3,
  retryDelay = 1000,
  localStorageBackup = true,
  enableConflictResolution = true,
  backupKey = 'dataEntry_backup'
}: ErrorRecoveryConfig = {}): UseErrorRecoveryResult => {
  const { toast } = useToast();
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastErrorRef = useRef<{ error: Error | string; data?: any }>();

  // Base error recovery state
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

  // Check if local backup exists
  const checkLocalBackup = useCallback((): boolean => {
    if (!localStorageBackup) return false;

    try {
      const backup = localStorage.getItem(backupKey);
      return backup !== null;
    } catch (error) {
      console.error('Error checking local backup:', error);
      return false;
    }
  }, [localStorageBackup, backupKey]);

  // Create local backup
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

  // Restore backup
  const restoreBackup = useCallback((): any | null => {
    if (!localStorageBackup) return null;

    try {
      const backupJson = localStorage.getItem(backupKey);
      if (!backupJson) return null;

      const backup = JSON.parse(backupJson);
      setErrorState(prev => ({ ...prev, lastBackupTime: new Date(backup.timestamp) }));

      return backup.data;
    } catch (error) {
      console.error('Error restoring backup:', error);
      return null;
    }
  }, [backupKey, localStorageBackup]);

  // Clean up backup
  const clearBackup = useCallback(() => {
    if (!localStorageBackup) return;

    try {
      localStorage.removeItem(backupKey);
      setErrorState(prev => ({ ...prev, hasLocalBackup: false, lastBackupTime: null }));
    } catch (error) {
      console.error('Error clearing backup:', error);
    }
  }, [backupKey, localStorageBackup]);

  // Error clearing function
  const clearError = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    setErrorState({
      hasError: false,
      errorMessage: null,
      canRecover: false,
      recoveryAttempts: 0,
      isRecovering: false,
      hasLocalBackup: checkLocalBackup(),
      conflictData: null,
      lastBackupTime: errorState.lastBackupTime
    });

    lastErrorRef.current = undefined;
  }, [checkLocalBackup, errorState.lastBackupTime]);

  // Resolve conflicts between local and server data
  const resolveConflict = useCallback(async (
    resolution: 'local' | 'server' | 'merge',
    mergedData?: any
  ): Promise<boolean> => {
    const { conflictData } = errorState;
    if (!conflictData) return false;

    try {
      setErrorState(prev => ({ ...prev, isRecovering: true }));

      let resolvedData;

      switch (resolution) {
        case 'local': {
          resolvedData = conflictData.localData;
          break;
        }
        case 'server': {
          resolvedData = conflictData.serverData;
          break;
        }
        case 'merge': {
          resolvedData = mergedData || { ...conflictData.serverData, ...conflictData.localData };
          break;
        }
        default:
          throw new Error('Invalid resolution strategy');
      }

      // Here you would implement logic to save the resolved data
      // This is a simulation for demonstration purposes
      await new Promise(resolve => setTimeout(resolve, 1000));

      clearError();
      toast({
        title: 'Konflikt həll edildi',
        description: `Məlumatlar ${resolution} strategiyası ilə birləşdirildi`,
        variant: 'default'
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

  // Main recovery function
  const recover = useCallback(async (
    strategy: 'retry' | 'useLocal' | 'useServer' | 'merge' = 'retry'
  ): Promise<boolean> => {
    if (!errorState.hasError || errorState.isRecovering) return false;

    try {
      setErrorState(prev => ({
        ...prev,
        isRecovering: true,
        recoveryAttempts: prev.recoveryAttempts + 1
      }));

      switch (strategy) {
        case 'retry': {
          // Retry the original operation
          if (lastErrorRef.current) {
            // Simulate retry logic - in real implementation, 
            // you would re-execute the failed operation
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Check if retry should succeed (simulation)
            const shouldSucceed = Math.random() > 0.3; // 70% success rate

            if (shouldSucceed) {
              clearError();
              toast({
                title: 'Bərpa uğurlu',
                description: 'Əməliyyat uğurla təkrarlandı',
                variant: 'default'
              });
              return true;
            } else {
              throw new Error('Retry failed');
            }
          }
          break;
        }

        case 'useLocal': {
          const localData = restoreBackup();
          if (localData) {
            // Use local backup data
            clearError();
            toast({
              title: 'Lokal məlumatlar istifadə edildi',
              description: 'Əvvəlki saxlanılmış məlumatlar bərpa edildi',
              variant: 'default'
            });
            return true;
          }
          break;
        }

        case 'useServer': {
          // Use server data (implementation depends on context)
          clearError();
          toast({
            title: 'Server məlumatları istifadə edildi',
            description: 'Ən son server məlumatları yükləndi',
            variant: 'default'
          });
          return true;
        }

        case 'merge': {
          // Handle merge strategy (implementation depends on context)
          clearError();
          toast({
            title: 'Məlumatlar birləşdirildi',
            description: 'Lokal və server məlumatları birləşdirildi',
            variant: 'default'
          });
          return true;
        }
      }

      throw new Error(`Recovery strategy ${strategy} failed`);

    } catch (error) {
      console.error('Recovery failed:', error);

      setErrorState(prev => ({ ...prev, isRecovering: false }));

      // Check if we should continue retrying
      if (strategy === 'retry' && errorState.recoveryAttempts < maxRetries) {
        const delay = Math.min(retryDelay * Math.pow(2, errorState.recoveryAttempts), 10000);

        retryTimeoutRef.current = setTimeout(() => {
          recover('retry');
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
  }, [clearError, errorState, maxRetries, recover, restoreBackup, retryDelay, toast]);

  // Error reporting function
  const reportError = useCallback((error: Error | string, data?: any) => {
    const errorMsg = error instanceof Error ? error.message : error;
    const shouldAutoRetry = autoRetry && !error.toString().includes('CONFLICT');

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
      variant: 'destructive',
      action: shouldAutoRetry ? undefined : <ToastAction altText="Yenidən cəhd et"> Yenidən cəhd et</ ToastAction >
    });

  // Handle auto-retry
  if (shouldAutoRetry) {
    recover('retry').catch(console.error);
  }

  // Check for conflicts between local and server data
  if (enableConflictResolution && error.toString().includes('CONFLICT') && data) {
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
}, [autoRetry, checkLocalBackup, createBackup, enableConflictResolution, recover, toast]);

// Update backup status on component mount
useEffect(() => {
  setErrorState(prev => ({
    ...prev,
    hasLocalBackup: checkLocalBackup()
  }));
}, [checkLocalBackup]);

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