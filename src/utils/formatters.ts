
import { format, formatDistance, isValid, parseISO } from 'date-fns';
import { az } from 'date-fns/locale';

// Tarix formatlanması üçün
export const formatDate = (dateString: string, formatStr: string = 'dd.MM.yyyy'): string => {
  if (!dateString) return 'Tarix yoxdur';
  
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    
    if (!isValid(date)) {
      return 'Düzgün tarix deyil';
    }
    
    return format(date, formatStr, { locale: az });
  } catch (error) {
    console.error('Tarix formatlanması zamanı xəta:', error);
    return 'Tarix xətası';
  }
};

// İnsan oxuya bilən zamana formatlanma
export const formatRelativeTime = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    
    if (!isValid(date)) {
      return '';
    }
    
    return formatDistance(date, new Date(), { 
      addSuffix: true, 
      locale: az 
    });
  } catch (error) {
    return '';
  }
};

// Son tarixə qədər olan məsafə
export const formatDistanceToDeadline = (deadlineString: string): string => {
  if (!deadlineString) return '';
  
  try {
    const deadline = typeof deadlineString === 'string' ? parseISO(deadlineString) : new Date(deadlineString);
    
    if (!isValid(deadline)) {
      return '';
    }
    
    const now = new Date();
    
    if (deadline < now) {
      return 'Müddət bitib';
    }
    
    return formatDistance(deadline, now, { 
      locale: az 
    }) + ' qalıb';
  } catch (error) {
    return '';
  }
};

// Rəqəmlər üçün format
export const formatNumber = (number: number): string => {
  if (number === undefined || number === null) return '-';
  
  return new Intl.NumberFormat('az-AZ').format(number);
};

// Məbləğ formatı
export const formatCurrency = (amount: number): string => {
  if (amount === undefined || amount === null) return '-';
  
  return new Intl.NumberFormat('az-AZ', {
    style: 'currency',
    currency: 'AZN',
    minimumFractionDigits: 2
  }).format(amount);
};

// Nöqtələrlə məhdudlama
export const truncateText = (text: string, maxLength: number = 100): string => {
  if (!text || text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
};

// Faiz formatı
export const formatPercentage = (value: number, fractionDigits: number = 1): string => {
  if (value === undefined || value === null) return '-';
  
  return value.toFixed(fractionDigits) + '%';
};

// Filesize formatı
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
};
