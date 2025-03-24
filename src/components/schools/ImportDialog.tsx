
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
import { FileUp, DownloadCloud, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { generateExcelTemplate, importSchoolsFromExcel } from '@/utils/excelUtils';
import { School } from '@/types/supabase';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (schools: Partial<School>[]) => Promise<void>;
}

const ImportDialog: React.FC<ImportDialogProps> = ({ 
  isOpen, 
  onClose,
  onImport
}) => {
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Excel faylı olduğunu yoxlayırıq
      if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
        toast.error('Yalnız Excel faylları (.xlsx, .xls) qəbul edilir');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleDownloadTemplate = () => {
    generateExcelTemplate();
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Zəhmət olmasa, Excel faylı seçin');
      return;
    }
    
    setIsLoading(true);
    try {
      await importSchoolsFromExcel(file, async (schools) => {
        await onImport(schools);
        setFile(null);
        onClose();
      });
    } catch (error) {
      console.error('İdxal zamanı xəta:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('importSchools')}</DialogTitle>
          <DialogDescription>
            {t('importSchoolsDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <Button 
            variant="outline" 
            className="w-full justify-center" 
            onClick={handleDownloadTemplate}
          >
            <DownloadCloud className="mr-2 h-4 w-4" />
            {t('downloadExcelTemplate')}
          </Button>
          
          <div className="grid w-full items-center gap-1.5">
            <div className="relative">
              <Input
                id="file"
                type="file"
                accept=".xlsx,.xls"
                ref={fileInputRef}
                onChange={handleFileChange}
                className={file ? "file:hidden" : ""}
              />
              {file && (
                <div className="absolute inset-0 flex items-center justify-between bg-background border rounded-md px-3 py-2">
                  <div className="flex items-center">
                    <FileUp className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleClearFile}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('supportedFormats')}: .xlsx, .xls
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button 
            onClick={handleImport}
            disabled={!file || isLoading}
            className="gap-1"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {t('import')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportDialog;
