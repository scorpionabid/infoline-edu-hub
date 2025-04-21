
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Download, Upload, AlertCircle, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { generateExcelTemplate, parseExcelFile, validateExcelData } from '@/utils/excelUtils';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  columns?: any[];
  onImportData: (data: any[]) => Promise<void>;
}

const ImportDialog: React.FC<ImportDialogProps> = ({
  isOpen,
  onClose,
  onComplete,
  columns = [],
  onImportData
}) => {
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [excelData, setExcelData] = useState<any[] | null>(null);
  const [errors, setErrors] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Faylı seçmək
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setErrors([]);
    setExcelData(null);
    setProgress(0);
    setProcessStatus('');
    
    // Faylı oxuyaq
    setIsProcessing(true);
    setProcessStatus(t('readingFile'));
    
    try {
      const result = await parseExcelFile(selectedFile);
      
      if (result.hasError || !result.data) {
        toast.error(result.error || t('errorReadingFile'));
        setErrors([{ 
          row: 0,
          column: '',
          message: result.error || t('errorReadingFile'),
          type: 'error'
        }]);
      } else {
        setExcelData(result.data);
        
        // Məlumatları validasiya edək
        setProcessStatus(t('validatingData'));
        setProgress(50);
        
        // Tələb olunan sütunları əldə edək
        const requiredColumns = columns
          .filter(col => col.is_required)
          .map(col => col.name);
        
        const validationResult = validateExcelData(result.data, requiredColumns);
        
        if (!validationResult.valid) {
          setErrors(validationResult.errors);
          toast.error(validationResult.message);
        } else {
          setProgress(100);
          toast.success(t('fileValidatedSuccessfully'));
        }
      }
    } catch (error: any) {
      console.error('File processing error:', error);
      toast.error(error.message || t('errorProcessingFile'));
      setErrors([{ 
        row: 0,
        column: '',
        message: error.message || t('errorProcessingFile'),
        type: 'error'
      }]);
    } finally {
      setIsProcessing(false);
      setProcessStatus('');
    }
  };

  // Şablon yükləmək
  const handleDownloadTemplate = () => {
    try {
      generateExcelTemplate(columns, 'import_template');
      toast.success(t('templateDownloaded'));
    } catch (error: any) {
      console.error('Template download error:', error);
      toast.error(error.message || t('errorDownloadingTemplate'));
    }
  };

  // Məlumatları idxal etmək
  const handleImport = async () => {
    if (!excelData || excelData.length === 0) {
      toast.error(t('noDataToImport'));
      return;
    }
    
    if (errors.length > 0) {
      toast.error(t('pleaseFixErrorsBeforeImport'));
      return;
    }
    
    setIsProcessing(true);
    setProcessStatus(t('importingData'));
    setProgress(0);
    
    try {
      // Progress simulyasiyası
      const timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(timer);
            return 90;
          }
          return prev + 10;
        });
      }, 300);
      
      // Məlumatları idxal edək
      await onImportData(excelData);
      
      clearInterval(timer);
      setProgress(100);
      
      toast.success(t('dataImportedSuccessfully'));
      
      // Dialoqunu bağlayaq və təmizləyək
      setTimeout(() => {
        onComplete();
        resetForm();
      }, 1000);
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error(error.message || t('errorImportingData'));
      setErrors([{ 
        row: 0, 
        column: '', 
        message: error.message || t('errorImportingData'),
        type: 'error'
      }]);
    } finally {
      setIsProcessing(false);
      setProcessStatus('');
    }
  };

  // Formu sıfırlamaq
  const resetForm = () => {
    setFile(null);
    setExcelData(null);
    setErrors([]);
    setProgress(0);
    setProcessStatus('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setActiveTab('upload');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        resetForm();
        onClose();
      }
    }}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{t('importData')}</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="upload">{t('uploadFile')}</TabsTrigger>
            <TabsTrigger value="preview" disabled={!excelData}>{t('preview')}</TabsTrigger>
            <TabsTrigger value="errors" disabled={errors.length === 0}>{t('errors')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handleDownloadTemplate}
                disabled={isProcessing || columns.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                {t('downloadTemplate')}
              </Button>
              
              <div className="flex items-center space-x-2">
                <Label htmlFor="file" className="cursor-pointer px-4 py-2 border rounded-md bg-muted hover:bg-muted/80">
                  <Upload className="h-4 w-4 inline-block mr-2" />
                  {t('selectFile')}
                </Label>
                <input
                  ref={fileInputRef}
                  id="file"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  disabled={isProcessing}
                  className="hidden"
                />
                
                {file && (
                  <span className="text-sm text-muted-foreground">
                    {file.name}
                  </span>
                )}
              </div>
            </div>
            
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{processStatus}</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}
            
            {excelData && excelData.length > 0 && (
              <Alert variant={errors.length > 0 ? "destructive" : "default"}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {errors.length > 0 ? (
                    <div>
                      {t('foundErrorsInFile', { count: errors.length })}
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-sm"
                        onClick={() => setActiveTab('errors')}
                      >
                        {t('viewErrors')} <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      {t('fileValidatedSuccessfully')}
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-sm"
                        onClick={() => setActiveTab('preview')}
                      >
                        {t('viewData')} <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
          
          <TabsContent value="preview">
            {excelData && excelData.length > 0 ? (
              <div className="border rounded-md overflow-auto max-h-[400px]">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      {Object.keys(excelData[0]).map((header) => (
                        <th key={header} className="p-2 text-left border">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {excelData.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b">
                        {Object.values(row).map((cell, cellIndex) => (
                          <td key={cellIndex} className="p-2 border">
                            {cell !== null && cell !== undefined ? String(cell) : ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {t('noDataToPreview')}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="errors">
            {errors.length > 0 ? (
              <div className="border rounded-md overflow-auto max-h-[400px]">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="p-2 text-left border">{t('row')}</th>
                      <th className="p-2 text-left border">{t('column')}</th>
                      <th className="p-2 text-left border">{t('message')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {errors.map((error, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 border">{error.row}</td>
                        <td className="p-2 border">{error.column}</td>
                        <td className="p-2 border">{error.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {t('noErrorsFound')}
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
          >
            {t('cancel')}
          </Button>
          
          <Button
            onClick={handleImport}
            disabled={isProcessing || !excelData || errors.length > 0}
          >
            {isProcessing ? t('importing') : t('import')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportDialog;
