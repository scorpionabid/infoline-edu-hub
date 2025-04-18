
import { DataEntry, ColumnValidationError } from '@/types/dataEntry';
import { Column } from '@/types/column';

export const validateEntries = (
  entries: DataEntry[],
  columns: Column[]
): ColumnValidationError[] => {
  const errors: ColumnValidationError[] = [];

  // Hər sütun üçün məcburi sahələri yoxlayırıq
  columns.forEach(column => {
    if (column.is_required) {
      const entry = entries.find(e => e.column_id === column.id);
      
      if (!entry || !entry.value || entry.value.trim() === '') {
        errors.push({
          columnId: column.id,
          columnName: column.name,
          message: `${column.name} sahəsi məcburidir.`
        });
      }
    }

    // Ədəd tipli sütunlar üçün validasiya
    if (column.type === 'number' && column.validation) {
      const entry = entries.find(e => e.column_id === column.id);
      
      if (entry && entry.value) {
        const numValue = parseFloat(entry.value);
        
        if (isNaN(numValue)) {
          errors.push({
            columnId: column.id,
            columnName: column.name,
            message: `${column.name} ədəd olmalıdır.`
          });
        } else {
          if (column.validation.minValue !== undefined && numValue < column.validation.minValue) {
            errors.push({
              columnId: column.id,
              columnName: column.name,
              message: `${column.name} minimum ${column.validation.minValue} olmalıdır.`
            });
          }
          
          if (column.validation.maxValue !== undefined && numValue > column.validation.maxValue) {
            errors.push({
              columnId: column.id,
              columnName: column.name,
              message: `${column.name} maksimum ${column.validation.maxValue} olmalıdır.`
            });
          }
        }
      }
    }

    // Text tipli sütunlar üçün validasiya
    if ((column.type === 'text' || column.type === 'textarea') && column.validation) {
      const entry = entries.find(e => e.column_id === column.id);
      
      if (entry && entry.value) {
        if (column.validation.minLength !== undefined && entry.value.length < column.validation.minLength) {
          errors.push({
            columnId: column.id,
            columnName: column.name,
            message: `${column.name} minimum ${column.validation.minLength} simvol olmalıdır.`
          });
        }
        
        if (column.validation.maxLength !== undefined && entry.value.length > column.validation.maxLength) {
          errors.push({
            columnId: column.id,
            columnName: column.name,
            message: `${column.name} maksimum ${column.validation.maxLength} simvol olmalıdır.`
          });
        }
        
        if (column.validation.pattern) {
          try {
            const regex = new RegExp(column.validation.pattern);
            if (!regex.test(entry.value)) {
              errors.push({
                columnId: column.id,
                columnName: column.name,
                message: column.validation.customMessage || `${column.name} düzgün formatda deyil.`
              });
            }
          } catch (e) {
            console.error('Invalid regex pattern:', column.validation.pattern);
          }
        }
      }
    }
  });

  return errors;
};

export const calculateCompletionPercentage = (
  entries: DataEntry[],
  columns: Column[]
): number => {
  if (!columns.length) return 0;
  
  // Yalnız məlumat daxil edilmiş məcburi sahələri sayırıq
  const requiredColumns = columns.filter(col => col.is_required);
  if (!requiredColumns.length) return 100; // Əgər məcburi sahə yoxdursa, 100% tamamlanıb
  
  const completedEntries = requiredColumns.filter(col => {
    const entry = entries.find(e => e.column_id === col.id);
    return entry && entry.value && entry.value.trim() !== '';
  });
  
  return Math.round((completedEntries.length / requiredColumns.length) * 100);
};

export const formatDate = (dateString?: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('az-AZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (e) {
    console.error('Invalid date format:', e);
    return dateString;
  }
};

export const mapEntriesToFormValues = (
  entries: DataEntry[],
  columns: Column[]
): Record<string, any> => {
  const formValues: Record<string, any> = {};
  
  columns.forEach(column => {
    const entry = entries.find(e => e.column_id === column.id);
    
    if (entry) {
      formValues[column.id] = entry.value;
    } else {
      // Default dəyər təyin edirik
      if (column.type === 'checkbox') {
        formValues[column.id] = [];
      } else if (column.type === 'number') {
        formValues[column.id] = column.default_value ? parseFloat(column.default_value) : '';
      } else {
        formValues[column.id] = column.default_value || '';
      }
    }
  });
  
  return formValues;
};
