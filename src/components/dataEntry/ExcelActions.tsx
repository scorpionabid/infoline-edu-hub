
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Upload, FileSpreadsheet, FileX, AlertCircle, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ExcelActionsProps {
  downloadExcelTemplate: (categoryId?: string) => void;
  downloadCategoryTemplate: () => void;
  uploadExcelData: (file: File, categoryId?: string) => void;
  formStatus: string;
}

const ExcelActions: React.FC<ExcelActionsProps> = ({ 
  downloadExcelTemplate, 
  downloadCategoryTemplate,
  uploadExcelData,
  formStatus
}) => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [excelDropdownOpen, setExcelDropdownOpen] = useState(false);
  const [uploadDropdownOpen, setUploadDropdownOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Upload dialog
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'all' | 'category'>('all');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          file.type === 'application/vnd.ms-excel') {
        setSelectedFile(file);
        setUploadError(null);
      } else {
        setSelectedFile(null);
        setUploadError(t('invalidFileFormat'));
      }
    }
  };

  const handleFileUpload = () => {
    if (!selectedFile) {
      setUploadError(t('noFileSelected'));
      return;
    }
    
    setIsUploading(true);
    setUploadError(null);
    
    // Excel faylını yükləmə simulyasiyası
    setTimeout(() => {
      try {
        // Əgər yalnız cari kateqoriya üçündürsə
        if (uploadType === 'category') {
          uploadExcelData(selectedFile, 'currentCategory'); // Real implementasiyada burada cari kateqoriya ID-si göndərilməlidir
        } else {
          uploadExcelData(selectedFile);
        }
        
        // Upload dialoqunu bağla və bildiriş göstər
        setUploadDialogOpen(false);
        toast({
          title: t('excelDataUploaded'),
          description: t('dataSuccessfullyUploaded'),
          variant: "default",
        });
      } catch (error) {
        console.error("Excel upload error:", error);
        setUploadError(String(error));
      } finally {
        setIsUploading(false);
        setSelectedFile(null);
        
        // Faylı sıfırla
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }, 1500);
  };

  const openUploadDialog = () => {
    setUploadDialogOpen(true);
    setSelectedFile(null);
    setUploadError(null);
    setUploadType('all');
  };

  // Fayl seçimi üçün Drag and Drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          file.type === 'application/vnd.ms-excel') {
        setSelectedFile(file);
        setUploadError(null);
      } else {
        setSelectedFile(null);
        setUploadError(t('invalidFileFormat'));
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={handleFileChange}
        ref={fileInputRef}
      />
      
      <div className="flex items-center gap-2">
        {/* Excel şablonu endirmə düyməsi */}
        <div className="relative">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setExcelDropdownOpen(!excelDropdownOpen)}
            disabled={formStatus === 'approved'}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {t('excelTemplate')}
          </Button>
          
          {excelDropdownOpen && (
            <div className="absolute right-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border dark:border-gray-700">
              <div className="p-2">
                <button
                  className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  onClick={() => {
                    downloadExcelTemplate();
                    setExcelDropdownOpen(false);
                  }}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  {t('downloadAllTemplate')}
                </button>
                <button
                  className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  onClick={() => {
                    downloadCategoryTemplate();
                    setExcelDropdownOpen(false);
                  }}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  {t('downloadCurrentTemplate')}
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Excel ilə yükləmə düyməsi - artıq dialoga bağlanır */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={openUploadDialog}
          disabled={isUploading || formStatus === 'approved'}
        >
          <Upload className="mr-2 h-4 w-4" />
          {isUploading ? t('uploading') : t('uploadWithExcel')}
        </Button>
      </div>
      
      {/* Excel yükləmə dialoqu */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('uploadExcelFile')}</DialogTitle>
            <DialogDescription>
              {t('uploadExcelDescription')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div 
              className={`flex items-center justify-center border-2 ${selectedFile ? 'border-green-300 dark:border-green-700' : 'border-dashed border-gray-300'} rounded-lg p-6`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <label className="flex flex-col items-center space-y-2 cursor-pointer">
                {selectedFile ? (
                  <>
                    <FileSpreadsheet className="h-10 w-10 text-green-500" />
                    <span className="text-sm font-medium">{selectedFile.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(selectedFile.size / 1024)} KB
                    </span>
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                    >
                      <FileX className="mr-2 h-4 w-4" />
                      {t('removeFile')}
                    </Button>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm font-medium">{t('dragAndDropExcel')}</span>
                    <span className="text-xs text-muted-foreground">{t('or')}</span>
                    <Button 
                      type="button" 
                      variant="secondary" 
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        fileInputRef.current?.click();
                      }}
                    >
                      {t('browseFiles')}
                    </Button>
                  </>
                )}
              </label>
            </div>
            
            {uploadError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('uploadType')}</Label>
                <RadioGroup 
                  defaultValue={uploadType} 
                  onValueChange={(value) => setUploadType(value as 'all' | 'category')}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all-categories" />
                    <Label htmlFor="all-categories" className="cursor-pointer">
                      {t('uploadCompleteForm')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="category" id="current-category" />
                    <Label htmlFor="current-category" className="cursor-pointer">
                      {t('uploadCurrentCategoryOnly')}
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button 
              variant="outline" 
              size="sm"
              type="button"
              onClick={() => {
                if (uploadType === 'all') {
                  downloadExcelTemplate();
                } else {
                  downloadCategoryTemplate();
                }
              }}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              {t('downloadTemplate')}
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setUploadDialogOpen(false)}
              >
                {t('cancel')}
              </Button>
              <Button 
                type="button" 
                disabled={!selectedFile || isUploading}
                onClick={handleFileUpload}
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    {t('uploading')}
                  </>
                ) : t('upload')}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExcelActions;
