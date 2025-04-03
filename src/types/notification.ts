
export type NotificationType = 'info' | 'warning' | 'error' | 'success' | 'system' | string;
export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical' | string;

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  time?: string;
  isRead: boolean;
  userId: string;
  priority: NotificationPriority;
  relatedEntityId?: string;
  relatedEntityType?: string;
  read_status: boolean; // Əlavə edildi
}

// DB-dən gələn notification məlumatlarını Frontend formatına çevirmək üçün adaptor
export const adaptNotification = (dbNotification: any): Notification => {
  return {
    id: dbNotification.id || '',
    type: dbNotification.type || 'info',
    title: dbNotification.title || '',
    message: dbNotification.message || '',
    createdAt: dbNotification.created_at || new Date().toISOString(),
    time: formatTimeAgo(dbNotification.created_at) || '',
    isRead: dbNotification.is_read || false,
    userId: dbNotification.user_id || '',
    priority: dbNotification.priority || 'normal',
    relatedEntityId: dbNotification.related_entity_id || null,
    relatedEntityType: dbNotification.related_entity_type || null,
    read_status: dbNotification.is_read || false // Əlavə edildi
  };
};

// Vaxt formatını xoş görünüşlü şəkildə formatlamaq üçün funksiya
function formatTimeAgo(dateString?: string): string {
  if (!dateString) return '';

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);

  if (diffSec < 60) {
    return `${diffSec} saniyə əvvəl`;
  } else if (diffMin < 60) {
    return `${diffMin} dəqiqə əvvəl`;
  } else if (diffHour < 24) {
    return `${diffHour} saat əvvəl`;
  } else if (diffDay < 7) {
    return `${diffDay} gün əvvəl`;
  } else {
    return date.toLocaleDateString('az-AZ');
  }
}
