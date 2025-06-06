
import { useState, useCallback } from 'react';

export interface ErrorRecoveryState {
  hasError: boolean;
  errorMessage: string | null;
  canRecover: boolean;
  recoveryAttempts: number;
}

export interface UseErrorRecoveryResult {
  errorState: ErrorRecoveryState;
  reportError: (error: Error | string) => void;
  recover: () => Promise<boolean>;
  clearError: () => void;
}

export const useErrorRecovery = (): UseErrorRecoveryResult => {
  const [errorState, setErrorState] = useState<ErrorRecoveryState>({
    hasError: false,
    errorMessage: null,
    canRecover: false,
    recoveryAttempts: 0
  });

  const reportError = useCallback((error: Error | string) => {
    const message = typeof error === 'string' ? error : error.message;
    setErrorState({
      hasError: true,
      errorMessage: message,
      canRecover: true,
      recoveryAttempts: 0
    });
  }, []);

  const recover = useCallback(async (): Promise<boolean> => {
    try {
      setErrorState(prev => ({
        ...prev,
        recoveryAttempts: prev.recoveryAttempts + 1
      }));
      
      // Mock recovery implementation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setErrorState({
        hasError: false,
        errorMessage: null,
        canRecover: false,
        recoveryAttempts: 0
      });
      
      return true;
    } catch (error) {
      console.error('Recovery failed:', error);
      return false;
    }
  }, []);

  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      errorMessage: null,
      canRecover: false,
      recoveryAttempts: 0
    });
  }, []);

  return {
    errorState,
    reportError,
    recover,
    clearError
  };
};

export default useErrorRecovery;
