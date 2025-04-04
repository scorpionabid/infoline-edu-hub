
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import NotificationItem from './NotificationItem';
import { useLanguage } from '@/context/LanguageContext';
import { Notification as TypedNotification } from '@/types/notification';
import { DashboardNotification } from '@/hooks/useDashboardData';

export interface Notification {
  id: number | string;
  type: string;
  title: string;
  message: string;
  time: string;
}

interface NotificationsCardProps {
  notifications: Notification[] | TypedNotification[] | DashboardNotification[];
}

// Notification tipi uyğunlaşdırma köməkçi funksiyası
const adaptNotification = (notification: any): Notification => {
  return {
    id: notification.id || 0,
    type: notification.type || 'info',
    title: notification.title || 'Bildiriş',
    message: notification.message || '',
    time: notification.time || notification.createdAt || new Date().toISOString(),
  };
};

const NotificationsCard: React.FC<NotificationsCardProps> = ({ notifications }) => {
  const { t } = useLanguage();
  
  // Bildirişləri Notification tipinə uyğunlaşdıraq
  const adaptedNotifications = notifications.map(notification => adaptNotification(notification));
  
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
