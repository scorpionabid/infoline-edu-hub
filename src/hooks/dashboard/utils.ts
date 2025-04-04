
import { Notification } from '@/types/notification';
import { FormItem } from '@/types/form';
import { adaptNotification } from '@/types/notification';
import { ActivityItem } from '@/types/dashboard';

/**
 * API və ya mock datadan gələn bildirişləri Notification tipinə çevirmək üçün
 * @param notifications Bildiriş array'ı
 * @returns Formatlı bildiriş array'ı
 */
export const adaptNotifications = (notifications: any[]): Notification[] => {
  return notifications.map(notification => adaptNotification(notification));
};

/**
 * FormItem'ləri düzgün formata çevirmək üçün
 * @param items Form elementləri
 * @returns Formatlı form elementləri
 */
export const adaptFormItems = (items: any[]): FormItem[] => {
  return items.map(item => ({
    id: item.id || '',
    title: item.title || '',
    categoryId: item.categoryId || item.category_id || '',
    status: item.status || 'draft',
    completionPercentage: item.completionPercentage || 0,
    deadline: item.deadline || '',
    dueDate: item.dueDate || item.due_date || '',
    filledCount: item.filledCount || 0,
    totalCount: item.totalCount || 0,
    categoryName: item.categoryName || item.category_name || '',
    userId: item.userId || item.user_id || '',
    schoolId: item.schoolId || item.school_id || ''
  }));
};

/**
 * Aktivlik elementlərini düzgün formata çevirmək üçün
 * @param items Aktivlik elementləri
 * @returns Formatlı aktivlik elementləri
 */
export const adaptActivityItems = (items: any[]): ActivityItem[] => {
  return items.map(item => ({
    id: item.id || '',
    type: item.type || 'action',
    title: item.title || '',
    description: item.description || '',
    timestamp: item.timestamp || item.time || new Date().toISOString(),
    userId: item.userId || item.user_id || '',
    action: item.action || '',
    actor: item.actor || '',
    target: item.target || '',
    time: item.time || item.timestamp || new Date().toISOString()
  }));
};

/**
 * Son tarix string formatını standartlaşdırmaq üçün
 * @param deadline Son tarix
 * @returns Standartlaşdırılmış son tarix
 */
export const transformDeadlineToString = (deadline?: any): string => {
  if (!deadline) return '';

  if (typeof deadline === 'string') {
    return deadline;
  }

  if (deadline instanceof Date) {
    return deadline.toISOString();
  }

  return new Date().toISOString();
};
