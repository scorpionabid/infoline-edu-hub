
import { useCallback } from 'react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

/**
 * @description Excel əməliyyatları üçün hook
 */
export const useExcelOperations = (categories: any[], onDataImported: (data: Record<string, any>, categoryId: string) => void) => {
  const { t } = useLanguage();
  
  // Excel şablonunu yükləmək üçün funksiya
  const downloadExcelTemplate = useCallback((categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;
    
    try {
      // Şablon başlıqları
      const headers = ['ID', t('columnName'), t('columnType'), t('required'), t('value')];
      
      // Sütunlar üçün data
      const rows = category.columns.map((column: any) => [
        column.id,
        column.name,
        column.type,
        column.is_required ? t('yes') : t('no'),
        ''
      ]);
      
      // Excel kitabçası yarat
      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, category.name);
      
      // Excel faylını yüklə
      XLSX.writeFile(workbook, `${category.name}_template.xlsx`);
      
      toast.success(t('templateDownloaded'), {
        description: t('excelTemplateDownloaded')
      });
    } catch (error) {
      console.error('Excel template download error:', error);
      toast.error(t('templateDownloadError'), {
        description: t('excelTemplateDownloadFailed')
      });
    }
  }, [categories, t]);
  
  // Excel məlumatlarını yükləmək üçün funksiya
  const uploadExcelData = useCallback(async (file: File, categoryId: string) => {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'buffer' });
      
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);
      
      if (jsonData.length === 0) {
        toast.error(t('noDataInFile'), {
          description: t('excelFileEmpty')
        });
        return;
      }
      
      // ID və Value sütunlarına görə dataları çıxar
      const extractedData: Record<string, any> = {};
      jsonData.forEach(row => {
        if (row.ID && row.Value !== undefined) {
          extractedData[row.ID] = row.Value;
        }
      });
      
      if (Object.keys(extractedData).length === 0) {
        toast.error(t('invalidDataFormat'), {
          description: t('excelFormatInvalid')
        });
        return;
      }
      
      // Data yükləndi, callback funksiyasını çağır
      onDataImported(extractedData, categoryId);
      
    } catch (error) {
      console.error('Excel data upload error:', error);
      toast.error(t('fileUploadError'), {
        description: t('excelUploadFailed')
      });
    }
  }, [onDataImported, t]);
  
  return {
    downloadExcelTemplate,
    uploadExcelData
  };
};
