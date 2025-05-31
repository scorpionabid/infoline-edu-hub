/**
 * Məlumat formatlanması üçün köməkçi funksiyalar
 * Bu fayl məlumat formatlanması, option-ların çevrilməsi və digər formatlanma funksiyalarını təmin edir
 */

import { Column, ColumnOption } from '@/types/column';

// Artıq ColumnOption istifadə edəcəyik, öz tipimizi yaratmağa ehtiyac yoxdur

/**
 * Xam options məlumatını formatlanmış option obyektinə çevirir
 * 
 * @param option Xam option məlumatı - string, number və ya obyekt ola bilər
 * @param index İndeks (unique ID yaratmaq üçün lazım ola bilər)
 * @returns Formatlanmış option obyekti { label, value }
 */
export const formatOption = (option: any, index: number): ColumnOption => {
  // Option string və ya number-dırsa
  if (typeof option === 'string' || typeof option === 'number') {
    return {
      label: String(option),
      value: String(option) // Həmişə string qaytarmağı təmin edirik
    };
  }
  
  // Option obyektdirsə
  if (typeof option === 'object' && option !== null) {
    // Əgər label və value varsa, birbaşa istifadə et
    if (option.hasOwnProperty('label') && option.hasOwnProperty('value')) {
      return {
        label: String(option.label || ''),
        value: String(option.value) // Həmişə string qaytarmağı təmin edirik
      };
    }
    
    // Əgər təkcə label və ya təkcə value varsa
    if (option.hasOwnProperty('label')) {
      return {
        label: String(option.label || ''),
        value: String(option.label || `option-${index}`)
      };
    }
    
    if (option.hasOwnProperty('value')) {
      return {
        label: String(option.value || ''),
        value: String(option.value) // Həmişə string qaytarmağı təmin edirik
      };
    }
    
    // Əgər heç biri yoxdursa amma id varsa
    if (option.hasOwnProperty('id')) {
      return {
        label: String(option.name || option.title || option.id || ''),
        value: String(option.id) // Həmişə string qaytarmağı təmin edirik
      };
    }
  }
  
  // Default variant
  return {
    label: `Option ${index + 1}`,
    value: `option-${index}`
  };
};

/**
 * Options massivini formatlanmış massivə çevirir
 * 
 * @param options Xam options massivi
 * @returns Formatlanmış options massivi
 */
export const formatOptions = (options: any[] | null | undefined): ColumnOption[] => {
  if (!options || !Array.isArray(options)) {
    console.warn('Invalid options format:', options);
    return [];
  }
  
  try {
    return options.map((option, index) => formatOption(option, index));
  } catch (err) {
    console.error('Error formatting options:', err);
    return [];
  }
};

/**
 * Sütun məlumatlarını formatlanmış halda çevirir
 * 
 * @param column Sütun məlumatı
 * @returns Formatlanmış sütun məlumatı
 */
export const formatColumn = (column: Column): Column => {
  if (!column) {
    console.warn('Invalid column:', column);
    return column;
  }
  
  try {
    // Type-ı yoxla və dropdown tipindədirsə options-ları formatla
    if (column.type === 'select' || column.type === 'radio' || column.type === 'checkbox') {
      // Options massivinin yoxlanması və formatlanması
      const formattedOptions = formatOptions(column.options);
      
      // Əgər options formatlanmışsa, onu orijinal sütun ilə birləşdir
      return {
        ...column,
        options: formattedOptions
      };
    }
    
    // Digər tip sütunlar üçün birbaşa qaytarırıq
    return column;
  } catch (err) {
    console.error(`Error formatting column ${column.id || 'unknown'}:`, err);
    return column;
  }
};

/**
 * Sütunlar massivini formatlanmış halda çevirir
 * 
 * @param columns Sütunlar massivi
 * @returns Formatlanmış sütunlar massivi
 */
export const formatColumns = (columns: Column[] | null | undefined): Column[] => {
  if (!columns || !Array.isArray(columns)) {
    console.warn('Invalid columns format:', columns);
    return [];
  }
  
  try {
    // Hər bir sütunu ayrıca formatla
    const formattedColumns = columns.map(column => formatColumn(column));
    
    // Dəbaq üçün formatlanmış məlumatları çap et
    if (process.env.NODE_ENV === 'development') {
      console.log(`Formatted ${formattedColumns.length} columns with options`);
    }
    
    return formattedColumns;
  } catch (err) {
    console.error('Error formatting columns:', err);
    return [];
  }
};
