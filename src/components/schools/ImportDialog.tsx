
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
import { FileUp, DownloadCloud, Upload, X, HelpCircle, Info, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { generateExcelTemplate, importSchoolsFromExcel } from '@/utils/excelUtils';
import { School } from '@/types/supabase';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setIsError(false);
      setErrorMessage('');
      
      // Excel faylı olduğunu yoxlayırıq
      if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
        setIsError(true);
        setErrorMessage('Yalnız Excel faylları (.xlsx, .xls) qəbul edilir');
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
      setIsError(true);
      setErrorMessage('Zəhmət olmasa, Excel faylı seçin');
      return;
    }
    
    setIsLoading(true);
    setIsError(false);
    
    try {
      await importSchoolsFromExcel(file, async (schools) => {
        // Yalnız məcburi sahələri olan məktəbləri idxal et
        const validSchools = schools.filter(school => 
          school.name && 
          school.sector_id && 
          school.region_id
        );
        
        if (validSchools.length === 0) {
          setIsError(true);
          setErrorMessage('İdxal ediləcək məlumatlar tapılmadı. Məktəblərin ad, region və sektor məlumatlarını yoxlayın.');
          return;
        }
        
        if (validSchools.length < schools.length) {
          toast.warning('Bəzi məktəblər idxal edilməyəcək', {
            description: `${schools.length - validSchools.length} məktəb məlumatı tam deyil və idxal edilməyəcək.`
          });
        }
        
        await onImport(validSchools);
        setFile(null);
        onClose();
      });
    } catch (error: any) {
      console.error('İdxal zamanı xəta:', error);
      setIsError(true);
      setErrorMessage(error.message || 'Məlumatları idxal edərkən xəta baş verdi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFile = () => {
    setFile(null);
    setIsError(false);
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {t('importSchools')}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-5 w-5">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p>Məktəbləri Excel ilə idxal etmək üçün şablonu yükləyin, doldurun və yükləyin.</p>
                  <p className="mt-2">Admin məlumatlarını doldursanız, həmin məktəbə admin təyin ediləcək.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </DialogTitle>
          <DialogDescription>
            {t('importSchoolsDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="bg-muted/50 rounded-md p-3 text-sm border border-muted">
            <h4 className="flex items-center font-medium text-sm">
              <Info className="h-4 w-4 mr-2 text-muted-foreground" />
              İdxal təlimatları:
            </h4>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              <li>1. Əvvəlcə şablonu yükləyin və doldurun</li>
              <li>2. Regionlar və sektorlar sistemdə olmalıdır</li>
              <li>3. Məktəb adminləri avtomatik yaradılacaq</li>
              <li>4. Məktəb adı, region və sektor məcburi xanalardır</li>
            </ul>
          </div>
          
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
          
          {isError && (
            <div className="bg-destructive/10 text-destructive text-sm rounded-md p-3 flex items-start">
              <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t('cancel')}
          </Button>
          <Button 
            onClick={handleImport}
            disabled={!file || isLoading}
            className="gap-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                İdxal edilir...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                {t('import')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportDialog;
