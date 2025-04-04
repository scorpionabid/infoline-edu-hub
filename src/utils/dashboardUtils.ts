
import { FormStatus } from '@/types/form';

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

/**
 * Zaman önçə formatlanır
 * @param dateString İSO tarix string
 * @returns İnsan tərəfindən oxunabilən zaman
 */
export const formatTimeFromNow = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.round(diffMs / 60000); // millisecond -> minute
  
  if (diffMins < 1) {
    return 'indicə';
  } else if (diffMins < 60) {
    return `${diffMins} dəqiqə əvvəl`;
  } else if (diffMins < 24 * 60) {
    const diffHours = Math.round(diffMins / 60);
    return `${diffHours} saat əvvəl`;
  } else {
    const diffDays = Math.round(diffMins / (60 * 24));
    return `${diffDays} gün əvvəl`;
  }
};

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

/**
 * Kateqoriyalar tamamlanma dərəcəsi üçün mocklanmış data
 * @returns Mock category data
 */
export const getMockCategoryCompletion = () => {
  return [
    { name: "Statistikalar", completed: 85 },
    { name: "Müəllimlər", completed: 72 },
    { name: "Şagirdlər", completed: 92 },
    { name: "Tədris planı", completed: 64 },
    { name: "İnfrastruktur", completed: 58 },
    { name: "Sənədlər", completed: 90 }
  ];
};
