
import { format, isValid, parseISO } from 'date-fns';

export const formatDate = (date: string | Date | null | undefined, formatStr: string = 'dd.MM.yyyy'): string => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    if (!isValid(dateObj)) {
      return '';
    }
    
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

export const isValidDate = (date: any): boolean => {
  if (!date) return false;
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isValid(dateObj);
  } catch (error) {
    return false;
  }
};

// Date-i ISO string-ə çevirmək
export const dateToISOString = (date: Date | null | undefined): string => {
  if (!date) return '';
  
  try {
    return isValid(date) ? date.toISOString() : '';
  } catch (error) {
    console.error('Error converting date to ISO string:', error);
    return '';
  }
};

// String ISO formatından Date-ə çevirmək
export const isoStringToDate = (dateStr: string | null | undefined): Date | null => {
  if (!dateStr) return null;
  
  try {
    const date = parseISO(dateStr);
    return isValid(date) ? date : null;
  } catch (error) {
    console.error('Error parsing ISO date string:', error);
    return null;
  }
};
