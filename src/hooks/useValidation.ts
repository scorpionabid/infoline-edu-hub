
import { useState, useCallback } from 'react';
import { CategoryWithColumns, Column } from '@/types/column';
import { CategoryEntryData, ColumnValidationError } from '@/types/dataEntry';
import { useLanguage } from '@/context/LanguageContext';
import { formatValueByType, isEmptyValue, validateColumnValue } from '@/components/dataEntry/utils/formUtils';

export const useValidation = (categories: CategoryWithColumns[], entries: CategoryEntryData[]) => {
  const { t } = useLanguage();
  const [errors, setErrors] = useState<ColumnValidationError[]>([]);

  // Bütün formu validasiya etmək üçün metod
  const validateForm = useCallback(() => {
    const newErrors: ColumnValidationError[] = [];
    let isValid = true;

    // Əgər kateqoriya seçilməyibsə, formun validasiyasını keçmiş sayırıq
    if (categories.length === 0) {
      return true;
    }

    // Hər bir kateqoriyanı yoxlayırıq
    categories.forEach(category => {
      const entry = entries.find(e => e.categoryId === category.id);
      if (!entry) return;

      // Kateqoriyanın sütunlarını yoxlayırıq
      category.columns.forEach(column => {
        const valueObj = entry.values.find(v => v.columnId === column.id);
        const value = valueObj ? valueObj.value : undefined;
        
        // Sütunun dəyərini tipinə görə validasiya edirik
        const error = validateColumnValue(value, column.type, column.is_required, column.validation);
        
        if (error) {
          newErrors.push({
            columnId: column.id,
            message: error,
            categoryId: category.id
          });
          isValid = false;
        }
      });
    });

    setErrors(newErrors);
    return isValid;
  }, [categories, entries, t]);

  // Xüsusi bir sütun üçün xəta mesajını əldə etmək metodu
  const getErrorForColumn = useCallback((columnId: string) => {
    const error = errors.find(err => err.columnId === columnId);
    return error ? error.message : '';
  }, [errors]);

  return {
    errors,
    validateForm,
    getErrorForColumn
  };
};
