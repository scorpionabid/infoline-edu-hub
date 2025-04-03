
import { User } from '@/context/AuthContext';
import { DashboardData, FormItem } from '@/types/dashboard';

/**
 * Bütün dashboard növləri üçün əsas məlumatları əldə edir
 */
export const getBaseData = async (user: User): Promise<DashboardData> => {
  // Baza məlumatları burada əldə edilir
  return {
    // Əsas məlumatlar burada ola bilər
  };
};

/**
 * Form items üçün güvənli obyektlər yaradır
 */
export const createSafeFormItems = (items: any[]): FormItem[] => {
  return items.map(item => ({
    id: item.id || crypto.randomUUID(),
    title: item.title || 'Form',
    status: item.status || 'pending',
    deadline: item.deadline ? transformDeadlineToString(item.deadline) : undefined,
    completionRate: item.completionRate || 0
  }));
};

/**
 * Tarix tipini string-ə çevirir
 */
export const transformDeadlineToString = (deadline: Date | string): string => {
  if (typeof deadline === 'string') {
    return deadline;
  }
  
  return deadline.toISOString();
};
