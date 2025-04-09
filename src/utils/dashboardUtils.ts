
import { v4 as uuidv4 } from 'uuid';
import { Notification, NotificationType } from '@/types/notification';

// Random bir tarix generasiya etmək üçün
export const getRandomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Bildiriş generasiyası üçün
export const generateMockNotifications = (count: number): Notification[] => {
  const notificationTypes: NotificationType[] = ['info', 'warning', 'success', 'error', 'system', 'category', 'deadline', 'approval'];
  const notifications: Notification[] = [];

  for (let i = 0; i < count; i++) {
    notifications.push({
      id: uuidv4(),
      title: `Bildiriş ${i + 1}`,
      message: `Bu bir test bildirişidir ${i + 1}`,
      type: notificationTypes[i % notificationTypes.length],
      isRead: i > 2, // İlk 3 bildiriş oxunmamış
      createdAt: getRandomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()).toISOString(),
      userId: 'user-id', // Test üçün sabit istifadəçi ID
      priority: 'normal'
    });
  }

  // Oxunmamış bildirişləri əvvəldə göstərmək üçün sırala
  return notifications.sort((a, b) => {
    if (a.isRead === b.isRead) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return a.isRead ? 1 : -1;
  });
};

// Form tamamlanma faizini hesablama
export const calculateCompletionRate = (total: number, completed: number): number => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

// Müəyyən bir tarixi formatla
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('az-AZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
