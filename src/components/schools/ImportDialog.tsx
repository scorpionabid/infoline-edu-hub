
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { useLanguage } from '@/context/LanguageContext';
import { FileUp, DownloadCloud, Upload, X, HelpCircle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { School } from '@/types/supabase';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => void;
}

const ImportDialog: React.FC<ImportDialogProps> = ({ 
  isOpen, 
  onClose,
  onImport
}) => {
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      setFile(files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleImportClick = () => {
    if (!file) {
      toast.error(t('selectFileFirst'));
      return;
    }

    // Check file extension
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (fileExt !== 'xlsx' && fileExt !== 'xls') {
      toast.error(t('invalidFileFormat'), {
        description: t('onlyExcelFilesSupported')
      });
      return;
    }

    onImport(file);
  };

  const handleClearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    // Template üçün yaxud mockup data
    const templateData = [
      {
        'Məktəb adı': 'Məktəb adı',
        'Direktor': 'Direktor adı',
        'Ünvan': 'Məktəb ünvanı',
        'Region ID': 'Region ID',
        'Sektor ID': 'Sektor ID',
        'Telefon': 'Telefon nömrəsi',
        'Email': 'Email ünvanı',
        'Şagird sayı': 'Şagird sayı',
        'Müəllim sayı': 'Müəllim sayı',
        'Status': 'active',
        'Tip': 'full_secondary',
        'Tədris dili': 'az',
        'Admin email': 'admin@example.com'
      }
    ];

    try {
      // Excel faylı yarat
      const worksheet = XLSX.utils.json_to_sheet(templateData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
      XLSX.writeFile(workbook, 'Məktəb_Template.xlsx');
      
      toast.success(t('templateDownloaded'));
    } catch (error) {
      console.error('Template yükləmə xətası:', error);
      toast.error(t('errorDownloadingTemplate'));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileUp className="mr-2 h-5 w-5" />
            {t('importSchools')}
          </DialogTitle>
          <DialogDescription>
            {t('importSchoolsDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div 
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".xlsx,.xls"
            />
            
            {file ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileUp className="h-8 w-8 text-primary mr-2" />
                  <div className="text-left">
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearFile();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">{t('dragAndDropOrClick')}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('supportedFormats')}: .xlsx, .xls
                </p>
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadTemplate}
              className="flex items-center"
            >
              <DownloadCloud className="h-4 w-4 mr-2" />
              {t('downloadTemplate')}
            </Button>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm p-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">{t('importInstructions')}</h4>
                    <ul className="text-sm list-disc pl-4 space-y-1">
                      <li>{t('useTemplateForFormat')}</li>
                      <li>{t('requiredFields')}: {t('schoolName')}, Region ID, Sektor ID</li>
                      <li>{t('statusOptions')}: active, inactive</li>
                      <li>{t('maxRows')}: 1000</li>
                    </ul>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button 
            onClick={handleImportClick}
            disabled={!file}
            className="flex items-center"
          >
            <Upload className="h-4 w-4 mr-2" />
            {t('importData')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportDialog;
