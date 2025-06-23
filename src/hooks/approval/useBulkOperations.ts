import { useState, useCallback, useEffect } from 'react';
import BulkOperationService, { 
  BulkReviewData,
  BulkActionResult,
  BulkActionParams,
  ServiceResponse 
} from '@/services/approval/bulkOperationService';
import { ApprovalItem } from '@/services/approval/enhancedApprovalService';

export interface UseBulkOperationsProps {
  selectedItems?: ApprovalItem[];
  onOperationComplete?: (result: BulkActionResult) => void;
  onError?: (error: string) => void;
  autoLoadData?: boolean;
}

export interface UseBulkOperationsReturn {
  // Data
  bulkData: BulkReviewData | null;
  selectedCount: number;
  
  // Loading states
  isLoadingData: boolean;
  isProcessing: boolean;
  error: string | null;
  
  // Actions
  loadBulkData: (entryIds: string[]) => Promise<void>;
  executeBulkApproval: (params?: BulkActionParams) => Promise<void>;
  executeBulkRejection: (reason: string, params?: BulkActionParams) => Promise<void>;
  clearData: () => void;
  clearError: () => void;
  
  // Computed states
  canApproveAll: boolean;
  canRejectAll: boolean;
  requiresManualReview: boolean;
  hasValidationErrors: boolean;
  hasValidationWarnings: boolean;
  averageCompletion: number;
  totalSchools: number;
  totalCategories: number;
}

/**
 * Bulk Operations Hook
 * 
 * Bu hook approval prosesində bulk əməliyyatları idarə etmək üçün
 * lazım olan funksionallığı təmin edir
 */
export const useBulkOperations = (props: UseBulkOperationsProps = {}): UseBulkOperationsReturn => {
  
  // State management
  const [bulkData, setBulkData] = useState<BulkReviewData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load bulk data
  const loadBulkData = useCallback(async (entryIds: string[]) => {
    if (entryIds.length === 0) {
      setBulkData(null);
      return;
    }

    setIsLoadingData(true);
    setError(null);

    try {
      console.log('Loading bulk data for', entryIds.length, 'entries');
      
      const result = await BulkOperationService.getBulkReviewData(entryIds);
      
      if (result.success && result.data) {
        setBulkData(result.data);
        
        console.log('Bulk data loaded successfully:', {
          totalEntries: result.data.selectedEntries.length,
          averageCompletion: result.data.aggregatedStats.averageCompletion,
          hasErrors: result.data.bulkValidationResults.hasErrors,
          hasWarnings: result.data.bulkValidationResults.hasWarnings
        });
      } else {
        const errorMessage = result.error || 'Bulk məlumatları alınarkən xəta';
        setError(errorMessage);
        console.error('Failed to load bulk data:', errorMessage);
        
        if (props.onError) {
          props.onError(errorMessage);
        }
      }

    } catch (error: any) {
      const errorMessage = error.message || 'Naməlum xəta';
      setError(errorMessage);
      console.error('Error loading bulk data:', error);
      
      if (props.onError) {
        props.onError(errorMessage);
      }
    } finally {
      setIsLoadingData(false);
    }
  }, [props.onError]);

  // Execute bulk approval
  const executeBulkApproval = useCallback(async (params: BulkActionParams = {}) => {
    if (!bulkData || bulkData.selectedEntries.length === 0) {
      setError('Bulk məlumatları mövcud deyil və ya heç bir element seçilməyib');
      return;
    }

    // Validation errors varsa və bypass edilməyibsə
    if (bulkData.bulkValidationResults.hasErrors && !params.bypassValidation) {
      setError('Validation xətaları var. Əvvəlcə xətaları düzəldin və ya bypassValidation istifadə edin');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const entryIds = bulkData.selectedEntries.map(entry => entry.id);
      
      console.log('Executing bulk approval for', entryIds.length, 'entries');
      
      const result = await BulkOperationService.executeBulkApproval(entryIds, params);
      
      if (result.success && result.data) {
        console.log('Bulk approval completed:', {
          processedCount: result.data.processedCount,
          errorCount: result.data.errorCount,
          totalRequested: result.data.summary.totalRequested
        });

        // Callback çağır
        if (props.onOperationComplete) {
          props.onOperationComplete(result.data);
        }

        // Data-nı təmizlə (çünki artıq processed olub)
        setBulkData(null);
        
      } else {
        const errorMessage = result.error || 'Bulk təsdiq zamanı xəta';
        setError(errorMessage);
        console.error('Bulk approval failed:', errorMessage);
        
        if (props.onError) {
          props.onError(errorMessage);
        }
      }

    } catch (error: any) {
      const errorMessage = error.message || 'Naməlum xəta';
      setError(errorMessage);
      console.error('Error executing bulk approval:', error);
      
      if (props.onError) {
        props.onError(errorMessage);
      }
    } finally {
      setIsProcessing(false);
    }
  }, [bulkData, props.onOperationComplete, props.onError]);

  // Execute bulk rejection
  const executeBulkRejection = useCallback(async (reason: string, params: BulkActionParams = {}) => {
    if (!bulkData || bulkData.selectedEntries.length === 0) {
      setError('Bulk məlumatları mövcud deyil və ya heç bir element seçilməyib');
      return;
    }

    if (!reason || reason.trim() === '') {
      setError('Rədd səbəbi təqdim edilməlidir');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const entryIds = bulkData.selectedEntries.map(entry => entry.id);
      
      console.log('Executing bulk rejection for', entryIds.length, 'entries');
      
      const result = await BulkOperationService.executeBulkRejection(entryIds, reason, params);
      
      if (result.success && result.data) {
        console.log('Bulk rejection completed:', {
          processedCount: result.data.processedCount,
          errorCount: result.data.errorCount,
          totalRequested: result.data.summary.totalRequested
        });

        // Callback çağır
        if (props.onOperationComplete) {
          props.onOperationComplete(result.data);
        }

        // Data-nı təmizlə (çünki artıq processed olub)
        setBulkData(null);
        
      } else {
        const errorMessage = result.error || 'Bulk rədd zamanı xəta';
        setError(errorMessage);
        console.error('Bulk rejection failed:', errorMessage);
        
        if (props.onError) {
          props.onError(errorMessage);
        }
      }

    } catch (error: any) {
      const errorMessage = error.message || 'Naməlum xəta';
      setError(errorMessage);
      console.error('Error executing bulk rejection:', error);
      
      if (props.onError) {
        props.onError(errorMessage);
      }
    } finally {
      setIsProcessing(false);
    }
  }, [bulkData, props.onOperationComplete, props.onError]);

  // Clear data
  const clearData = useCallback(() => {
    setBulkData(null);
    setError(null);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-load effect
  useEffect(() => {
    if (props.autoLoadData && props.selectedItems && props.selectedItems.length > 0) {
      const entryIds = props.selectedItems.map(item => item.id);
      console.log('Auto-loading bulk data for', entryIds.length, 'selected items');
      loadBulkData(entryIds);
    } else if (props.selectedItems && props.selectedItems.length === 0) {
      // Clear data when no items selected
      setBulkData(null);
    }
  }, [props.autoLoadData, props.selectedItems, loadBulkData]);

  // Computed states
  const selectedCount = bulkData ? bulkData.selectedEntries.length : (props.selectedItems?.length || 0);
  
  const canApproveAll = bulkData ? 
    bulkData.bulkValidationResults.summary.canApproveAll : false;
  
  const canRejectAll = bulkData ? 
    bulkData.bulkValidationResults.summary.canRejectAll : false;
    
  const requiresManualReview = bulkData ? 
    bulkData.bulkValidationResults.summary.requiresManualReview : false;
    
  const hasValidationErrors = bulkData ? 
    bulkData.bulkValidationResults.hasErrors : false;
    
  const hasValidationWarnings = bulkData ? 
    bulkData.bulkValidationResults.hasWarnings : false;
    
  const averageCompletion = bulkData ? 
    bulkData.aggregatedStats.averageCompletion : 0;
    
  const totalSchools = bulkData ? 
    bulkData.aggregatedStats.schoolsCount : 0;
    
  const totalCategories = bulkData ? 
    bulkData.aggregatedStats.categoriesCount : 0;

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Cleanup when component unmounts
      setBulkData(null);
      setError(null);
    };
  }, []);

  return {
    // Data
    bulkData,
    selectedCount,
    
    // Loading states
    isLoadingData,
    isProcessing,
    error,
    
    // Actions
    loadBulkData,
    executeBulkApproval,
    executeBulkRejection,
    clearData,
    clearError,
    
    // Computed states
    canApproveAll,
    canRejectAll,
    requiresManualReview,
    hasValidationErrors,
    hasValidationWarnings,
    averageCompletion,
    totalSchools,
    totalCategories
  };
};

export default useBulkOperations;