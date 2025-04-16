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
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Console loglarını yakalayaq
  React.useEffect(() => {
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    console.log = (...args) => {
      setLogs(prev => [...prev, `LOG: ${args.join(' ')}`]);
      originalConsoleLog.apply(console, args);
    };

    console.error = (...args) => {
      setLogs(prev => [...prev, `ERROR: ${args.join(' ')}`]);
      originalConsoleError.apply(console, args);
    };

    console.warn = (...args) => {
      setLogs(prev => [...prev, `WARN: ${args.join(' ')}`]);
      originalConsoleWarn.apply(console, args);
    };

    return () => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setIsError(false);
      setErrorMessage('');
      setLogs([]);
      
      // Excel faylı olduğunu yoxlayırıq
      if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
        setIsError(true);
        setErrorMessage('Yalnız Excel faylları (.xlsx, .xls) qəbul edilir');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setIsError(true);
      setErrorMessage('Zəhmət olmasa, Excel faylı seçin');
      return;
    }
    
    setIsLoading(true);
    setIsError(false);
    setProgress(0);
    
    try {
      // Progress simulyasiyası
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      await importSchoolsFromExcel(file, async (schools) => {
        // Yalnız məcburi sahələri olan məktəbləri idxal et
        const validSchools = schools.filter(school => 
          school.name && 
          school.region_id && 
          school.sector_id
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
        setProgress(100);
        
        setTimeout(() => {
          setFile(null);
          onClose();
        }, 2000);
      });

      clearInterval(progressInterval);
    } catch (error: any) {
      console.error('İdxal zamanı xəta:', error);
      setIsError(true);
      setErrorMessage(error.message || 'Məlumatları idxal edərkən xəta baş verdi.');
      setProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFile = () => {
    setFile(null);
    setIsError(false);
    setErrorMessage('');
    setLogs([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Excel ilə məktəb idxalı</DialogTitle>
          <DialogDescription>
            Məktəbləri toplu şəkildə idxal etmək üçün Excel faylını istifadə edin.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => generateExcelTemplate()}
                >
                  <DownloadCloud className="mr-2 h-4 w-4" />
                  Excel şablonunu yüklə
                </Button>
              </div>
              
              <div className="relative">
                <Input
                  id="file"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className={file ? "file:hidden" : ""}
                  accept=".xlsx,.xls"
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
            </div>

            {isLoading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>İdxal edilir...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {isError && (
              <div className="bg-destructive/10 text-destructive text-sm rounded-md p-3 flex items-start">
                <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="bg-muted/50 rounded-md p-3">
              <div className="flex items-center mb-2">
                <Info className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm font-medium">İdxal prosesi jurnalı</span>
              </div>
              <ScrollArea className="h-[200px] w-full rounded-md border p-2">
                <div className="space-y-1">
                  {logs.map((log, index) => (
                    <div 
                      key={index} 
                      className={`text-xs ${
                        log.startsWith('ERROR:') 
                          ? 'text-destructive' 
                          : log.startsWith('WARN:') 
                            ? 'text-yellow-600' 
                            : 'text-muted-foreground'
                      }`}
                    >
                      {log}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Ləğv et
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
                İdxal et
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportDialog;
