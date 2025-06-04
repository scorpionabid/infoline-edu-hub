import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Upload, 
  FileSpreadsheet, 
  Download, 
  AlertCircle, 
  CheckCircle, 
  X,
  Eye,
  Play,
  Pause,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { CategoryWithColumns } from '@/types/category';
import { ExcelService } from '@/services/excelService';
import { ImportResult, ImportError } from '@/types/excel';

interface UploadProgress {
  phase: 'uploading' | 'parsing' | 'validating' | 'processing' | 'completing' | 'completed' | 'failed';
  percentage: number;
  currentRow?: number;
  totalRows?: number;
  message?: string;
  errors?: ImportError[];
  warnings?: ImportError[];
}

interface FilePreview {
  file: File;
  preview: any[][];
  headers: string[];
  rowCount: number;
  isValid: boolean;
  errors: string[];
}

interface EnhancedExcelUploadProps {
  category: CategoryWithColumns;
  schoolId: string;
  userId: string;
  onUploadComplete?: (result: ImportResult) => void;
  onUploadStart?: () => void;
  onUploadError?: (error: Error) => void;
  maxFileSize?: number; // in bytes
  allowedFileTypes?: string[];
  showPreview?: boolean;
  autoProcess?: boolean;
  className?: string;
}

export const EnhancedExcelUpload: React.FC<EnhancedExcelUploadProps> = ({
  category,
  schoolId,
  userId,
  onUploadComplete,
  onUploadStart,
  onUploadError,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  allowedFileTypes = ['.xlsx', '.xls', '.csv'],
  showPreview = true,
  autoProcess = false,
  className = ''
}) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  // State management
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [filePreview, setFilePreview] = useState<FilePreview | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  
  // Refs for controlling upload process
  const abortControllerRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Progress update function
  const updateProgress = useCallback((update: Partial<UploadProgress>) => {
    setUploadProgress(prev => prev ? { ...prev, ...update } : null);
  }, []);

  // File validation
  const validateFile = useCallback((file: File): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Check file size
    if (file.size > maxFileSize) {
      errors.push(t('fileSizeExceedsLimit') || `File size exceeds ${maxFileSize / (1024 * 1024)}MB limit`);
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedFileTypes.includes(fileExtension)) {
      errors.push(t('unsupportedFileType') || `Unsupported file type. Use: ${allowedFileTypes.join(', ')}`);
    }

    // Check file name length
    if (file.name.length > 255) {
      errors.push(t('fileNameTooLong') || 'File name too long');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [maxFileSize, allowedFileTypes, t]);

  // Preview file content
  const previewFile = useCallback(async (file: File): Promise<FilePreview> => {
    const validation = validateFile(file);
    
    if (!validation.isValid) {
      return {
        file,
        preview: [],
        headers: [],
        rowCount: 0,
        isValid: false,
        errors: validation.errors
      };
    }

    try {
      // Parse file to get preview
      const data = await file.arrayBuffer();
      const XLSX = await import('xlsx');
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      const headers = jsonData[0] as string[] || [];
      const preview = jsonData.slice(0, 6); // Show first 5 rows + header
      const rowCount = jsonData.length - 1; // Exclude header

      return {
        file,
        preview,
        headers,
        rowCount,
        isValid: true,
        errors: []
      };
    } catch (error) {
      return {
        file,
        preview: [],
        headers: [],
        rowCount: 0,
        isValid: false,
        errors: [t('errorReadingFile') || 'Error reading file']
      };
    }
  }, [validateFile, t]);

  // Handle file drop or selection
  const handleFileAccepted = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    console.log('File accepted:', file.name, file.size);

    try {
      // Show initial progress
      setUploadProgress({
        phase: 'uploading',
        percentage: 10,
        message: t('readingFile') || 'Reading file'
      });

      // Preview the file
      const preview = await previewFile(file);
      setFilePreview(preview);

      if (!preview.isValid) {
        setUploadProgress({
          phase: 'failed',
          percentage: 0,
          message: t('fileValidationFailed') || 'File validation failed',
          errors: preview.errors.map(error => ({
            row: 0,
            column: 'file',
            value: '',
            error,
            severity: 'error' as const
          }))
        });
        return;
      }

      setUploadProgress({
        phase: 'parsing',
        percentage: 30,
        message: t('fileReadSuccessfully') || 'File read successfully',
        totalRows: preview.rowCount
      });

      // Auto-process if enabled
      if (autoProcess) {
        await processImport(file);
      } else {
        setUploadProgress({
          phase: 'validating',
          percentage: 50,
          message: t('readyToProcess') || 'Ready to process'
        });
      }

    } catch (error: any) {
      console.error('Error handling file:', error);
      setUploadProgress({
        phase: 'failed',
        percentage: 0,
        message: error.message || t('errorReadingFile') || 'Error reading file'
      });
      onUploadError?.(error);
    }
  }, [previewFile, autoProcess, t, onUploadError]);

  // Process import with progress tracking
  const processImport = useCallback(async (file?: File) => {
    const targetFile = file || filePreview?.file;
    if (!targetFile) return;

    setIsProcessing(true);
    onUploadStart?.();

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      setUploadProgress({
        phase: 'processing',
        percentage: 60,
        message: t('processingData') || 'Processing data',
        totalRows: filePreview?.rowCount
      });

      // Simulate progress updates during processing
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (!prev || prev.phase !== 'processing' || isPaused) return prev;
          const newPercentage = Math.min(prev.percentage + 2, 90);
          return {
            ...prev,
            percentage: newPercentage,
            message: newPercentage < 80 ? 
              (t('validatingData') || 'Validating data') : 
              (t('savingData') || 'Saving data')
          };
        });
      }, 200);

      // Call the actual import service
      const importResult = await ExcelService.importExcelFile(
        targetFile,
        category.id,
        schoolId,
        userId
      );

      clearInterval(progressInterval);

      if (importResult.success) {
        setUploadProgress({
          phase: 'completed',
          percentage: 100,
          message: t('importCompletedSuccessfully') || 'Import completed successfully',
          totalRows: importResult.totalRows
        });

        setResult(importResult);
        onUploadComplete?.(importResult);

        toast({
          title: t('success') || 'Success',
          description: t('dataImportedSuccessfully') || `${importResult.successfulRows} rows imported successfully`
        });
      } else {
        setUploadProgress({
          phase: 'failed',
          percentage: 0,
          message: importResult.message || t('importFailed') || 'Import failed',
          errors: importResult.errors
        });

        toast({
          title: t('error') || 'Error',
          description: importResult.message || t('importFailed') || 'Import failed',
          variant: 'destructive'
        });
      }

    } catch (error: any) {
      console.error('Import error:', error);
      setUploadProgress({
        phase: 'failed',
        percentage: 0,
        message: error.message || t('importFailed') || 'Import failed'
      });
      onUploadError?.(error);
    } finally {
      setIsProcessing(false);
      abortControllerRef.current = null;
    }
  }, [filePreview, category.id, schoolId, userId, isPaused, onUploadStart, onUploadComplete, onUploadError, t, toast]);

  // Pause/Resume functionality
  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
    updateProgress({ 
      message: isPaused ? 
        (t('resumingImport') || 'Resuming import') : 
        (t('pausingImport') || 'Pausing import')
    });
  }, [isPaused, updateProgress, t]);

  // Cancel upload
  const cancelUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setUploadProgress(null);
    setFilePreview(null);
    setResult(null);
    setIsProcessing(false);
    setIsPaused(false);
  }, []);

  // Reset to initial state
  const resetUpload = useCallback(() => {
    cancelUpload();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [cancelUpload]);

  // Download template
  const downloadTemplate = useCallback(async () => {
    try {
      await ExcelService.downloadTemplate(category);
      toast({
        title: t('success') || 'Success',
        description: t('templateDownloaded') || 'Template downloaded'
      });
    } catch (error: any) {
      toast({
        title: t('error') || 'Error',
        description: error.message || t('errorDownloadingTemplate') || 'Error downloading template',
        variant: 'destructive'
      });
    }
  }, [category, toast, t]);

  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileAccepted,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    maxFiles: 1,
    maxSize: maxFileSize,
    disabled: isProcessing
  });

  // Render error list
  const renderErrors = (errors: ImportError[]) => {
    if (!errors || errors.length === 0) return null;

    return (
      <div className="mt-4 space-y-2">
        <h4 className="font-medium text-destructive">{t('errors') || 'Errors'}:</h4>
        <div className="max-h-32 overflow-y-auto space-y-1">
          {errors.slice(0, 10).map((error, index) => (
            <Alert key={index} variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                {error.row > 0 && `${t('row') || 'Row'} ${error.row}: `}
                {error.column !== 'general' && `${error.column} - `}
                {error.error}
              </AlertDescription>
            </Alert>
          ))}
          {errors.length > 10 && (
            <div className="text-xs text-muted-foreground">
              {t('andMoreErrors') || `And ${errors.length - 10} more errors`}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`w-full space-y-4 ${className}`}>
      {/* Header with template download */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" />
              {t('excelImport') || 'Excel Import'}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="w-4 h-4 mr-2" />
              {t('downloadTemplate') || 'Download Template'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Upload Area */}
      {!uploadProgress && (
        <Card>
          <CardContent className="p-6">
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-primary/50'
                }
                ${isProcessing ? 'pointer-events-none opacity-50' : ''}
              `}
            >
              <input {...getInputProps()} ref={fileInputRef} />
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              
              {isDragActive ? (
                <p className="text-lg font-medium">{t('dropFileHere') || 'Drop file here'}</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-lg font-medium">{t('dragDropOrClick') || 'Drag & drop or click to select'}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('supportedFormats') || 'Supported formats'}: {allowedFileTypes.join(', ')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('maxFileSize') || 'Max file size'}: {maxFileSize / (1024 * 1024)}MB
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Display */}
      {uploadProgress && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {uploadProgress.phase === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : uploadProgress.phase === 'failed' ? (
                    <AlertCircle className="w-5 h-5 text-destructive" />
                  ) : (
                    <div className="w-5 h-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  )}
                  <span className="font-medium">
                    {uploadProgress.message || t(uploadProgress.phase) || uploadProgress.phase}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  {isProcessing && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={togglePause}
                        disabled={uploadProgress.phase === 'completed' || uploadProgress.phase === 'failed'}
                      >
                        {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={cancelUpload}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  
                  {(uploadProgress.phase === 'completed' || uploadProgress.phase === 'failed') && (
                    <Button variant="outline" size="sm" onClick={resetUpload}>
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              <Progress value={uploadProgress.percentage} className="w-full" />
              
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{uploadProgress.percentage}%</span>
                {uploadProgress.totalRows && (
                  <span>
                    {uploadProgress.currentRow ? 
                      `${uploadProgress.currentRow} / ${uploadProgress.totalRows}` : 
                      `${uploadProgress.totalRows} ${t('rows') || 'rows'}`
                    }
                  </span>
                )}
              </div>

              {/* Error display */}
              {uploadProgress.errors && renderErrors(uploadProgress.errors)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Preview */}
      {showPreview && filePreview && filePreview.isValid && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              {t('filePreview') || 'File Preview'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Badge variant="outline">
                  {filePreview.file.name}
                </Badge>
                <Badge variant="outline">
                  {(filePreview.file.size / 1024).toFixed(1)} KB
                </Badge>
                <Badge variant="outline">
                  {filePreview.rowCount} {t('rows') || 'rows'}
                </Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-muted">
                      {filePreview.headers.map((header, index) => (
                        <th key={index} className="border border-gray-200 px-2 py-1 text-left">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filePreview.preview.slice(1, 6).map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {filePreview.headers.map((_, colIndex) => (
                          <td key={colIndex} className="border border-gray-200 px-2 py-1">
                            {row[colIndex] || ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {!autoProcess && uploadProgress?.phase === 'validating' && (
                <div className="flex justify-end">
                  <Button onClick={() => processImport()}>
                    <Play className="w-4 h-4 mr-2" />
                    {t('startImport') || 'Start Import'}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-destructive" />
              )}
              {t('importResults') || 'Import Results'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{result.totalRows}</div>
                <div className="text-sm text-muted-foreground">{t('totalRows') || 'Total Rows'}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{result.successfulRows}</div>
                <div className="text-sm text-muted-foreground">{t('successful') || 'Successful'}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">{result.failedRows}</div>
                <div className="text-sm text-muted-foreground">{t('failed') || 'Failed'}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {result.totalRows > 0 ? Math.round((result.successfulRows / result.totalRows) * 100) : 0}%
                </div>
                <div className="text-sm text-muted-foreground">{t('successRate') || 'Success Rate'}</div>
              </div>
            </div>

            {result.errors && result.errors.length > 0 && renderErrors(result.errors)}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedExcelUpload;