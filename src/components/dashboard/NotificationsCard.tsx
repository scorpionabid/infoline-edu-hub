
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import NotificationItem from './NotificationItem';
import { useLanguage } from '@/context/LanguageContext';
import { Notification as TypedNotification } from '@/types/notification';

export interface Notification {
  id: number | string;
  type: string;
  title: string;
  message: string;
  time: string;
}

interface NotificationsCardProps {
  notifications: Notification[] | TypedNotification[];
}

// Notification tipi uyğunlaşdırma köməkçi funksiyası
const adaptNotification = (notification: TypedNotification): Notification => {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    time: notification.createdAt,
  };
};

// Əlavə olan adaptIfNeeded köməkçi funksiyası
const adaptIfNeeded = (notification: any): Notification => {
  // Əgər notification null və ya undefined isə, varsayılan dəyər qaytaraq
  if (!notification) {
    return {
      id: 'default',
      type: 'info',
      title: 'Bildiriş',
      message: '',
      time: new Date().toISOString(),
    };
  }
  
  // Əgər artıq uyğun formatdadırsa, birbaşa qaytarın
  if (notification.time !== undefined) {
    return notification as Notification;
  }
  
  // TypedNotification formatında olduqda uyğunlaşdırın
  if (notification.createdAt !== undefined) {
    return adaptNotification(notification as TypedNotification);
  }
  
  // Əgər heç bir şərt uyğun gəlmirsə, xəta vermək əvəzinə varsayılan dəyərlər təyin edin
  return {
    id: notification.id || 'default',
    type: notification.type || 'info',
    title: notification.title || 'Bildiriş',
    message: notification.message || '',
    time: notification.createdAt || new Date().toISOString(),
  };
};

const NotificationsCard: React.FC<NotificationsCardProps> = ({ notifications = [] }) => {
  const { t } = useLanguage();
  
  // Əmin olaq ki, notifications null və ya undefined deyil
  const safeNotifications = notifications || [];
  
  // Bildirişləri uyğunlaşdırın
  const adaptedNotifications = safeNotifications.map(notification => adaptIfNeeded(notification));
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{t('latestNotifications')}</CardTitle>
        <CardDescription>Recent system events and notifications</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {adaptedNotifications.length > 0 ? (
            adaptedNotifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))
          ) : (
            <div className="text-center text-muted-foreground py-4">
              {t('noNotifications')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationsCard;
