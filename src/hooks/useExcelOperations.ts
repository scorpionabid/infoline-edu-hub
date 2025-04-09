
import { useCallback } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { CategoryWithColumns } from '@/types/column';

export const useExcelOperations = (
  categories: CategoryWithColumns[],
  onDataUpload: (data: Record<string, any>, categoryId: string) => void
) => {
  const { t } = useLanguage();

  // Excel şablonunu yükləmək üçün funksiya
  const downloadExcelTemplate = useCallback((categoryId: string) => {
    try {
      const category = categories.find(c => c.id === categoryId);
      
      if (!category) {
        toast.error(t('categoryNotFound'));
        return;
      }
      
      // Şablon üçün başlıqları hazırlayırıq
      const headers = [
        ['ID', 'Column Name', 'Type', 'Required', 'Value'],
        ...category.columns.map(col => [
          col.id,
          col.name,
          col.type,
          col.is_required ? 'Yes' : 'No',
          ''
        ])
      ];
      
      // Excel workbook və worksheet yaradırıq
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(headers);
      
      // Sütunların enini tənzimləyirik
      const columnWidths = [
        { wch: 36 }, // ID sütunu
        { wch: 30 }, // Column Name sütunu
        { wch: 15 }, // Type sütunu
        { wch: 10 }, // Required sütunu
        { wch: 30 }  // Value sütunu
      ];
      
      worksheet['!cols'] = columnWidths;
      
      // Excel faylına şablonu əlavə edirik
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
      
      // Faylı hazırlayırıq və yükləyirik
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      
      saveAs(blob, `${category.name}_template.xlsx`);
      
      toast.success(t('excel.templateDownloaded'), {
        description: t('excel.useTemplateDesc')
      });
    } catch (error) {
      console.error('Excel şablonu yaradılma xətası:', error);
      toast.error(t('errorOccurred'), {
        description: t('excel.templateError')
      });
    }
  }, [categories, t]);

  // Excel faylını yükləmək və məlumatları çıxarmaq üçün funksiya
  const uploadExcelData = useCallback(async (file: File, categoryId: string) => {
    try {
      const category = categories.find(c => c.id === categoryId);
      
      if (!category) {
        toast.error(t('categoryNotFound'));
        return;
      }
      
      // Faylı oxuyuruq
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      
      // İlk worksheet-i alırıq
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      
      // Məlumatları JavaScript obyektinə çeviririk
      const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);
      
      if (jsonData.length === 0) {
        toast.error(t('excel.noData'));
        return;
      }
      
      // Məlumatları format edirik
      const formattedData: Record<string, any> = {};
      
      jsonData.forEach(row => {
        // Əsas məlumatları çıxarırıq
        const columnId = row['ID'];
        const value = row['Value'];
        
        // ID və dəyər varsa, formattedData-ya əlavə edirik
        if (columnId && value !== undefined) {
          // Sütunun növünü yoxlayırıq və uyğun şəkildə dəyəri çeviririk
          const column = category.columns.find(col => col.id === columnId);
          if (column) {
            switch (column.type) {
              case 'number':
                formattedData[columnId] = Number(value);
                break;
              case 'checkbox':
              case 'boolean':
                formattedData[columnId] = value === 'true' || value === true || value === 1 || value === '1';
                break;
              case 'date':
                formattedData[columnId] = new Date(value).toISOString();
                break;
              default:
                formattedData[columnId] = value;
            }
          } else {
            formattedData[columnId] = value;
          }
        }
      });
      
      // Boş deyilsə, məlumatları yükləyirik
      if (Object.keys(formattedData).length > 0) {
        onDataUpload(formattedData, categoryId);
        
        toast.success(t('excel.importSuccess'), {
          description: t('excel.dataProcessed')
        });
      } else {
        toast.warning(t('excel.noValidData'));
      }
    } catch (error) {
      console.error('Excel məlumat yükləmə xətası:', error);
      toast.error(t('excel.importError'), {
        description: t('excel.checkFormat')
      });
    }
  }, [categories, onDataUpload, t]);

  return {
    downloadExcelTemplate,
    uploadExcelData
  };
};
