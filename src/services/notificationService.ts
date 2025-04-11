
import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/types/notification';
import { TableNames } from '@/types/db';

// Son bildirişləri əldə etmək üçün funksiya
export const getLatestNotifications = async (limit: number = 5): Promise<Notification[]> => {
  try {
    const { data, error } = await supabase
      .from(TableNames.NOTIFICATIONS)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Bildirişlər əldə edilərkən xəta:", error);
      throw error;
    }

    return data.map(notification => ({
      id: notification.id,
      title: notification.title,
      message: notification.message || '',
      type: notification.type,
      isRead: notification.is_read,
      createdAt: notification.created_at,
      userId: notification.user_id,
      priority: notification.priority || 'normal',
      time: formatRelativeTime(notification.created_at)
    }));
  } catch (error: any) {
    console.error("Bildirişlər əldə edilərkən xəta:", error);
    return [];
  }
};

// Region üzrə bildirişləri əldə etmək üçün funksiya
export const getNotificationsByRegion = async (regionId: string, limit: number = 5): Promise<Notification[]> => {
  try {
    const { data, error } = await supabase
      .from(TableNames.NOTIFICATIONS)
      .select(`
        *,
        user_roles!inner(*)
      `)
      .eq('user_roles.region_id', regionId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Region bildirişləri əldə edilərkən xəta:", error);
      throw error;
    }

    return data.map(notification => ({
      id: notification.id,
      title: notification.title,
      message: notification.message || '',
      type: notification.type,
      isRead: notification.is_read,
      createdAt: notification.created_at,
      userId: notification.user_id,
      priority: notification.priority || 'normal',
      time: formatRelativeTime(notification.created_at)
    }));
  } catch (error: any) {
    console.error("Region bildirişləri əldə edilərkən xəta:", error);
    return [];
  }
};

// Sektor üzrə bildirişləri əldə etmək üçün funksiya
export const getNotificationsBySector = async (sectorId: string, limit: number = 5): Promise<Notification[]> => {
  try {
    const { data, error } = await supabase
      .from(TableNames.NOTIFICATIONS)
      .select(`
        *,
        user_roles!inner(*)
      `)
      .eq('user_roles.sector_id', sectorId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Sektor bildirişləri əldə edilərkən xəta:", error);
      throw error;
    }

    return data.map(notification => ({
      id: notification.id,
      title: notification.title,
      message: notification.message || '',
      type: notification.type,
      isRead: notification.is_read,
      createdAt: notification.created_at,
      userId: notification.user_id,
      priority: notification.priority || 'normal',
      time: formatRelativeTime(notification.created_at)
    }));
  } catch (error: any) {
    console.error("Sektor bildirişləri əldə edilərkən xəta:", error);
    return [];
  }
};

// Nisbi vaxt formatlaşdırma köməkçi funksiyası
const formatRelativeTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'İndicə';
  if (diffMins < 60) return `${diffMins} dəqiqə əvvəl`;
  if (diffHours < 24) return `${diffHours} saat əvvəl`;
  if (diffDays < 7) return `${diffDays} gün əvvəl`;
  
  return date.toLocaleDateString();
};
