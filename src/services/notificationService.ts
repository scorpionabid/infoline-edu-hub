
import { Notification } from '@/types/notification';

export const getUserNotifications = async (userId: string): Promise<Notification[]> => {
  // Mock implementation
  return [
    {
      id: '1',
      title: 'New Category Available',
      message: 'A new data entry category is now available',
      createdAt: new Date().toISOString(),
      read: false,
      type: 'info'
    },
    {
      id: '2',
      title: 'Deadline Approaching',
      message: 'You have a deadline approaching in 2 days',
      createdAt: new Date().toISOString(),
      read: false,
      type: 'deadline'
    }
  ];
};

export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  // Mock implementation
  return true;
};

export const createNotification = async (notification: Partial<Notification>): Promise<Notification> => {
  // Mock implementation
  return {
    id: Math.random().toString(36).substr(2, 9),
    title: notification.title || '',
    message: notification.message || '',
    createdAt: new Date().toISOString(),
    read: false,
    type: notification.type || 'info',
    relatedEntityId: notification.relatedEntityId,
    relatedEntityType: notification.relatedEntityType
  };
};

export const createDeadlineNotification = async (
  title: string, 
  message: string, 
  entityId?: string
): Promise<Notification> => {
  return createNotification({
    title,
    message,
    type: 'deadline',
    relatedEntityId: entityId
  });
};

export const getNotifications = getUserNotifications;
