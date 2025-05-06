
import { DataEntry, ColumnValue } from '@/types/dataEntry';

// Daxil edilmiş məlumatları yoxlamaq üçün
export const validateEntries = (entries: ColumnValue[]): boolean => {
  // Bütün məcburi sahələrin doldurulduğunu yoxla
  const invalidEntries = entries.filter(entry => 
    entry.isRequired && 
    (entry.value === null || entry.value === undefined || entry.value === '')
  );
  
  // Əlavə validasiya yoxlamaları (format yoxlaması və s.)
  const invalidFormats = entries.filter(entry => !entry.isValid);
  
  return invalidEntries.length === 0 && invalidFormats.length === 0;
};

// Məlumatlar əsasında ColumnValue obyektlərini yaratmaq üçün
export const formatEntries = (entries: DataEntry[], columns: any[]): ColumnValue[] => {
  if (!entries || !columns) return [];
  
  return columns.map(column => {
    const entry = entries.find(e => e.column_id === column.id);
    
    return {
      columnId: column.id,
      value: entry ? parseValue(entry.value, column.type) : getDefaultValue(column),
      columnType: column.type,
      isRequired: column.is_required || false,
      isValid: true // ilkin olaraq validdir, validasiya zamanı yenilənəcək
    };
  });
};

// Məlumat tipinə görə dəyəri uyğun formata çevirmək
const parseValue = (value: string, type: string): string | number | boolean | null => {
  if (value === null || value === undefined) return null;
  
  switch (type) {
    case 'number':
      return Number(value);
    case 'boolean':
      return value === 'true' || value === '1';
    default:
      return value;
  }
};

// Sütun tipinə görə default dəyər qaytarmaq
const getDefaultValue = (column: any): string | number | boolean | null => {
  if (column.default_value !== null && column.default_value !== undefined) {
    return parseValue(column.default_value, column.type);
  }
  
  switch (column.type) {
    case 'number':
      return 0;
    case 'boolean':
      return false;
    default:
      return '';
  }
};
