
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import NotificationItem from './NotificationItem';
import { useLanguage } from '@/context/LanguageContext';
import { Notification, adaptNotification } from '@/types/notification';

// NotificationsCard üçün əlavə interfeys
interface NotificationsCardProps {
  notifications: Notification[];
}

const NotificationsCard: React.FC<NotificationsCardProps> = ({ notifications = [] }) => {
  const { t } = useLanguage();
  
  // Əmin olaq ki, notifications null və ya undefined deyil
  const safeNotifications = notifications || [];
  
  // Bildirişləri uyğunlaşdırın
  const adaptedNotifications = safeNotifications.map(notification => adaptNotification(notification));
  
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
