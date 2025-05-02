
import { ColumnType, ColumnValidation } from '@/types/column';
import { DataEntryStatus, EntryValue } from '@/types/dataEntry';

// Daxil edilmiş dəyərin validasiyası
export const validateEntryValue = (
  value: string, 
  type: ColumnType, 
  validation?: ColumnValidation
): string | null => {
  // Əgər validasiya qaydası yoxdursa, dəyər doğru sayılır
  if (!validation) return null;
  
  // Məcburi sahə yoxlanışı
  if (validation.required && !value.trim()) {
    return validation.requiredMessage || 'Bu sahə məcburidir';
  }

  // Əgər dəyər boşdursa və məcburi deyilsə, qalan yoxlamalara ehtiyac yoxdur
  if (!value.trim() && !validation.required) {
    return null;
  }
  
  // Tip-ə əsasən yoxlanışlar
  switch (type) {
    case 'text':
    case 'textarea':
      // Min uzunluq yoxlanışı
      if (validation.minLength && value.length < validation.minLength) {
        return `Minimum ${validation.minLength} simvol olmalıdır`;
      }
      
      // Max uzunluq yoxlanışı
      if (validation.maxLength && value.length > validation.maxLength) {
        return `Maksimum ${validation.maxLength} simvol olmalıdır`;
      }
      
      // Pattern yoxlanışı
      if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
        return validation.patternMessage || 'Düzgün format deyil';
      }
      
      // Email formatı yoxlanışı
      if (validation.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Düzgün e-poçt formatı deyil';
      }
      
      // URL formatı yoxlanışı
      if (validation.url && !/^(http|https):\/\/[^ "]+$/.test(value)) {
        return 'Düzgün URL formatı deyil';
      }
      break;
      
    case 'number':
      // Rəqəm yoxlanışı
      if (!/^-?\d*\.?\d*$/.test(value)) {
        return 'Rəqəm olmalıdır';
      }
      
      const numValue = parseFloat(value);
      
      // Min dəyər yoxlanışı
      if (validation.min !== undefined && numValue < validation.min) {
        return `Minimum dəyər ${validation.min} olmalıdır`;
      }
      
      // Max dəyər yoxlanışı
      if (validation.max !== undefined && numValue > validation.max) {
        return `Maksimum dəyər ${validation.max} olmalıdır`;
      }
      break;
      
    case 'select':
      // Seçilmiş dəyər icazə verilən variantlar siyahısında yoxlanışı
      if (validation.inclusion && !validation.inclusion.includes(value)) {
        return 'Düzgün seçim deyil';
      }
      break;
  }
  
  // Bütün yoxlamalardan keçdisə heç bir xəta yoxdur
  return null;
};

// Helper funksiya: EntryValue objectlərini DataEntry massivi formatına çevirir
export const convertEntryValuesToDataEntries = (
  entries: EntryValue[], 
  categoryId: string, 
  schoolId: string,
  status: DataEntryStatus = 'draft'
) => {
  return entries.map(entry => ({
    id: entry.entryId || `temp_${Date.now()}_${Math.random()}`,
    column_id: entry.columnId || entry.column_id || '',
    category_id: categoryId,
    school_id: schoolId,
    value: entry.value,
    status: entry.status || status,
    created_at: new Date(),
    updated_at: new Date()
  }));
};
