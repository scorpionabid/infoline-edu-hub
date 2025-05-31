
import { useCallback } from 'react';
import * as XLSX from 'xlsx';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { CategoryWithColumns } from '@/types/category';

export interface ExcelIntegrationProps {
  categories: CategoryWithColumns[];
  onDataImported: (data: Record<string, any>, categoryId: string) => Promise<void>;
}

export const useExcelIntegration = ({ categories, onDataImported }: ExcelIntegrationProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();

  // Excel şablonu yüklə
  const downloadTemplate = useCallback((categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) {
      toast({
        title: t('error'),
        description: t('categoryNotFound'),
        variant: 'destructive'
      });
      return;
    }

    try {
      // Şablon başlıqları
      const headers = ['Column ID', 'Column Name', 'Type', 'Required', 'Value'];
      
      // Sütunlar üçün data
      const rows = category.columns?.map((column: any) => [
        column.id,
        column.name,
        column.type,
        column.is_required ? 'Yes' : 'No',
        '' // Boş dəyər sahəsi
      ]) || [];

      // Excel worksheet yarat
      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      
      // Sütun genişliklərini təyin et
      worksheet['!cols'] = [
        { width: 20 },
        { width: 30 },
        { width: 15 },
        { width: 12 },
        { width: 30 }
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, category.name);

      // Faylı yüklə
      XLSX.writeFile(workbook, `${category.name}_template.xlsx`);
      
      toast({
        title: t('success'),
        description: t('templateDownloaded')
      });
    } catch (error) {
      console.error('Template download error:', error);
      toast({
        title: t('error'),
        description: t('templateDownloadError'),
        variant: 'destructive'
      });
    }
  }, [categories, t, toast]);

  // Excel məlumatlarını import et
  const importFromExcel = useCallback(async (file: File, categoryId: string) => {
    try {
      // Fayl validasiyası
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        toast({
          title: t('error'),
          description: t('invalidFileFormat'),
          variant: 'destructive'
        });
        return;
      }

      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'buffer' });
      
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

      if (jsonData.length === 0) {
        toast({
          title: t('error'),
          description: t('noDataInFile'),
          variant: 'destructive'
        });
        return;
      }

      // Məlumatları format et
      const formattedData: Record<string, any> = {};
      let validRowCount = 0;
      
      jsonData.forEach(row => {
        const columnId = row['Column ID'];
        const value = row['Value'];
        
        if (columnId && value !== undefined && value !== '') {
          formattedData[columnId] = value;
          validRowCount++;
        }
      });

      if (validRowCount === 0) {
        toast({
          title: t('error'),
          description: t('noValidDataFound'),
          variant: 'destructive'
        });
        return;
      }

      // Import prosesini başlat
      await onDataImported(formattedData, categoryId);
      
      toast({
        title: t('success'),
        description: t('dataImportedSuccessfully').replace('{count}', validRowCount.toString())
      });

    } catch (error) {
      console.error('Excel import error:', error);
      toast({
        title: t('error'),
        description: t('importError'),
        variant: 'destructive'
      });
    }
  }, [onDataImported, t, toast]);

  // Mövcud məlumatları Excel-ə export et
  const exportToExcel = useCallback((categoryId: string, data: Record<string, any>) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) {
      toast({
        title: t('error'),
        description: t('categoryNotFound'),
        variant: 'destructive'
      });
      return;
    }

    try {
      const headers = ['Column ID', 'Column Name', 'Type', 'Required', 'Value'];
      
      const rows = category.columns?.map((column: any) => [
        column.id,
        column.name,
        column.type,
        column.is_required ? 'Yes' : 'No',
        data[column.id] || ''
      ]) || [];

      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      worksheet['!cols'] = [
        { width: 20 },
        { width: 30 },
        { width: 15 },
        { width: 12 },
        { width: 30 }
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, category.name);

      XLSX.writeFile(workbook, `${category.name}_data.xlsx`);
      
      toast({
        title: t('success'),
        description: t('dataExported')
      });
    } catch (error) {
      console.error('Excel export error:', error);
      toast({
        title: t('error'),
        description: t('exportError'),
        variant: 'destructive'
      });
    }
  }, [categories, t, toast]);

  return {
    downloadTemplate,
    importFromExcel,
    exportToExcel
  };
};
