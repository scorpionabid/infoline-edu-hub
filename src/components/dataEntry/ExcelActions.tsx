import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Upload } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { Column } from '@/types/column';

interface ExcelActionsProps {
  columns: Column[];
  onImport: (data: any[]) => void;
  onExport: () => void;
  disabled?: boolean;
  categoryId?: string;
}

const ExcelActions: React.FC<ExcelActionsProps> = ({ 
  columns, 
  onImport, 
  onExport, 
  disabled = false,
  categoryId
}) => {
  const { t } = useLanguage();
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsImporting(true);
    try {
      const file = e.target.files?.[0];
      if (!file) {
        toast.error(t('noFileSelected'));
        return;
      }

      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData && jsonData.length > 0) {
        onImport(jsonData);
        toast.success(t('dataImportedSuccessfully'));
      } else {
        toast.error(t('noDataInFile'));
      }
    } catch (error: any) {
      console.error("Error importing Excel file:", error);
      toast.error(t('importFailed') + ': ' + error.message);
    } finally {
      setIsImporting(false);
      if (e.target.value) {
        e.target.value = ''; // Fayl seçimini sıfırla
      }
    }
  };

  const handleExport = () => {
    setIsExporting(true);
    try {
      onExport();
      toast.success(t('dataExportedSuccessfully'));
    } catch (error: any) {
      console.error("Error exporting Excel file:", error);
      toast.error(t('exportFailed') + ': ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        disabled={disabled || isImporting}
        onClick={() => document.getElementById('excel-upload')?.click()}
      >
        <Upload className="mr-2 h-4 w-4" />
        {isImporting ? t('importing') + '...' : t('import')}
      </Button>
      <input
        type="file"
        id="excel-upload"
        accept=".xlsx, .xls"
        onChange={handleImport}
        style={{ display: 'none' }}
      />
      <Button
        variant="outline"
        disabled={disabled || isExporting}
        onClick={handleExport}
      >
        <Download className="mr-2 h-4 w-4" />
        {isExporting ? t('exporting') + '...' : t('export')}
      </Button>
    </div>
  );
};

export default ExcelActions;
