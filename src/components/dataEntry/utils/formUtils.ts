
import { DataEntryForm, CategoryEntryData, DataEntry } from '@/types/dataEntry';

// Formun ümumi tamamlanma faizini hesablayın
export const calculateOverallProgress = (entries: CategoryEntryData[]): number => {
  if (entries.length === 0) return 0;
  
  // Yalnız completionPercentage xassəsi mövcud olan sətirlər üçün hesablayırıq
  const categoriesWithProgress = entries.filter(entry => typeof entry.completionPercentage === 'number');
  
  if (categoriesWithProgress.length === 0) return 0;
  
  // Orta tamamlanma faizini hesablayırıq
  const totalProgress = categoriesWithProgress.reduce((sum, entry) => 
    sum + (entry.completionPercentage || 0), 0);
  
  return Math.round(totalProgress / categoriesWithProgress.length);
};

// DataEntry arrayi üçün filtrləmə funksiyasi
export const filterEntries = (entries: DataEntry[], columnId?: string, status?: string): DataEntry[] => {
  let filteredEntries = [...entries];
  
  if (columnId) {
    filteredEntries = filteredEntries.filter(entry => entry.columnId === columnId);
  }
  
  if (status) {
    filteredEntries = filteredEntries.filter(entry => entry.status === status);
  }
  
  return filteredEntries;
};

// Dəyəri validasiya etmək üçün utilita funksiya
export const validateEntryValue = (value: any, rules: any): { valid: boolean, message?: string } => {
  if (!rules) return { valid: true };
  if (!value && rules.required) return { valid: false, message: 'Bu sahə tələb olunur' };
  
  if (value) {
    // Rəqəm validasiyası
    if (typeof rules.minValue === 'number' || typeof rules.maxValue === 'number') {
      const numValue = Number(value);
      if (isNaN(numValue)) return { valid: false, message: 'Düzgün rəqəm daxil edin' };
      
      if (typeof rules.minValue === 'number' && numValue < rules.minValue) {
        return { valid: false, message: `Minimum ${rules.minValue} olmalıdır` };
      }
      
      if (typeof rules.maxValue === 'number' && numValue > rules.maxValue) {
        return { valid: false, message: `Maksimum ${rules.maxValue} olmalıdır` };
      }
    }
    
    // Mətn uzunluğu validasiyası
    if (typeof rules.minLength === 'number' || typeof rules.maxLength === 'number') {
      const strValue = String(value);
      
      if (typeof rules.minLength === 'number' && strValue.length < rules.minLength) {
        return { valid: false, message: `Minimum ${rules.minLength} simvol olmalıdır` };
      }
      
      if (typeof rules.maxLength === 'number' && strValue.length > rules.maxLength) {
        return { valid: false, message: `Maksimum ${rules.maxLength} simvol olmalıdır` };
      }
    }
    
    // Regex pattern validasiyası
    if (rules.pattern) {
      try {
        const regex = new RegExp(rules.pattern);
        if (!regex.test(String(value))) {
          return { valid: false, message: rules.patternMessage || 'Düzgün format deyil' };
        }
      } catch (e) {
        console.error('Invalid regex pattern:', e);
      }
    }
  }
  
  return { valid: true };
};
