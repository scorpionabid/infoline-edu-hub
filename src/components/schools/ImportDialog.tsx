import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { useLanguageSafe } from '@/context/LanguageContext';
import { School } from '@/types/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Download, Upload, X } from 'lucide-react';
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (school: Omit<School, 'id'>) => Promise<void>;
}

interface ExcelRow {
  [key: string]: any;
}

const ImportDialog: React.FC<ImportDialogProps> = ({ isOpen, onClose, onCreate }) => {
  const { t } = useLanguageSafe();
  const { toast: useToastHook } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [data, setData] = useState<ExcelRow[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<{ success: number; failed: number }>({ success: 0, failed: 0 });
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
    setData([]);
    setErrorMessages([]);
    setImportResults({ success: 0, failed: 0 });
  };

  const handleTemplateFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setTemplateFile(selectedFile);
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const binaryStr = e.target.result;
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const excelData: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet, { raw: false });
        setData(excelData);
      };
      reader.onerror = () => {
        toast.error(t('fileReadError') || 'Fayl oxunarkən xəta baş verdi.');
      };
      reader.onabort = () => {
        toast.warning(t('fileReadAborted') || 'Fayl oxunması dayandırıldı.');
      };
      reader.readAsBinaryString(file);
    } catch (error) {
      console.error("Fayl işləmə xətası:", error);
      toast.error(t('fileProcessingError') || 'Fayl işləmə zamanı xəta baş verdi.');
    } finally {
      setIsProcessing(false);
    }
  };

  const processImport = async (file: File) => {
    processFile(file);
  };

  const startImport = async (templateFile: File | null) => {
    if (!data || data.length === 0) {
      toast.error(t('noDataToImport') || 'İdxal etmək üçün məlumat yoxdur.');
      return;
    }

    setIsImporting(true);
    setImportProgress(0);
    setImportResults({ success: 0, failed: 0 });
    setErrorMessages([]);

    const totalRows = data.length;
    let successfulImports = 0;
    let failedImports = 0;
    const currentErrorMessages: string[] = [];

    for (let i = 0; i < totalRows; i++) {
      try {
        const row = data[i];
        const schoolData: Omit<School, 'id'> = {
          name: row[t('schoolNameColumn')] || '',
          region_id: row[t('regionColumn')] || '',
          sector_id: row[t('sectorColumn')] || '',
          address: row[t('addressColumn')] || '',
          principal_name: row[t('principalNameColumn')] || '',
          contact_phone: row[t('contactPhoneColumn')] || '',
          email: row[t('emailColumn')] || '',
          status: row[t('statusColumn')] || 'active',
          notes: row[t('notesColumn')] || '',
        };

        await onCreate(schoolData);
        successfulImports++;
      } catch (error: any) {
        console.error(`Sətir ${i + 1} idxal edilərkən xəta:`, error);
        failedImports++;
        currentErrorMessages.push(`${t('row')} ${i + 1}: ${error.message || t('importFailed')}`);
      }

      const progress = ((i + 1) / totalRows) * 100;
      setImportProgress(progress);
    }

    setIsImporting(false);
    setImportResults({ success: successfulImports, failed: failedImports });
    setErrorMessages(currentErrorMessages);

    if (failedImports === 0) {
      toast.success(t('allSchoolsImported') || 'Bütün məktəblər uğurla idxal edildi!');
    } else {
      toast.success(`${successfulImports} ${t('schoolsImported')} ${failedImports} ${t('schoolsFailed')}`);
    }
  };

  const handleImportWithTemplate = async (withTemplate: boolean) => {
    if (withTemplate && !templateFile) {
      toast.error(t('noTemplateFileSelected') || 'Zəhmət olmasa, şablon faylı seçin.');
      return;
    }

    if (!file) {
      toast.error(t('noFileSelected') || 'Zəhmət olmasa, fayl seçin.');
      return;
    }

    startImport(templateFile);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{t('importSchools')}</DialogTitle>
          <DialogDescription>
            {t('importSchoolsDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="importFile" className="text-right">
              {t('importFileLabel')}
            </Label>
            <Input
              type="file"
              id="importFile"
              className="col-span-3"
              onChange={handleFileChange}
              disabled={isImporting}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="templateFile" className="text-right">
              {t('templateFileLabel')}
            </Label>
            <Input
              type="file"
              id="templateFile"
              className="col-span-3"
              onChange={handleTemplateFileChange}
              disabled={isImporting}
            />
          </div>

          {isProcessing && (
            <div className="flex items-center space-x-2">
              <Progress value={100} className="flex-1" />
              <span>{t('processingFile')}</span>
            </div>
          )}

          {data.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">{t('previewData')}</h4>
              <ScrollArea className="max-h-[300px]">
                <Table>
                  <TableCaption>{t('previewOfImportedData')}</TableCaption>
                  <TableHeader>
                    <TableRow>
                      {Object.keys(data[0]).map((key) => (
                        <TableHead key={key}>{key}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((row, index) => (
                      <TableRow key={index}>
                        {Object.values(row).map((value, i) => (
                          <TableCell key={i}>{value}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          )}

          {isImporting && (
            <div className="flex items-center space-x-2">
              <Progress value={importProgress} className="flex-1" />
              <span>{t('importing')} {importProgress.toFixed(0)}%</span>
            </div>
          )}

          {errorMessages.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">{t('importErrors')}</h4>
              <ul className="list-disc pl-5">
                {errorMessages.map((message, index) => (
                  <li key={index} className="text-red-500 text-sm">{message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isImporting}>
            {t('cancel')}
          </Button>
          <Button
            type="button"
            onClick={() => handleImportWithTemplate(true)}
            disabled={isImporting || isProcessing || !file}
          >
            {t('importWithTemplate')}
          </Button>
          <Button
            type="button"
            onClick={() => handleImportWithTemplate(false)}
            disabled={isImporting || isProcessing || !file}
          >
            {t('importWithoutTemplate')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportDialog;
