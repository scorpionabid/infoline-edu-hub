
import { useState, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { CategoryWithColumns } from '@/types/category';

interface UseExcelIntegrationOptions {
  category: CategoryWithColumns | null;
  formData: Record<string, any>;
  onImportData: (data: Record<string, any>) => Promise<void>;
}

export const useExcelIntegration = ({ 
  category, 
  formData, 
  onImportData 
}: UseExcelIntegrationOptions) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const downloadTemplate = useCallback(async () => {
    if (!category?.columns || category.columns.length === 0) {
      toast({
        title: t('error'),
        description: t('noCategoryColumnsForTemplate'),
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsProcessing(true);
      
      // Create a simple CSV template instead of Excel
      const headers = category.columns.map(col => col.name || col.id).join(',');
      const csvContent = headers + '\n';
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${category.name || 'template'}_template.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

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
  }, [category, t, toast]);

  const exportData = useCallback(async () => {
    if (!category?.columns || category.columns.length === 0) {
      toast({
        title: t('error'),
        description: t('noCategoryColumnsForExport'),
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsProcessing(true);
      
      // Create CSV with current data
      const headers = category.columns.map(col => col.name || col.id).join(',');
      const values = category.columns.map(col => formData[col.id] || '').join(',');
      const csvContent = headers + '\n' + values;
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${category.name || 'data'}_export.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

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
  }, [category, formData, t, toast]);

  const importFile = useCallback(async (file: File) => {
    if (!file) return;

    try {
      setIsProcessing(true);
      
      const text = await file.text();
      const lines = text.split('\n');
      
      if (lines.length < 2) {
        toast({
          title: t('error'),
          description: t('invalidFileFormat'),
          variant: 'destructive'
        });
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const values = lines[1].split(',').map(v => v.trim());
      
      if (!category?.columns) {
        toast({
          title: t('error'),
          description: t('noCategoryColumns'),
          variant: 'destructive'
        });
        return;
      }

      // Map CSV data to form data
      const importedData: Record<string, any> = {};
      
      category.columns.forEach(column => {
        const headerIndex = headers.findIndex(h => 
          h.toLowerCase() === (column.name || column.id).toLowerCase()
        );
        
        if (headerIndex !== -1 && values[headerIndex]) {
          importedData[column.id] = values[headerIndex];
        }
      });

      await onImportData(importedData);
      
      toast({
        title: t('success'),
        description: t('dataImported'),
      });
    } catch (error) {
      console.error('Error importing file:', error);
      toast({
        title: t('error'),
        description: t('errorImportingFile'),
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  }, [category, onImportData, t, toast]);

  return {
    downloadTemplate,
    exportData,
    importFile,
    isProcessing
  };
};
