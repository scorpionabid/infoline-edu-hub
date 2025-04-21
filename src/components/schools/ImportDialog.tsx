
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
import { FileUp, DownloadCloud, Upload, X, HelpCircle, Info, AlertCircle, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { generateExcelTemplate, importSchoolsFromExcel } from '@/utils/excelUtils';
import { School } from '@/types/supabase';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (schools: Partial<School>[]) => Promise<void>;
}

// Log tipi
interface LogEntry {
  message: string;
  type: 'info' | 'warning' | 'error';
  timestamp: Date;
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
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [stats, setStats] = useState({
    totalRows: 0,
    validRows: 0,
    errorRows: 0
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Logları aşağıya sürüşdürmək üçün useEffect
  React.useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Log əlavə etmək üçün funksiya
  const addLog = (message: string, type: 'info' | 'warning' | 'error' = 'info') => {
    setLogs(prev => [...prev, { message, type, timestamp: new Date() }]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setIsError(false);
      setErrorMessage('');
      setLogs([]);
      setValidationErrors([]);
      setIsSuccess(false);
      setProgress(0);
      setProgressMessage('');
      setStats({
        totalRows: 0,
        validRows: 0,
        errorRows: 0
      });
      
      // Excel faylı olduğunu yoxlayırıq
      if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
        setIsError(true);
        setErrorMessage('Yalnız Excel faylları (.xlsx, .xls) qəbul edilir');
        addLog('Yalnız Excel faylları (.xlsx, .xls) qəbul edilir', 'error');
        return;
      }
      
      addLog(`Fayl seçildi: ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(2)} KB)`, 'info');
      setFile(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setIsError(true);
      setErrorMessage('Zəhmət olmasa, Excel faylı seçin');
      addLog('Zəhmət olmasa, Excel faylı seçin', 'error');
      return;
    }
    
    setIsLoading(true);
    setIsError(false);
    setValidationErrors([]);
    setProgress(0);
    setProgressMessage('Başlanır...');
    setIsSuccess(false);
    
    try {
      addLog('İdxal prosesi başladı', 'info');
      
      await importSchoolsFromExcel(
        file, 
        async (schools) => {
          // Yalnız məcburi sahələri olan məktəbləri idxal et
          const validSchools = schools.filter(school => 
            school.name && 
            school.region_id && 
            school.sector_id
          );
          
          setStats({
            totalRows: schools.length,
            validRows: validSchools.length,
            errorRows: schools.length - validSchools.length
          });
          
          if (validSchools.length === 0) {
            setIsError(true);
            const errorMsg = 'İdxal ediləcək məlumatlar tapılmadı. Məktəblərin ad, region və sektor məlumatlarını yoxlayın.';
            setErrorMessage(errorMsg);
            addLog(errorMsg, 'error');
            return;
          }
          
          if (validSchools.length < schools.length) {
            const warningMsg = `${schools.length - validSchools.length} məktəb məlumatı tam deyil və idxal edilməyəcək.`;
            toast.warning('Bəzi məktəblər idxal edilməyəcək', {
              description: warningMsg
            });
            addLog(warningMsg, 'warning');
          }
          
          try {
            addLog(`${validSchools.length} məktəb məlumatı idxal edilir...`, 'info');
            await onImport(validSchools);
            addLog(`İdxal prosesi uğurla tamamlandı. ${validSchools.length} məktəb əlavə edildi.`, 'info');
            setIsSuccess(true);
          } catch (error: any) {
            addLog(`Məlumatları saxlayarkən xəta: ${error.message || error}`, 'error');
            throw error;
          }
          
          // Əgər uğurludursa, bir müddət sonra dialoqun bağlanması
          if (validSchools.length > 0) {
            setTimeout(() => {
              if (isSuccess) { // Yalnız uğurlu idxaldan sonra bağlanır
                setFile(null);
                onClose();
              }
            }, 3000);
          }
        },
        (progressValue, message) => {
          setProgress(progressValue);
          setProgressMessage(message);
          if (progressValue === 100) {
            addLog('İdxal prosesi tamamlandı', 'info');
          }
        },
        (message, type = 'info') => {
          addLog(message, type);
        }
      );
    } catch (error: any) {
      console.error('İdxal zamanı xəta:', error);
      setIsError(true);
      const errorMsg = error.message || 'Məlumatları idxal edərkən xəta baş verdi.';
      setErrorMessage(errorMsg);
      addLog(`İdxal zamanı xəta: ${errorMsg}`, 'error');
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
    setValidationErrors([]);
    setProgress(0);
    setProgressMessage('');
    setIsSuccess(false);
    setStats({
      totalRows: 0,
      validRows: 0,
      errorRows: 0
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Excel ilə məktəb idxalı</DialogTitle>
          <DialogDescription>
            Məktəbləri toplu şəkildə idxal etmək üçün Excel faylını istifadə edin.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid gap-4">
            {!isLoading && !isSuccess && (
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
            )}

            {isLoading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{progressMessage || 'İdxal edilir...'}</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
            
            {isSuccess && !isLoading && (
              <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-sm rounded-md p-3 flex items-start">
                <Check className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">İdxal prosesi uğurla tamamlandı</p>
                  <p className="mt-1">
                    Ümumi: {stats.totalRows} sətir, 
                    İdxal edildi: {stats.validRows} məktəb, 
                    Xəta: {stats.errorRows} sətir
                  </p>
                </div>
              </div>
            )}

            {isError && (
              <div className="bg-destructive/10 text-destructive text-sm rounded-md p-3 flex items-start">
                <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {validationErrors.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-sm rounded-md p-3">
                <div className="flex items-center mb-2">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <span className="font-medium">Doğrulama xətaları:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-muted/50 rounded-md p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Info className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm font-medium">İdxal prosesi jurnalı</span>
                </div>
                <div className="flex gap-1">
                  <Badge variant="outline" className="text-xs">
                    {logs.filter(log => log.type === 'info').length} məlumat
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                    {logs.filter(log => log.type === 'warning').length} xəbərdarlıq
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                    {logs.filter(log => log.type === 'error').length} xəta
                  </Badge>
                </div>
              </div>
              <ScrollArea className="h-[200px] w-full rounded-md border p-2">
                <div className="space-y-1">
                  {logs.map((log, index) => (
                    <div 
                      key={index} 
                      className={`text-xs ${
                        log.type === 'error'
                          ? 'text-destructive' 
                          : log.type === 'warning'
                            ? 'text-amber-600 dark:text-amber-400' 
                            : 'text-muted-foreground'
                      }`}
                    >
                      {log.timestamp.toLocaleTimeString()} - {log.message}
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {isSuccess ? 'Bağla' : 'Ləğv et'}
          </Button>
          
          {!isSuccess && (
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
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportDialog;
