
import { useCallback } from 'react';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { CategoryWithData } from '@/hooks/useDataEntry';

interface UseDataEntryUtilsProps {
  categories: CategoryWithData[];
  setCurrentCategoryIndex: (index: number) => void;
}

export const useDataEntryUtils = ({
  categories,
  setCurrentCategoryIndex
}: UseDataEntryUtilsProps) => {
  const { t } = useLanguage();

  const changeCategory = useCallback((index: number) => {
    if (index >= 0 && index < categories.length) {
      setCurrentCategoryIndex(index);
    }
  }, [categories, setCurrentCategoryIndex]);

  const saveForm = useCallback(() => {
    console.log('Form saxlanıldı');
    toast.success(t('dataSaved'));
  }, [t]);

  const getErrorForColumn = useCallback((columnId: string, errors: Array<{columnId: string, message: string}> = []) => {
    const error = errors.find(e => e.columnId === columnId);
    return error ? error.message : undefined;
  }, []);

  const downloadExcelTemplate = useCallback((categoryId: string) => {
    console.log(`Excel şablonu yüklənir: ${categoryId}`);
    toast.info(t('downloadingTemplate'));
  }, [t]);

  const uploadExcelData = useCallback((file: File, categoryId: string) => {
    console.log(`Excel məlumatları yüklənir: ${file.name}, categoryId: ${categoryId}`);
    toast.success(t('uploadDataSuccess'));
    return Promise.resolve(true);
  }, [t]);

  return {
    changeCategory,
    saveForm,
    getErrorForColumn,
    downloadExcelTemplate,
    uploadExcelData
  };
};
