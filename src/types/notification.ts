
export type NotificationType = 
  'info' | 'warning' | 'success' | 'error' | 'system' | 
  'newCategory' | 'deadline' | 'dueDateReminder' | 
  'approval' | 'approvalRequest' | 'approved' | 'formApproved' | 
  'rejection' | 'rejected' | 'formRejected' | 
  'systemUpdate' | 'entry';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent' | 'critical';

export type NotificationEntityType = 
  'system' | 'category' | 'column' | 'school' | 'user' | 
  'region' | 'sector' | 'form' | 'report' | 'entry';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  userId: string;
  createdAt: string;
  isRead: boolean;
  time: string;
  relatedEntityId: string;
  relatedEntityType: NotificationEntityType;
  read_status?: boolean; // api uyğunluğu üçün
}

// API-dən gələn bildiriş məlumatlarını daxili formata çevirmək üçün adapter
export const adaptNotification = (data: any): Notification => {
  return {
    id: data.id || '',
    type: data.type || 'info',
    title: data.title || '',
    message: data.message || '',
    priority: data.priority || 'normal',
    userId: data.user_id || data.userId || '',
    createdAt: data.created_at || data.createdAt || new Date().toISOString(),
    isRead: data.is_read || data.isRead || false,
    time: data.time || formatTimeFromNow(data.created_at || data.createdAt || new Date().toISOString()),
    relatedEntityId: data.related_entity_id || data.relatedEntityId || '',
    relatedEntityType: data.related_entity_type || data.relatedEntityType || 'system',
    read_status: data.is_read || data.isRead || false
  };
};

// Zaman formatını bildirişlər üçün düzgün şəkildə göstərmək
export const formatTimeFromNow = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
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
  } catch (e) {
    console.error('Invalid date:', dateString);
    return 'bilinməyən tarix';
  }
};
