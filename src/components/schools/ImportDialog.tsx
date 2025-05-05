
import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { Table } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ImportCircle, Download, AlertTriangle, FileWarning } from 'lucide-react';
import { importSchoolsFromExcel, createSchoolExcelTemplate } from '@/utils/excelUtils';
import { School } from '@/types/school';

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (schools: Partial<School>[]) => Promise<void>;
}

export const ImportDialog: React.FC<ImportDialogProps> = ({ open, onClose, onImport }) => {
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setFile(null);
    setPreview([]);
    setLoading(false);
    setImporting(false);
    setErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Fayl tipini yoxlayır
    const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error(t('invalidFileType'), {
        description: t('onlyExcelFilesAllowed')
      });
      resetState();
      return;
    }

    setFile(selectedFile);
    setLoading(true);
    setErrors([]);

    try {
      // Excel-dən məlumatları idxal edir
      const importedData = await importSchoolsFromExcel(selectedFile);
      
      // Məlumatları doğrulayır
      const validationErrors: string[] = [];
      importedData.forEach((school, index) => {
        if (!school.name) {
          validationErrors.push(`${t('row')} ${index + 1}: ${t('schoolNameMissing')}`);
        }
      });

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
      }

      setPreview(importedData);
    } catch (error: any) {
      toast.error(t('errorProcessingFile'), {
        description: error.message
      });
      resetState();
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    createSchoolExcelTemplate();
  };

  const handleImport = async () => {
    if (!file || preview.length === 0) {
      toast("error", { description: t('noDataToImport') });
      return;
    }

    if (errors.length > 0) {
      toast.error(t('cannotImportWithErrors'));
      return;
    }

    setImporting(true);

    try {
      await onImport(preview);
      toast.success(t('importSuccess'), {
        description: t('schoolsImportedSuccessfully', { count: preview.length })
      });
      onClose();
      resetState();
    } catch (error: any) {
      toast.error(t('importError'), {
        description: error.message
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        resetState();
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center">
              <ImportCircle className="mr-2 h-5 w-5" />
              {t('importSchools')}
            </div>
          </DialogTitle>
          <DialogDescription>{t('importSchoolsDescription')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={handleDownloadTemplate} type="button">
                <Download className="mr-2 h-4 w-4" />
                {t('downloadTemplate')}
              </Button>

              <div className="flex items-center">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                  ref={fileInputRef}
                  id="file-upload"
                />
                <Button
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading || importing}
                >
                  {file ? t('changeFile') : t('selectFile')}
                </Button>
              </div>
            </div>

            {file && (
              <p className="text-sm text-muted-foreground mt-1">
                {t('selectedFile')}: {file.name}
              </p>
            )}
          </div>

          {loading && (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
            </div>
          )}

          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{t('validationErrors')}</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {preview.length > 0 && !loading && (
            <>
              <h3 className="text-lg font-medium">{t('preview')}:</h3>
              <div className="border rounded-md overflow-auto max-h-[300px]">
                <Table>
                  <thead className="sticky top-0 bg-background">
                    <tr>
                      <th className="p-2">{t('schoolName')}</th>
                      <th className="p-2">{t('address')}</th>
                      <th className="p-2">{t('principal')}</th>
                      <th className="p-2">{t('email')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 10).map((school, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-2">{school.name}</td>
                        <td className="p-2">{school.address}</td>
                        <td className="p-2">{school.principalName}</td>
                        <td className="p-2">{school.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                {preview.length > 10 && (
                  <div className="text-center p-2 text-muted-foreground text-sm border-t">
                    {t('andMoreRecords', { count: preview.length - 10 })}
                  </div>
                )}
              </div>
            </>
          )}

          {file && !preview.length && !loading && (
            <Alert>
              <FileWarning className="h-4 w-4" />
              <AlertTitle>{t('noData')}</AlertTitle>
              <AlertDescription>{t('noDataFoundInFile')}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button
            onClick={handleImport}
            disabled={importing || loading || !file || !preview.length || errors.length > 0}
          >
            {importing ? (
              <>
                <span className="animate-spin h-4 w-4 mr-2 border-2 border-background border-t-transparent rounded-full" />
                {t('importing')}
              </>
            ) : (
              t('import')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportDialog;
