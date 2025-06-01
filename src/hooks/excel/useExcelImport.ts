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
    
    // Check file type
    const isValidType = EXCEL_CONSTRAINTS.SUPPORTED_MIME_TYPES.includes(file.type) ||
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
      const initialProgress: ImportProgress = {\n        phase: 'parsing',\n        currentRow: 0,\n        totalRows: 0,\n        successfulRows: 0,\n        failedRows: 0,\n        percentage: 0,\n        message: t('preparingImport')\n      };\n      \n      setImportProgress(initialProgress);\n      onProgress?.(initialProgress);\n      \n      // Simulate progress updates (in real implementation, this would come from the service)\n      const progressInterval = setInterval(() => {\n        setImportProgress(prev => {\n          if (!prev || importAbortController.current?.signal.aborted) return prev;\n          \n          let newProgress = { ...prev };\n          \n          switch (prev.phase) {\n            case 'parsing':\n              newProgress.percentage = Math.min(prev.percentage + 8, 20);\n              newProgress.message = t('parsingFile');\n              if (newProgress.percentage >= 20) {\n                newProgress.phase = 'validating';\n                newProgress.message = t('validatingData');\n              }\n              break;\n            case 'validating':\n              newProgress.percentage = Math.min(prev.percentage + 12, 40);\n              if (newProgress.percentage >= 40) {\n                newProgress.phase = 'processing';\n                newProgress.message = t('savingData');\n              }\n              break;\n            case 'processing':\n              newProgress.percentage = Math.min(prev.percentage + 15, 90);\n              break;\n          }\n          \n          onProgress?.(newProgress);\n          return newProgress;\n        });\n      }, 500);\n      \n      // Perform actual import\n      const result = await ExcelService.importExcelFile(file, category.id, schoolId, user.id);\n      \n      clearInterval(progressInterval);\n      \n      // Final progress update\n      const finalProgress: ImportProgress = {\n        phase: 'completed',\n        currentRow: result.totalRows,\n        totalRows: result.totalRows,\n        successfulRows: result.successfulRows,\n        failedRows: result.failedRows,\n        percentage: 100,\n        message: result.success ? t('importCompleted') : t('importCompletedWithErrors')\n      };\n      \n      setImportProgress(finalProgress);\n      onProgress?.(finalProgress);\n      \n      // Store results\n      setLastImportResult(result);\n      setErrors(result.errors);\n      \n      // Show notification\n      toast({\n        title: result.success ? t('success') : t('warning'),\n        description: result.message,\n        variant: result.success ? 'default' : 'destructive'\n      });\n      \n      // Notify completion\n      onImportComplete?.(result);\n      \n      return result;\n      \n    } catch (error: any) {\n      console.error('Import failed:', error);\n      \n      const errorResult: ImportResult = {\n        success: false,\n        totalRows: 0,\n        successfulRows: 0,\n        failedRows: 0,\n        errors: [{ row: 0, column: 'general', value: '', error: error.message, severity: 'error' }],\n        message: error.message || t('importFailed')\n      };\n      \n      setLastImportResult(errorResult);\n      setErrors(errorResult.errors);\n      \n      // Final progress with error\n      const errorProgress: ImportProgress = {\n        phase: 'failed',\n        currentRow: 0,\n        totalRows: 0,\n        successfulRows: 0,\n        failedRows: 0,\n        percentage: 0,\n        message: error.message || t('importFailed')\n      };\n      \n      setImportProgress(errorProgress);\n      onProgress?.(errorProgress);\n      \n      toast({\n        title: t('error'),\n        description: error.message || t('importFailed'),\n        variant: 'destructive'\n      });\n      \n      throw error;\n    } finally {\n      setIsImporting(false);\n      importAbortController.current = null;\n    }\n  }, [user?.id, category?.id, schoolId, validateFile, onProgress, onImportComplete, t, toast]);\n  \n  /**\n   * Cancel ongoing import operation\n   */\n  const cancelImport = useCallback(() => {\n    if (importAbortController.current) {\n      importAbortController.current.abort();\n      setIsImporting(false);\n      setImportProgress(null);\n      \n      toast({\n        title: t('info'),\n        description: t('importCancelled')\n      });\n    }\n  }, [t, toast]);\n  \n  /**\n   * Reset import state\n   */\n  const resetImport = useCallback(() => {\n    setImportProgress(null);\n    setLastImportResult(null);\n    setErrors([]);\n  }, []);\n  \n  /**\n   * Get import statistics\n   */\n  const getImportStats = useCallback(() => {\n    if (!lastImportResult) return null;\n    \n    return {\n      totalRows: lastImportResult.totalRows,\n      successfulRows: lastImportResult.successfulRows,\n      failedRows: lastImportResult.failedRows,\n      successRate: lastImportResult.totalRows > 0 \n        ? Math.round((lastImportResult.successfulRows / lastImportResult.totalRows) * 100)\n        : 0,\n      hasErrors: lastImportResult.errors.length > 0,\n      errorCount: lastImportResult.errors.length\n    };\n  }, [lastImportResult]);\n  \n  return {\n    // State\n    isImporting,\n    isDownloadingTemplate,\n    importProgress,\n    lastImportResult,\n    errors,\n    \n    // Actions\n    downloadTemplate,\n    validateFile,\n    previewFile,\n    importFile,\n    cancelImport,\n    resetImport,\n    \n    // Computed\n    canImport: !isImporting && category && schoolId && user?.id,\n    canCancel: isImporting && importAbortController.current,\n    importStats: getImportStats()\n  };\n};\n