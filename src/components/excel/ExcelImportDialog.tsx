import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext'; // Fixed: use correct import path
import { useToast } from '@/hooks/use-toast';
import { ExcelService } from '@/services/excelService'; // Fixed: use correct service name
import { CategoryWithColumns } from '@/types/category';
import { ImportResult, ImportError, ImportProgress } from '@/types/excel';
import { Info, Download, Upload, FileSpreadsheet, CheckCircle, AlertTriangle, ArrowLeft, ArrowRight, X, Eye } from 'lucide-react';

// Excel import constraints
const EXCEL_CONSTRAINTS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_FORMATS: [
    '.xlsx',
    '.xls',
    '.csv'
  ],
  MIN_ROWS: 1,
  MAX_ROWS: 10000
};

// *** Types ***
interface ExcelImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  category: CategoryWithColumns;
  schoolId: string;
  userId: string;
  onImportComplete: (result: ImportResult) => void;
}

type ImportStep = 'select' | 'preview' | 'processing' | 'completed';

interface FileSelectStepProps {
  handleDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave: (event: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  handleDownloadTemplate: () => void;
  handleSelectFileClick: () => void;
  handleFileInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  isDragOver: boolean;
  t: (key: string, params?: any) => string;
}

interface PreviewStepProps {
  selectedFile: File | null;
  previewData: any[][] | null;
  t: (key: string, params?: any) => string;
}

interface ProcessingStepProps {
  importProgress: ImportProgress | null;
  t: (key: string, params?: any) => string;
}

interface CompletedStepProps {
  importResult: ImportResult | null;
  errors: ImportError[];
  t: (key: string, params?: any) => string;
}

// ***** File Select Step Component *****
const FileSelectStep: React.FC<FileSelectStepProps> = ({
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleDownloadTemplate,
  handleSelectFileClick,
  handleFileInputChange,
  fileInputRef,
  isDragOver,
  t
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Alert className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertDescription>
              {t('downloadTemplateFirst')}
            </AlertDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1"
          >
            <Download className="h-3 w-3" />
            {t('downloadTemplate')}
          </Button>
        </Alert>

        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center gap-4 transition-colors",
            isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/30"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <FileSpreadsheet className="h-10 w-10 text-muted-foreground" />
          
          <div className="text-center">
            <h3 className="text-lg font-medium">{t('selectExcelFile')}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t('dragDropOrClick')}
            </p>
          </div>
          
          <Button onClick={handleSelectFileClick}>
            <Upload className="h-4 w-4 mr-2" />
            {t('selectFile')}
          </Button>
          
          <p className="text-xs text-muted-foreground">
            {t('supportedFormats')}: {EXCEL_CONSTRAINTS.SUPPORTED_FORMATS.join(', ')} | 
            {t('maxSize')}: {EXCEL_CONSTRAINTS.MAX_FILE_SIZE / (1024 * 1024)}MB
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            accept={EXCEL_CONSTRAINTS.SUPPORTED_FORMATS.join(',')}
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};

// ***** Preview Step Component *****
const PreviewStep: React.FC<PreviewStepProps> = ({
  selectedFile,
  previewData,
  t
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">{selectedFile?.name}</span>
          <Badge variant="outline">{Math.round(selectedFile?.size / 1024)} KB</Badge>
        </div>
      </div>
      
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-xs">
          {t('previewDescription')}
        </AlertDescription>
      </Alert>
      
      <Card>
        <CardContent className="p-2">
          <ScrollArea className="h-[200px]">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted">
                  {previewData && previewData[0]?.map((cell: any, index: number) => (
                    <th key={index} className="px-2 py-1 text-left font-medium border">
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData && previewData.slice(1).map((row: any[], rowIndex: number) => (
                  <tr key={rowIndex}>
                    {row.map((cell: any, cellIndex: number) => (
                      <td key={cellIndex} className="px-2 py-1 border truncate max-w-[150px]">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

// ***** Processing Step Component *****
const ProcessingStep: React.FC<ProcessingStepProps> = ({
  importProgress,
  t
}) => {
  return (
    <div className="flex flex-col gap-6 py-4">
      <div className="text-center">
        <h3 className="text-lg font-medium">{t('importingData')}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {t('pleaseWait')}
        </p>
      </div>
      
      <div className="flex flex-col gap-2">
        <Progress 
          value={importProgress?.percentage || 0} 
          className="h-2"
        />
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            {importProgress?.phase && t(importProgress.phase)}
          </span>
          <span>
            {importProgress?.currentRow || 0} / {importProgress?.totalRows || 0}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
          <span className="text-2xl font-semibold">{importProgress?.totalRows || 0}</span>
          <span className="text-xs text-muted-foreground">{t('totalRows')}</span>
        </div>
        <div className="flex flex-col items-center p-3 bg-green-50 text-green-600 rounded-lg">
          <span className="text-2xl font-semibold">{importProgress?.successfulRows || 0}</span>
          <span className="text-xs">{t('successfulRows')}</span>
        </div>
        <div className="flex flex-col items-center p-3 bg-red-50 text-red-600 rounded-lg">
          <span className="text-2xl font-semibold">{importProgress?.failedRows || 0}</span>
          <span className="text-xs">{t('failedRows')}</span>
        </div>
      </div>
    </div>
  );
};

// ***** Completed Step Component *****
const CompletedStep: React.FC<CompletedStepProps> = ({
  importResult,
  errors,
  t
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className={cn(
        "border rounded-lg p-4 flex items-start gap-3",
        errors.length > 0 ? "border-destructive/30 bg-destructive/10" : "border-green-500/30 bg-green-500/10"
      )}>
        {errors.length > 0 ? (
          <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
        ) : (
          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
        )}
        
        <div>
          <h3 className="font-medium">
            {errors.length > 0 ? t('importCompletedWithErrors') : t('importCompletedSuccessfully')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t('totalProcessed')}: {importResult?.totalRows}<br />
            {t('successfulRows')}: {importResult?.successfulRows}<br />
            {t('errorRows')}: {importResult?.failedRows}
          </p>
        </div>
      </div>
      
      {errors.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">{t('errors')}</h3>
          <ScrollArea className="h-[200px]">
            <div className="flex flex-col gap-2">
              {errors.slice(0, 10).map((error, index) => (
                <Alert key={index} variant="destructive" className="flex items-start space-x-3">
                  <div className="flex-1">
                    <AlertDescription className="text-xs">
                      {t('row')} {error.row}: {error.error}
                    </AlertDescription>
                  </div>
                </Alert>
              ))}
              {errors.length > 10 && (
                <p className="text-xs text-muted-foreground text-center">
                  {t('andXMoreErrors').replace('{count}', String(errors.length - 10))}
                </p>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

// ***** Main Dialog Component *****
const ExcelImportDialog: React.FC<ExcelImportDialogProps> = ({
  isOpen,
  onClose,
  category,
  schoolId,
  userId,
  onImportComplete
}) => {
  const { t } = useLanguage(); // Fixed: use useLanguage instead of useTranslation
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State management
  const [currentStep, setCurrentStep] = useState<ImportStep>('select');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[][] | null>(null);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [errors, setErrors] = useState<ImportError[]>([]);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  
  // Reset dialog function (defined first to avoid circular dependency)
  const resetDialog = useCallback(() => {
    setCurrentStep('select');
    setSelectedFile(null);
    setPreviewData(null);
    setImportProgress(null);
    setImportResult(null);
    setErrors([]);
    setIsDragOver(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);
  
  // Handle dialog close
  const handleClose = useCallback(() => {
    // Ask for confirmation if in the middle of import process
    if (currentStep === 'processing') {
      const shouldClose = window.confirm(t('confirmCancelImport'));
      if (!shouldClose) return;
    }
    
    // Reset state and close dialog
    resetDialog();
    onClose();
  }, [currentStep, onClose, resetDialog, t]);

  // Validate file
  const validateFile = useCallback((file: File): string | null => {
    // Check if file is selected
    if (!file) return t('fileRequired');
    
    // Check file type
    const fileType = file.name.split('.').pop()?.toLowerCase();
    if (!fileType || !EXCEL_CONSTRAINTS.SUPPORTED_FORMATS.some(f => f.includes(fileType))) {
      return t('invalidFileType');
    }
    
    // Check file size
    if (file.size > EXCEL_CONSTRAINTS.MAX_FILE_SIZE) {
      return t('fileTooLarge').replace('{maxSize}', `${EXCEL_CONSTRAINTS.MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }
    
    return null;
  }, [t]);

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    try {
      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        toast({
          title: t('error'),
          description: validationError,
          variant: 'destructive'
        });
        return;
      }
      
      setSelectedFile(file);
      
      // Preview file content (first few rows)
      const data = await file.arrayBuffer();
      const XLSX = await import('xlsx');
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      setPreviewData(jsonData.slice(0, 6) as any[][]); // First 5 rows + header
      setCurrentStep('preview');
      
    } catch (error) {
      console.error('Error reading file:', error);
      toast({
        title: t('error'),
        description: t('errorReadingFile'),
        variant: 'destructive'
      });
    }
  }, [validateFile, t, toast]);

  // Handle file selection button click
  const handleSelectFileClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [fileInputRef]);

  // Handle file input change
  const handleFileInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  // Handle drag and drop
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  // Handle template download
  const handleDownloadTemplate = useCallback(() => {
    // Excel service-dən şablon yüklə
    ExcelService.downloadTemplate(category, schoolId)
      .then(() => {
        toast({
          title: t('success'),
          description: t('templateDownloaded'),
        });
      })
      .catch((error) => {
        console.error('Error downloading template:', error);
        toast({
          title: t('error'),
          description: t('errorDownloadingTemplate'),
          variant: 'destructive'
        });
      });
  }, [category, schoolId, t, toast]);

  // Import simulyasiyası
  const simulateImport = useCallback(() => {
    if (!selectedFile) return;
    
    // İlkin dəyərləri təyin et
    setImportProgress({
      currentRow: 0,
      totalRows: previewData ? previewData.length - 1 : 0, // header haricinə
      successfulRows: 0,
      failedRows: 0,
      percentage: 0,
      phase: 'parsing',
      message: t('preparingImport')
    });
    
    // Təsadüfi gecikməli simulyasiya
    const totalRows = previewData ? previewData.length - 1 : 0;
    let currentRow = 0;
    let successfulRows = 0;
    let failedRows = 0;
    const simulationErrors: ImportError[] = [];
    
    // Processing phase
    setImportProgress(prev => ({ 
      ...prev!, 
      phase: 'processing',
      message: t('processingData')
    }));
    
    const interval = setInterval(() => {
      // İnkrement
      currentRow += Math.floor(Math.random() * 5) + 1;
      const success = Math.random() > 0.1; // 10% əməliyyatlar xəta ilə nəticələnir
      
      if (success) {
        successfulRows++;
      } else {
        failedRows++;
        simulationErrors.push({
          row: currentRow,
          column: 'data',
          error: t('sampleError'),
          value: 'invalid-value',
          severity: 'error'
        });
      }
      
      // İmport progress yenilə
      if (currentRow >= totalRows) {
        currentRow = totalRows;
        clearInterval(interval);
        
        // Tamamla
        const finalResult: ImportResult = {
          success: failedRows === 0,
          totalRows,
          successfulRows,
          failedRows,
          errors: simulationErrors || [],
          message: failedRows === 0 
            ? `${totalRows} məlumat uğurla import edildi.` 
            : `${successfulRows} məlumat uğurla import edildi, ${failedRows} məlumatda xəta var.`
        };
        
        setImportResult(finalResult);
        setErrors(simulationErrors);
        setCurrentStep('completed');
        onImportComplete(finalResult);
      }
      
      // Update state
      setImportProgress({
        currentRow,
        totalRows,
        successfulRows,
        failedRows,
        percentage: Math.min(Math.round((currentRow / totalRows) * 100), 100),
        phase: 'processing',
        message: t('processingRow')
      });
    }, 300); // 300ms intervalla yenilə
    
    // Cleanup on unmount
    return () => {
      clearInterval(interval);
    };
  }, [category.name, onImportComplete, previewData, selectedFile, t]);
  
  // Start import when clicked on preview screen
  const handleImport = useCallback(() => {
    if (!selectedFile) return;
    setCurrentStep('processing');
    simulateImport();
  }, [selectedFile, simulateImport]);

  // Missing function that was being called
  const handleStartImport = useCallback(() => {
    if (currentStep === 'preview') {
      handleImport();
    }
  }, [currentStep, handleImport]);

  // renderStepContent - müxtəlif addımlar arasında keçid
  const renderStepContent = useCallback(() => {
    switch (currentStep) {
      case 'select':
        return (
          <FileSelectStep
            handleDragOver={handleDragOver}
            handleDragLeave={handleDragLeave}
            handleDrop={handleDrop}
            handleDownloadTemplate={handleDownloadTemplate}
            handleSelectFileClick={handleSelectFileClick}
            handleFileInputChange={handleFileInputChange}
            fileInputRef={fileInputRef}
            isDragOver={isDragOver}
            t={t}
          />
        );
        
      case 'preview':
        return (
          <PreviewStep
            selectedFile={selectedFile}
            previewData={previewData}
            t={t}
          />
        );
        
      case 'processing':
        return (
          <ProcessingStep
            importProgress={importProgress}
            t={t}
          />
        );
        
      case 'completed':
        return (
          <CompletedStep
            importResult={importResult}
            errors={errors}
            t={t}
          />
        );
        
      default:
        return null;
    }
  }, [currentStep, errors, fileInputRef, handleDownloadTemplate, handleDragLeave, handleDragOver, handleDrop, handleFileInputChange, handleSelectFileClick, importProgress, importResult, isDragOver, previewData, selectedFile, t]);

  // Render main dialog
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {t('importExcelData')} - {category.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {renderStepContent()}
        </div>
        
        <DialogFooter className="flex flex-row justify-between items-center gap-2">
          {currentStep !== 'select' && currentStep !== 'completed' && (
            <Button 
              variant="outline" 
              onClick={handleClose}
              disabled={currentStep === 'processing'}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('previous')}
            </Button>
          )}
          
          {currentStep === 'select' && (
            <Button 
              variant="outline" 
              onClick={handleClose}
            >
              {t('cancel')}
            </Button>
          )}
          
          <div className="flex-1" />
          
          {currentStep === 'select' && selectedFile && (
            <Button onClick={handleStartImport}>
              {t('continue')}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
          
          {currentStep === 'preview' && (
            <Button onClick={handleStartImport}>
              {t('startImport')}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
          
          {currentStep === 'completed' && (
            <Button onClick={handleClose}>
              {t('close')}
              <X className="h-4 w-4 ml-2" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExcelImportDialog;
