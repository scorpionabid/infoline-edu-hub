import { useState, useCallback, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { CategoryWithColumns } from '@/types/category';
import { ExcelService } from '@/services/excelService';
import { 
  ImportResult, 
  ImportProgress, 
  ImportError,
  ExcelTemplateOptions,
  EXCEL_CONSTRAINTS 
} from '@/types/excel';

interface UseExcelImportOptions {
  category: CategoryWithColumns;
  schoolId: string;
  onImportComplete?: (result: ImportResult) => void;
  onProgress?: (progress: ImportProgress) => void;
}

export const useExcelImport = ({
  category,
  schoolId,
  onImportComplete,
  onProgress
}: UseExcelImportOptions) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const user = useAuthStore(state => state.user);
  
  // State management
  const [isImporting, setIsImporting] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const [lastImportResult, setLastImportResult] = useState<ImportResult | null>(null);
  const [errors, setErrors] = useState<ImportError[]>([]);
  
  // Refs for cancellation
  const importAbortController = useRef<AbortController | null>(null);
  
  /**
   * Download Excel template for the current category
   */
  const downloadTemplate = useCallback(async (options?: ExcelTemplateOptions) => {
    if (!category) {
      toast({
        title: t('error'),
        description: t('categoryNotAvailable'),
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setIsDownloadingTemplate(true);
      
      await ExcelService.downloadTemplate(category, schoolId, {
        includeInstructions: true,
        includeSampleData: true,
        formatCells: true,
        addValidation: true,
        ...options
      });
      
      toast({
        title: t('success'),
        description: t('templateDownloadedSuccessfully'),
      });
      
    } catch (error) {
      console.error('Template download failed:', error);
      toast({
        title: t('error'),
        description: error.message || t('errorDownloadingTemplate'),
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsDownloadingTemplate(false);
    }
  }, [category, schoolId, t, toast]);
  
  /**
   * Validate file before import
   */
  const validateFile = useCallback((file: File): { isValid: boolean; error?: string } => {
    // Check file size
    if (file.size > EXCEL_CONSTRAINTS.MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: t('fileSizeExceedsLimit').replace('{size}', `${EXCEL_CONSTRAINTS.MAX_FILE_SIZE / (1024 * 1024)}MB`)
      };
    }
    
    // Check file type with proper type assertion
    const validMimeTypes: string[] = EXCEL_CONSTRAINTS.SUPPORTED_MIME_TYPES as string[];
    const isValidType = validMimeTypes.includes(file.type) ||
                       EXCEL_CONSTRAINTS.SUPPORTED_FORMATS.some(format => 
                         file.name.toLowerCase().endsWith(format)
                       );
    
    if (!isValidType) {
      return {
        isValid: false,
        error: t('invalidFileType').replace('{formats}', EXCEL_CONSTRAINTS.SUPPORTED_FORMATS.join(', '))
      };
    }
    
    return { isValid: true };
  }, [t]);
  
  /**
   * Preview Excel file content (first few rows)
   */
  const previewFile = useCallback(async (file: File): Promise<{ headers: string[]; rows: any[][] }> => {
    try {
      // Validate file first
      const validation = validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }
      
      // Read and parse file
      const data = await file.arrayBuffer();
      const XLSX = await import('xlsx');
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      if (jsonData.length < 1) {
        throw new Error(t('fileContainsNoData'));
      }
      
      return {
        headers: jsonData[0] || [],
        rows: jsonData.slice(1, 6) // First 5 data rows for preview
      };
      
    } catch (error) {
      console.error('File preview failed:', error);
      throw error;
    }
  }, [validateFile, t]);
  
  /**
   * Import Excel file with progress tracking
   */
  const importFile = useCallback(async (file: File): Promise<ImportResult> => {
    if (!user?.id) {
      throw new Error(t('userNotAuthenticated'));
    }
    
    if (!category?.id) {
      throw new Error(t('categoryNotAvailable'));
    }
    
    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }
    
    // Create abort controller for cancellation
    importAbortController.current = new AbortController();
    
    try {
      setIsImporting(true);
      setErrors([]);
      setLastImportResult(null);
      
      // Initialize progress
      const initialProgress: ImportProgress = {
        phase: 'parsing',
        currentRow: 0,
        totalRows: 0,
        successfulRows: 0,
        failedRows: 0,
        percentage: 0,
        message: t('preparingImport')
      };
      
      setImportProgress(initialProgress);
      onProgress?.(initialProgress);
      
      // Simulate progress updates (in real implementation, this would come from the service)
      const progressInterval = setInterval(() => {
        setImportProgress(prev => {
          if (!prev || importAbortController.current?.signal.aborted) return prev;
          
          let newProgress = { ...prev };
          
          switch (prev.phase) {
            case 'parsing':
              newProgress.percentage = Math.min(prev.percentage + 8, 20);
              newProgress.message = t('parsingFile');
              if (newProgress.percentage >= 20) {
                newProgress.phase = 'validating';
                newProgress.message = t('validatingData');
              }
              break;
            case 'validating':
              newProgress.percentage = Math.min(prev.percentage + 12, 40);
              if (newProgress.percentage >= 40) {
                newProgress.phase = 'processing';
                newProgress.message = t('savingData');
              }
              break;
            case 'processing':
              newProgress.percentage = Math.min(prev.percentage + 15, 90);
              break;
          }
          
          onProgress?.(newProgress);
          return newProgress;
        });
      }, 500);
      
      // Perform actual import
      const result = await ExcelService.importExcelFile(file, category.id, schoolId, user.id);
      
      clearInterval(progressInterval);
      
      // Final progress update
      const finalProgress: ImportProgress = {
        phase: 'completed',
        currentRow: result.totalRows,
        totalRows: result.totalRows,
        successfulRows: result.successfulRows,
        failedRows: result.failedRows,
        percentage: 100,
        message: result.success ? t('importCompleted') : t('importCompletedWithErrors')
      };
      
      setImportProgress(finalProgress);
      onProgress?.(finalProgress);
      
      // Store results
      setLastImportResult(result);
      setErrors(result.errors);
      
      // Show notification
      toast({
        title: result.success ? t('success') : t('warning'),
        description: result.message,
        variant: result.success ? 'default' : 'destructive'
      });
      
      // Notify completion
      onImportComplete?.(result);
      
      return result;
      
    } catch (error: any) {
      console.error('Import failed:', error);
      
      const errorResult: ImportResult = {
        success: false,
        totalRows: 0,
        successfulRows: 0,
        failedRows: 0,
        errors: [{ row: 0, column: 'general', value: '', error: error.message, severity: 'error' }],
        message: error.message || t('importFailed')
      };
      
      setLastImportResult(errorResult);
      setErrors(errorResult.errors);
      
      // Final progress with error
      const errorProgress: ImportProgress = {
        phase: 'failed',
        currentRow: 0,
        totalRows: 0,
        successfulRows: 0,
        failedRows: 0,
        percentage: 0,
        message: error.message || t('importFailed')
      };
      
      setImportProgress(errorProgress);
      onProgress?.(errorProgress);
      
      toast({
        title: t('error'),
        description: error.message || t('importFailed'),
        variant: 'destructive'
      });
      
      throw error;
    } finally {
      setIsImporting(false);
      importAbortController.current = null;
    }
  }, [user?.id, category?.id, schoolId, validateFile, onProgress, onImportComplete, t, toast]);
  
  /**
   * Cancel ongoing import operation
   */
  const cancelImport = useCallback(() => {
    if (importAbortController.current) {
      importAbortController.current.abort();
      setIsImporting(false);
      setImportProgress(null);
      
      toast({
        title: t('info'),
        description: t('importCancelled')
      });
    }
  }, [t, toast]);
  
  /**
   * Reset import state
   */
  const resetImport = useCallback(() => {
    setImportProgress(null);
    setLastImportResult(null);
    setErrors([]);
  }, []);
  
  /**
   * Get import statistics
   */
  const getImportStats = useCallback(() => {
    if (!lastImportResult) return null;
    
    return {
      totalRows: lastImportResult.totalRows,
      successfulRows: lastImportResult.successfulRows,
      failedRows: lastImportResult.failedRows,
      successRate: lastImportResult.totalRows > 0 
        ? Math.round((lastImportResult.successfulRows / lastImportResult.totalRows) * 100)
        : 0,
      hasErrors: lastImportResult.errors.length > 0,
      errorCount: lastImportResult.errors.length
    };
  }, [lastImportResult]);
  
  return {
    // State
    isImporting,
    isDownloadingTemplate,
    importProgress,
    lastImportResult,
    errors,
    
    // Actions
    downloadTemplate,
    validateFile,
    previewFile,
    importFile,
    cancelImport,
    resetImport,
    
    // Computed
    canImport: !isImporting && category && schoolId && user?.id,
    canCancel: isImporting && importAbortController.current,
    importStats: getImportStats()
  };
};
