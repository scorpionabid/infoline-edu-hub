
import { useState, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export interface UseExcelIntegrationOptions {
  category?: any;
  data?: any[];
}

export const useExcelIntegration = (options: UseExcelIntegrationOptions = {}) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  // Download template
  const downloadTemplate = useCallback(async () => {
    if (!options.category) {
      toast({
        title: t('error'),
        description: 'Category not available for template generation',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsProcessing(true);
      
      // Create template data based on category columns
      const headers = options.category.columns?.map((col: any) => col.name) || ['Sample Column'];
      const templateData = [headers, ...Array(5).fill(headers.map(() => ''))];
      
      const ws = XLSX.utils.aoa_to_sheet(templateData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Template');
      
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
      
      saveAs(data, `${options.category.name || 'Template'}_template.xlsx`);
      
      toast({
        title: t('success'),
        description: t('templateDownloaded'),
      });
    } catch (error) {
      console.error('Error downloading template:', error);
      toast({
        title: t('error'),
        description: t('errorDownloadingTemplate'),
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  }, [options.category, t, toast]);

  // Export data
  const exportData = useCallback(async () => {
    if (!options.data || options.data.length === 0) {
      toast({
        title: t('error'),
        description: 'No data available for export',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsProcessing(true);
      
      // Convert data to worksheet
      const ws = XLSX.utils.json_to_sheet(options.data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Data');
      
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
      
      saveAs(data, `export_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast({
        title: t('success'),
        description: t('dataExported'),
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: t('error'),
        description: t('errorExportingData'),
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  }, [options.data, t, toast]);

  // Import file
  const importFile = useCallback(async (file: File) => {
    try {
      setIsProcessing(true);
      
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      toast({
        title: t('success'),
        description: `${jsonData.length} records imported successfully`,
      });
      
      return jsonData;
    } catch (error) {
      console.error('Error importing file:', error);
      toast({
        title: t('error'),
        description: t('errorImportingFile'),
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [t, toast]);

  return {
    downloadTemplate,
    exportData,
    importFile,
    isProcessing
  };
};
