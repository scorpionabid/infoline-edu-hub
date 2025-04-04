
import { FormStatus } from '@/types/form';
import { formatTimeFromNow } from './formatTimeFromNow';

/**
 * FormStatus adapterini konvert edir
 * @param status Orijinal status
 * @returns FormStatus tipi
 */
export const adaptFormStatus = (status: string): FormStatus => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'pending';
    case 'approved':
      return 'approved';  
    case 'rejected':
      return 'rejected';
    case 'overdue':
      return 'overdue';
    case 'duesoon':
    case 'due_soon':
    case 'due soon':
      return 'dueSoon';
    case 'submitted':
      return 'submitted';
    default:
      return 'draft';
  }
};

// formatTimeFromNow funksiyasını ixrac edirik
export { formatTimeFromNow };

/**
 * Faizin təqdim edilməsi
 * @param value Faiz dəyəri
 * @returns Formatlanmış faiz mətni
 */
export const formatPercentage = (value: number): string => {
  return `${Math.round(value)}%`;
};

/**
 * Rəqəmi qısa formata çevirir
 * @param num Rəqəm
 * @returns Formatlanmış qısa rəqəm mətni
 */
export const abbreviateNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};
