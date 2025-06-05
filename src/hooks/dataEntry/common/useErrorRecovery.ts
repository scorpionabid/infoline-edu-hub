
import { useState, useCallback } from 'react';

export interface ErrorRecoveryState {
  hasError: boolean;
  errorMessage: string;
  retryCount: number;
  isRecovering: boolean;
}

export interface UseErrorRecoveryResult {
  errorState: ErrorRecoveryState;
  handleError: (error: Error) => void;
  retry: () => void;
  clearError: () => void;
  canRetry: boolean;
}

const MAX_RETRY_COUNT = 3;

export const useErrorRecovery = (
  onRetry?: () => Promise<void>
): UseErrorRecoveryResult => {
  const [errorState, setErrorState] = useState<ErrorRecoveryState>({
    hasError: false,
    errorMessage: '',
    retryCount: 0,
    isRecovering: false
  });

  const handleError = useCallback((error: Error) => {
    console.error('Error occurred:', error);
    setErrorState(prev => ({
      ...prev,
      hasError: true,
      errorMessage: error.message || 'Bilinməyən xəta baş verdi',
      isRecovering: false
    }));
  }, []);

  const retry = useCallback(async () => {
    if (errorState.retryCount >= MAX_RETRY_COUNT) {
      console.warn('Maximum retry count reached');
      return;
    }

    setErrorState(prev => ({
      ...prev,
      isRecovering: true,
      retryCount: prev.retryCount + 1
    }));

    try {
      if (onRetry) {
        await onRetry();
      }
      
      setErrorState(prev => ({
        ...prev,
        hasError: false,
        errorMessage: '',
        isRecovering: false
      }));
    } catch (error) {
      handleError(error as Error);
    }
  }, [errorState.retryCount, onRetry, handleError]);

  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      errorMessage: '',
      retryCount: 0,
      isRecovering: false
    });
  }, []);

  const canRetry = errorState.retryCount < MAX_RETRY_COUNT && !errorState.isRecovering;

  return {
    errorState,
    handleError,
    retry,
    clearError,
    canRetry
  };
};

export default useErrorRecovery;
