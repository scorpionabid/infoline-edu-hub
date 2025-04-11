
import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/types/notification';

// Funksiya: Son bildirişləri əldə et
export const getLatestNotifications = async (limit: number = 5): Promise<Notification[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Son bildirişlər əldə edilərkən xəta:", error);
      throw error;
    }

    return data.map(notification => ({
      id: notification.id,
      title: notification.title,
      message: notification.message || '',
      type: notification.type,
      isRead: notification.is_read,
      createdAt: notification.created_at,
      time: formatTimeAgo(new Date(notification.created_at)),
      userId: notification.user_id,
      priority: notification.priority || 'normal'
    }));
  } catch (error: any) {
    console.error("Son bildirişlər əldə edilərkən xəta:", error);
    return [];
  }
};

// Funksiya: Region üzrə bildirişləri əldə et
export const getNotificationsByRegion = async (regionId: string, limit: number = 5): Promise<Notification[]> => {
  try {
    // Regiona aid istifadəçiləri əldə et
    const { data: userRoles, error: userRolesError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('region_id', regionId);
    
    if (userRolesError) {
      console.error("Region istifadəçiləri əldə edilərkən xəta:", userRolesError);
      throw userRolesError;
    }
    
    if (!userRoles || userRoles.length === 0) {
      return [];
    }
    
    // İstifadəçi ID-lərini siyahı şəklində hazırla
    const userIds = userRoles.map(role => role.user_id);
    
    // Bu istifadəçilərə aid bildirişləri əldə et
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .in('user_id', userIds)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (notificationsError) {
      console.error("Region üzrə bildirişlər əldə edilərkən xəta:", notificationsError);
      throw notificationsError;
    }
    
    return notifications.map(notification => ({
      id: notification.id,
      title: notification.title,
      message: notification.message || '',
      type: notification.type,
      isRead: notification.is_read,
      createdAt: notification.created_at,
      time: formatTimeAgo(new Date(notification.created_at)),
      userId: notification.user_id,
      priority: notification.priority || 'normal'
    }));
  } catch (error: any) {
    console.error("Region üzrə bildirişlər əldə edilərkən xəta:", error);
    return [];
  }
};

// Funksiya: Sektor üzrə bildirişləri əldə et
export const getNotificationsBySector = async (sectorId: string, limit: number = 5): Promise<Notification[]> => {
  try {
    // Sektora aid istifadəçiləri əldə et
    const { data: userRoles, error: userRolesError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('sector_id', sectorId);
    
    if (userRolesError) {
      console.error("Sektor istifadəçiləri əldə edilərkən xəta:", userRolesError);
      throw userRolesError;
    }
    
    if (!userRoles || userRoles.length === 0) {
      return [];
    }
    
    // İstifadəçi ID-lərini siyahı şəklində hazırla
    const userIds = userRoles.map(role => role.user_id);
    
    // Bu istifadəçilərə aid bildirişləri əldə et
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .in('user_id', userIds)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (notificationsError) {
      console.error("Sektor üzrə bildirişlər əldə edilərkən xəta:", notificationsError);
      throw notificationsError;
    }
    
    return notifications.map(notification => ({
      id: notification.id,
      title: notification.title,
      message: notification.message || '',
      type: notification.type,
      isRead: notification.is_read,
      createdAt: notification.created_at,
      time: formatTimeAgo(new Date(notification.created_at)),
      userId: notification.user_id,
      priority: notification.priority || 'normal'
    }));
  } catch (error: any) {
    console.error("Sektor üzrə bildirişlər əldə edilərkən xəta:", error);
    return [];
  }
};

// Köməkçi funksiya: Vaxtı "X zaman əvvəl" formatına çevir
const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMins = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMins < 1) return 'İndicə';
  if (diffInMins < 60) return `${diffInMins} dəqiqə əvvəl`;
  if (diffInHours < 24) return `${diffInHours} saat əvvəl`;
  if (diffInDays < 7) return `${diffInDays} gün əvvəl`;

  return date.toLocaleDateString();
};
