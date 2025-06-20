import { useState, useCallback } from 'react';
import { useTranslation } from '@/contexts/TranslationContext';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

export interface UseExcelIntegrationOptions {
  category?: any;
  data?: any[];
}

export const useExcelIntegration = (options: UseExcelIntegrationOptions = {}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  // Download template
  const downloadTemplate = useCallback(async () => {
    if (!options.category) {
      toast({
        title: t('common.error'),
        description: 'Şablon yaratmaq üçün kateqoriya mövcud deyil',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsProcessing(true);
      
      // Create template data based on category columns
      const headers = options.category.columns?.map((col: any) => col.name) || ['Nümunə Sütun'];
      const templateData = [headers, ...Array(5).fill(headers.map(() => ''))];
      
      const ws = XLSX.utils.aoa_to_sheet(templateData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Şablon');
      
      // Generate file and trigger download
      const fileName = `${options.category.name || 'Şablon'}_şablon.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      toast({
        title: t('common.success'),
        description: 'Şablon uğurla yükləndi',
      });
    } catch (error) {
      console.error('Error downloading template:', error);
      toast({
        title: t('common.error'),
        description: 'Şablon yükləməkdə xəta baş verdi',
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
        title: t('common.error'),
        description: 'İxrac üçün məlumat mövcud deyil',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsProcessing(true);
      
      // Convert data to worksheet
      const ws = XLSX.utils.json_to_sheet(options.data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Məlumatlar');
      
      // Generate file and trigger download
      const fileName = `ixrac_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      toast({
        title: t('common.success'),
        description: 'Məlumatlar uğurla ixrac edildi',
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: t('common.error'),
        description: 'Məlumat ixracında xəta baş verdi',
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
        title: t('common.success'),
        description: `${jsonData.length} qeyd uğurla idxal edildi`,
      });
      
      return jsonData;
    } catch (error) {
      console.error('Error importing file:', error);
      toast({
        title: t('common.error'),
        description: 'Fayl idxalında xəta baş verdi',
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