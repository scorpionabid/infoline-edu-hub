import { useState, useCallback, useEffect, useRef } from 'react';
import DataReviewService, { 
  EntryDetailData, 
  ValidationResult, 
  ColumnDataEntry,
  ServiceResponse 
} from '@/services/approval/dataReviewService';

export interface UseDataReviewProps {
  entryId?: string;
  autoLoad?: boolean;
  onDataLoaded?: (data: EntryDetailData) => void;
  onError?: (error: string) => void;
  throttleMs?: number; // Throttle delay for load operations
}

export interface UseDataReviewReturn {
  // Data
  entryData: EntryDetailData | null;
  validationResults: ValidationResult[];
  columnData: ColumnDataEntry[];
  
  // Loading states
  isLoading: boolean;
  isValidating: boolean;
  error: string | null;
  
  // Actions
  loadEntryData: (entryId: string) => Promise<void>;
  validateEntry: (entryId: string) => Promise<ValidationResult[]>;
  refreshData: () => Promise<void>;
  clearError: () => void;
  
  // Computed states
  hasValidationErrors: boolean;
  hasValidationWarnings: boolean;
  isDataComplete: boolean;
  completionPercentage: number;
  requiredCompletionPercentage: number;
}

/**
 * Data Review Hook
 * 
 * Bu hook approval prosesində entry-nin detallı məlumatlarını
 * review etmək üçün lazım olan funksionallığı təmin edir
 */
export const useDataReview = (props: UseDataReviewProps = {}): UseDataReviewReturn => {
  
  // State management
  const [entryData, setEntryData] = useState<EntryDetailData | null>(null);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [columnData, setColumnData] = useState<ColumnDataEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Throttling refs
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastLoadedEntryRef = useRef<string | null>(null);
  const throttleMs = props.throttleMs || 1000; // Default 1 second throttle

  // Load entry data with throttling
  const loadEntryData = useCallback(async (entryId: string, forceLoad: boolean = false) => {
    if (!entryId || entryId.trim() === '') {
      setError('Entry ID göstərilmədi');
      return;
    }

    // Check if already loaded and not forcing
    if (!forceLoad && lastLoadedEntryRef.current === entryId) {
      console.log('Entry already loaded, skipping:', entryId);
      return;
    }

    // Clear existing timeout
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }

    // Throttle the load operation
    loadTimeoutRef.current = setTimeout(async () => {
      if (!forceLoad && lastLoadedEntryRef.current === entryId) {
        return; // Double-check before loading
      }

      setIsLoading(true);
      setError(null);
      lastLoadedEntryRef.current = entryId;

      try {
        console.log('Loading detailed data for entry (throttled):', entryId);
        
        const result = await DataReviewService.getEntryDetailedData(entryId);
        
        if (result.success && result.data) {
          setEntryData(result.data);
          setValidationResults(result.data.validationResults);
          setColumnData(result.data.columns);
          
          console.log('Entry data loaded successfully:', {
            entryId,
            columnsCount: result.data.columns.length,
            validationCount: result.data.validationResults.length,
            completionPercentage: result.data.completionStats.completionPercentage
          });

          // Callback çağır
          if (props.onDataLoaded) {
            props.onDataLoaded(result.data);
          }
        } else {
          const errorMessage = result.error || 'Məlumatlar alınarkən xəta';
          setError(errorMessage);
          console.error('Failed to load entry data:', errorMessage);
          
          // Reset last loaded on error
          lastLoadedEntryRef.current = null;
          
          // Callback çağır
          if (props.onError) {
            props.onError(errorMessage);
          }
        }

      } catch (error: any) {
        const errorMessage = error.message || 'Naməlum xəta';
        setError(errorMessage);
        console.error('Error loading entry data:', error);
        
        // Reset last loaded on error
        lastLoadedEntryRef.current = null;
        
        // Callback çağır
        if (props.onError) {
          props.onError(errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    }, throttleMs);
  }, [props.onDataLoaded, props.onError, throttleMs]);

  // Validate entry
  const validateEntry = useCallback(async (entryId: string): Promise<ValidationResult[]> => {
    if (!entryId || entryId.trim() === '') {
      console.warn('Entry ID not provided for validation');
      return [];
    }

    setIsValidating(true);
    
    try {
      console.log('Validating entry:', entryId);
      
      const result = await DataReviewService.validateEntryData(entryId);
      
      if (result.success && result.data) {
        setValidationResults(result.data);
        console.log('Entry validation completed:', {
          entryId,
          validationCount: result.data.length,
          errors: result.data.filter(r => r.severity === 'error').length,
          warnings: result.data.filter(r => r.severity === 'warning').length
        });
        
        return result.data;
      } else {
        console.error('Validation failed:', result.error);
        return [];
      }

    } catch (error: any) {
      console.error('Error validating entry:', error);
      return [];
    } finally {
      setIsValidating(false);
    }
  }, []);

  // Refresh data with force flag
  const refreshData = useCallback(async () => {
    if (entryData?.entryId) {
      console.log('Refreshing data for entry (forced):', entryData.entryId);
      await loadEntryData(entryData.entryId, true); // Force reload
    }
  }, [entryData?.entryId, loadEntryData]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-load effect
  useEffect(() => {
    if (props.autoLoad && props.entryId) {
      console.log('Auto-loading entry data:', props.entryId);
      loadEntryData(props.entryId);
    }
  }, [props.autoLoad, props.entryId, loadEntryData]);

  // Computed states
  const hasValidationErrors = validationResults.some(result => result.severity === 'error');
  const hasValidationWarnings = validationResults.some(result => result.severity === 'warning');
  
  const isDataComplete = entryData?.completionStats ? 
    entryData.completionStats.requiredCompletionPercentage === 100 : false;
  
  const completionPercentage = entryData?.completionStats?.completionPercentage || 0;
  const requiredCompletionPercentage = entryData?.completionStats?.requiredCompletionPercentage || 0;

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Cleanup when component unmounts
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
      setEntryData(null);
      setValidationResults([]);
      setColumnData([]);
      setError(null);
      lastLoadedEntryRef.current = null;
    };
  }, []);

  return {
    // Data
    entryData,
    validationResults,
    columnData,
    
    // Loading states
    isLoading,
    isValidating,
    error,
    
    // Actions
    loadEntryData,
    validateEntry,
    refreshData,
    clearError,
    
    // Computed states
    hasValidationErrors,
    hasValidationWarnings,
    isDataComplete,
    completionPercentage,
    requiredCompletionPercentage
  };
};

export default useDataReview;