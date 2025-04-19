
import { format, isValid, parseISO } from 'date-fns';
import { az } from 'date-fns/locale';

export const formatDate = (date: string | Date, formatStr = 'dd.MM.yyyy'): string => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    if (!isValid(dateObj)) {
      return '';
    }
    
    return format(dateObj, formatStr, { locale: az });
  } catch (error) {
    console.error('Tarix formatlanarkən xəta:', error);
    return '';
  }
};

export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'dd.MM.yyyy HH:mm');
};

export const isDeadlineApproaching = (deadline: string | Date, daysThreshold = 3): boolean => {
  try {
    const deadlineDate = typeof deadline === 'string' ? parseISO(deadline) : deadline;
    
    if (!isValid(deadlineDate)) {
      return false;
    }
    
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 && diffDays <= daysThreshold;
  } catch (error) {
    console.error('Son tarix yoxlanarkən xəta:', error);
    return false;
  }
};

export const isDeadlinePassed = (deadline: string | Date): boolean => {
  try {
    const deadlineDate = typeof deadline === 'string' ? parseISO(deadline) : deadline;
    
    if (!isValid(deadlineDate)) {
      return false;
    }
    
    return deadlineDate < new Date();
  } catch (error) {
    console.error('Keçmiş son tarix yoxlanarkən xəta:', error);
    return false;
  }
};
