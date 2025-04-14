
/**
 * Tip konverterlər və adapterlər
 * Bu fayl müxtəlif API və fayl tipləri arasında konversiyaları təmin edir
 */

import { Notification as DbNotification } from '@/types/supabase';
import { Notification as AppNotification, NotificationType, NotificationPriority } from '@/types/notification';
import { DashboardNotification } from '@/types/dashboard';

/**
 * Verilənlər bazası bildirişini tətbiq bildirişinə çevirir
 */
export function dbNotificationToAppNotification(dbNotification: DbNotification): AppNotification {
  return {
    id: dbNotification.id,
    title: dbNotification.title,
    message: dbNotification.message,
    type: dbNotification.type as NotificationType,
    isRead: dbNotification.is_read,
    createdAt: dbNotification.created_at,
    userId: dbNotification.user_id,
    priority: dbNotification.priority as NotificationPriority,
    time: new Date(dbNotification.created_at).toISOString(),
    date: new Date(dbNotification.created_at).toISOString()
  };
}

/**
 * Tətbiq bildirişini dashboard bildirişinə çevirir
 */
export function appNotificationToDashboardNotification(appNotification: AppNotification): DashboardNotification {
  return {
    ...appNotification,
    date: appNotification.date || new Date(appNotification.createdAt).toISOString()
  };
}

/**
 * Verilənlər bazası bildirişini dashboard bildirişinə çevirir
 */
export function dbNotificationToDashboardNotification(dbNotification: DbNotification): DashboardNotification {
  const appNotification = dbNotificationToAppNotification(dbNotification);
  return appNotificationToDashboardNotification(appNotification);
}
