
import { useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { CategoryWithColumns } from '@/types/column';

export const useExcelOperations = (
  categories: CategoryWithColumns[], 
  updateFormData: (data: Record<string, any>, categoryId?: string) => void
) => {
  const { t } = useLanguage();

  // Excel şablonunu yükləmək
  const downloadExcelTemplate = useCallback((categoryId?: string) => {
    // Burada real API çağırışı olmalıdır
    
    if (categoryId) {
      // Spesifik kateqoriya üçün şablon yükləmək
      const category = categories.find(cat => cat.id === categoryId);
      if (category) {
        console.log(`${category.name} kateqoriyası üçün Excel şablonu yükləndi`);
        
        toast({
          title: t('categoryExcelTemplateDownloaded'),
          description: `${category.name} ${t('categoryTemplateDownloaded')}`,
          variant: "default",
        });
      }
    } else {
      // Bütün kateqoriyalar üçün şablon yükləmək
      console.log("Bütün kateqoriyalar üçün Excel şablonu yükləndi");
      
      toast({
        title: t('excelTemplateDownloaded'),
        description: t('canUploadAfterFilling'),
        variant: "default",
      });
    }
  }, [categories, t]);

  // Excel faylını yükləmək və məlumatları doldurmaq
  const uploadExcelData = useCallback((file: File, categoryId?: string) => {
    // Burada real API çağırışı olmalıdır
    console.log("Excel faylı yükləndi:", file.name);
    
    // Excel formatlaması və məlumatların doldurulması simulyasiyası
    const mockDataFromExcel: Record<string, any> = {
      "col1": 500,
      "col2": 45,
      "col3": 30,
      "col4": 2,
      "col5": "Azərbaycan",
      "col6": "Standart tədris proqramı",
      "col7": "Tam orta",
      "col8": true,
      "col9": true,
      "col10": true,
      "col11": "Yaxşı",
      "col12": new Date("2022-08-15"),
      "col15": "Excel ilə doldurulmuş məlumat",
      "col16": "Seçim 2"
    };
    
    // Excel-dən məlumatları forma ötürmək
    updateFormData(mockDataFromExcel, categoryId);
    
    // Əgər spesifik kateqoriya üçün yüklənmişsə
    if (categoryId) {
      const category = categories.find(cat => cat.id === categoryId);
      if (category) {
        toast({
          title: t('categoryDataUploaded'),
          description: `${category.name} ${t('categoryDataSuccessfullyUploaded')}`,
          variant: "default",
        });
      }
    } else {
      toast({
        title: t('excelDataUploaded'),
        description: t('dataSuccessfullyUploaded'),
        variant: "default",
      });
    }
  }, [categories, updateFormData, t]);

  return {
    downloadExcelTemplate,
    uploadExcelData
  };
};
