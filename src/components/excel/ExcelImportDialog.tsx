import React, { useState, useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Upload, 
  FileSpreadsheet, 
  AlertTriangle, 
  CheckCircle, 
  X, 
  Download,
  Info,
  Eye
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { CategoryWithColumns } from '@/types/category';
import { ExcelService } from '@/services/excelService';
import { 
  ImportResult, 
  ImportError, 
  ImportProgress,
  EXCEL_CONSTRAINTS 
} from '@/types/excel';
import { cn } from '@/lib/utils';

interface ExcelImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  category: CategoryWithColumns;
  schoolId: string;
  userId: string;
  onImportComplete: (result: ImportResult) => void;
}

type ImportStep = 'select' | 'preview' | 'processing' | 'completed';

const ExcelImportDialog: React.FC<ExcelImportDialogProps> = ({
  isOpen,
  onClose,
  category,
  schoolId,
  userId,
  onImportComplete
}) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State management
  const [currentStep, setCurrentStep] = useState<ImportStep>('select');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[][] | null>(null);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [errors, setErrors] = useState<ImportError[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Reset dialog state
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
    resetDialog();
    onClose();
  }, [resetDialog, onClose]);
  
  // Validate file before processing
  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > EXCEL_CONSTRAINTS.MAX_FILE_SIZE) {
      return `File size exceeds ${EXCEL_CONSTRAINTS.MAX_FILE_SIZE / (1024 * 1024)}MB limit`;
    }
    
    // Check file type
    const isValidType = EXCEL_CONSTRAINTS.SUPPORTED_MIME_TYPES.includes(file.type) ||
                       EXCEL_CONSTRAINTS.SUPPORTED_FORMATS.some(format => 
                         file.name.toLowerCase().endsWith(format)
                       );
    
    if (!isValidType) {
      return `Invalid file type. Supported formats: ${EXCEL_CONSTRAINTS.SUPPORTED_FORMATS.join(', ')}`;
    }
    
    return null;
  }, []);
  
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
      const workbook = await import('xlsx').then(XLSX => XLSX.read(data, { type: 'array' }));
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = await import('xlsx').then(XLSX => 
        XLSX.utils.sheet_to_json(worksheet, { header: 1 })
      );
      
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
  
  // Process import
  const handleImport = useCallback(async () => {
    if (!selectedFile) return;
    
    try {
      setCurrentStep('processing');
      setImportProgress({
        phase: 'parsing',
        currentRow: 0,
        totalRows: 0,
        successfulRows: 0,
        failedRows: 0,
        percentage: 0,
        message: t('parsingFile')
      });
      
      // Simulate progress updates (in real implementation, this would come from service)
      const progressInterval = setInterval(() => {
        setImportProgress(prev => {
          if (!prev) return null;
          
          let newProgress = { ...prev };
          
          switch (prev.phase) {
            case 'parsing':
              newProgress.percentage = Math.min(prev.percentage + 10, 25);
              if (newProgress.percentage >= 25) {
                newProgress.phase = 'validating';
                newProgress.message = t('validatingData');
              }
              break;
            case 'validating':
              newProgress.percentage = Math.min(prev.percentage + 15, 50);
              if (newProgress.percentage >= 50) {
                newProgress.phase = 'processing';
                newProgress.message = t('savingData');
              }
              break;
            case 'processing':
              newProgress.percentage = Math.min(prev.percentage + 20, 95);
              break;
          }
          
          return newProgress;
        });
      }, 500);
      
      // Perform actual import
      const result = await ExcelService.importExcelFile(selectedFile, category.id, schoolId, userId);
      
      clearInterval(progressInterval);
      
      setImportProgress({
        phase: 'completed',
        currentRow: result.totalRows,
        totalRows: result.totalRows,
        successfulRows: result.successfulRows,
        failedRows: result.failedRows,
        percentage: 100,
        message: result.success ? t('importCompleted') : t('importCompletedWithErrors')
      });
      
      setImportResult(result);
      setErrors(result.errors);
      setCurrentStep('completed');
      
      // Notify parent component
      onImportComplete(result);
      
      // Show toast notification
      toast({
        title: result.success ? t('success') : t('warning'),
        description: result.message,
        variant: result.success ? 'default' : 'destructive'
      });
      
    } catch (error) {
      console.error('Import failed:', error);
      
      setImportResult({
        success: false,
        totalRows: 0,
        successfulRows: 0,
        failedRows: 0,
        errors: [{ row: 0, column: 'general', value: '', error: error.message, severity: 'error' }],
        message: t('importFailed')
      });
      
      setCurrentStep('completed');
      
      toast({
        title: t('error'),
        description: error.message || t('importFailed'),
        variant: 'destructive'
      });
    }
  }, [selectedFile, category.id, schoolId, userId, onImportComplete, t, toast]);
  
  // Download template
  const handleDownloadTemplate = useCallback(async () => {
    try {
      await ExcelService.downloadTemplate(category);
      toast({
        title: t('success'),
        description: t('templateDownloaded')
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: t('errorDownloadingTemplate'),
        variant: 'destructive'
      });
    }
  }, [category, t, toast]);
  
  // Render different steps
  const renderStepContent = () => {
    switch (currentStep) {
      case 'select':
        return (
          <div className=\"space-y-6\">
            {/* Template download section */}
            <Alert>
              <Info className=\"h-4 w-4\" />
              <AlertDescription>
                {t('downloadTemplateFirst')}
              </AlertDescription>
            </Alert>
            
            <div className=\"flex justify-center\">
              <Button 
                variant=\"outline\" 
                onClick={handleDownloadTemplate}
                className=\"flex items-center gap-2\"
              >
                <Download className=\"h-4 w-4\" />
                {t('downloadTemplate')}
              </Button>
            </div>
            
            {/* File upload area */}
            <div
              className={cn(
                \"border-2 border-dashed rounded-lg p-8 text-center transition-colors\",
                isDragOver ? \"border-primary bg-primary/5\" : \"border-muted-foreground/25\"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <FileSpreadsheet className=\"h-12 w-12 mx-auto mb-4 text-muted-foreground\" />
              <p className=\"text-lg font-medium mb-2\">{t('selectExcelFile')}</p>
              <p className=\"text-sm text-muted-foreground mb-4\">
                {t('dragDropOrClick')}
              </p>
              <p className=\"text-xs text-muted-foreground mb-4\">
                {t('supportedFormats')}: {EXCEL_CONSTRAINTS.SUPPORTED_FORMATS.join(', ')} | 
                {t('maxSize')}: {EXCEL_CONSTRAINTS.MAX_FILE_SIZE / (1024 * 1024)}MB
              </p>
              
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className=\"h-4 w-4 mr-2\" />
                {t('selectFile')}
              </Button>
              
              <input
                ref={fileInputRef}
                type=\"file\"
                accept={EXCEL_CONSTRAINTS.SUPPORTED_FORMATS.join(',')}
                onChange={handleFileInputChange}
                className=\"hidden\"
              />
            </div>
          </div>
        );
        
      case 'preview':
        return (
          <div className=\"space-y-4\">
            <div className=\"flex items-center justify-between\">
              <h3 className=\"text-lg font-medium\">{t('previewData')}</h3>
              <Badge variant=\"outline\">
                {selectedFile?.name}
              </Badge>
            </div>
            
            {previewData && (
              <Card>
                <CardContent className=\"p-0\">
                  <ScrollArea className=\"h-64\">
                    <table className=\"w-full text-sm\">
                      <thead>
                        <tr className=\"border-b bg-muted/50\">
                          {previewData[0]?.map((header: any, index: number) => (
                            <th key={index} className=\"text-left p-2 font-medium\">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.slice(1).map((row: any[], rowIndex: number) => (
                          <tr key={rowIndex} className=\"border-b\">
                            {row.map((cell: any, cellIndex: number) => (
                              <td key={cellIndex} className=\"p-2\">
                                {cell || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
            
            <Alert>
              <Eye className=\"h-4 w-4\" />
              <AlertDescription>
                {t('previewNote')}
              </AlertDescription>
            </Alert>
          </div>
        );
        
      case 'processing':
        return (
          <div className=\"space-y-6 text-center\">
            <div className=\"space-y-2\">
              <h3 className=\"text-lg font-medium\">{t('importingData')}</h3>
              <p className=\"text-sm text-muted-foreground\">
                {importProgress?.message}
              </p>
            </div>
            
            <div className=\"space-y-2\">
              <Progress value={importProgress?.percentage || 0} className=\"w-full\" />
              <p className=\"text-xs text-muted-foreground\">
                {importProgress?.percentage || 0}%
              </p>
            </div>
            
            {importProgress && (
              <div className=\"grid grid-cols-3 gap-4 text-sm\">
                <div>
                  <p className=\"font-medium\">{t('total')}</p>
                  <p>{importProgress.totalRows}</p>
                </div>
                <div>
                  <p className=\"font-medium text-green-600\">{t('successful')}</p>
                  <p>{importProgress.successfulRows}</p>
                </div>
                <div>
                  <p className=\"font-medium text-red-600\">{t('failed')}</p>
                  <p>{importProgress.failedRows}</p>
                </div>
              </div>
            )}
          </div>
        );
        
      case 'completed':
        return (
          <div className=\"space-y-6\">
            <div className=\"text-center\">
              {importResult?.success ? (
                <CheckCircle className=\"h-16 w-16 mx-auto text-green-500 mb-4\" />
              ) : (
                <AlertTriangle className=\"h-16 w-16 mx-auto text-yellow-500 mb-4\" />
              )}
              
              <h3 className=\"text-lg font-medium mb-2\">
                {importResult?.success ? t('importSuccessful') : t('importCompletedWithIssues')}
              </h3>
              
              <p className=\"text-sm text-muted-foreground\">
                {importResult?.message}
              </p>
            </div>
            
            {importResult && (
              <div className=\"grid grid-cols-3 gap-4\">
                <Card>
                  <CardContent className=\"p-4 text-center\">
                    <p className=\"text-2xl font-bold\">{importResult.totalRows}</p>
                    <p className=\"text-sm text-muted-foreground\">{t('totalRows')}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className=\"p-4 text-center\">
                    <p className=\"text-2xl font-bold text-green-600\">{importResult.successfulRows}</p>
                    <p className=\"text-sm text-muted-foreground\">{t('successful')}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className=\"p-4 text-center\">
                    <p className=\"text-2xl font-bold text-red-600\">{importResult.failedRows}</p>
                    <p className=\"text-sm text-muted-foreground\">{t('failed')}</p>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {errors.length > 0 && (
              <div className=\"space-y-2\">
                <h4 className=\"font-medium\">{t('errors')}:</h4>
                <ScrollArea className=\"h-32\">
                  <div className=\"space-y-1\">
                    {errors.slice(0, 10).map((error, index) => (
                      <Alert key={index} variant=\"destructive\">
                        <AlertDescription className=\"text-xs\">
                          {t('row')} {error.row}: {error.error}
                        </AlertDescription>
                      </Alert>
                    ))}
                    {errors.length > 10 && (
                      <p className=\"text-xs text-muted-foreground text-center\">
                        {t('andXMoreErrors').replace('{count}', String(errors.length - 10))}
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className=\"max-w-2xl max-h-[80vh] overflow-hidden\">
        <DialogHeader>
          <DialogTitle className=\"flex items-center gap-2\">
            <FileSpreadsheet className=\"h-5 w-5\" />
            {t('importExcelData')} - {category.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className=\"flex-1 overflow-y-auto\">
          {renderStepContent()}
        </div>
        
        <DialogFooter className=\"flex items-center justify-between\">
          <div className=\"flex items-center gap-2\">
            {currentStep !== 'select' && currentStep !== 'processing' && (
              <Button variant=\"outline\" onClick={resetDialog}>
                {t('startOver')}
              </Button>
            )}
          </div>
          
          <div className=\"flex items-center gap-2\">
            <Button variant=\"outline\" onClick={handleClose}>
              {currentStep === 'completed' ? t('close') : t('cancel')}
            </Button>
            
            {currentStep === 'preview' && (
              <Button onClick={handleImport}>
                <Upload className=\"h-4 w-4 mr-2\" />
                {t('import')}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExcelImportDialog;
