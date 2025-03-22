
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import NotificationItem from './NotificationItem';
import { useLanguage } from '@/context/LanguageContext';

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  time: string;
}

interface NotificationsCardProps {
  notifications: Notification[];
}

const NotificationsCard: React.FC<NotificationsCardProps> = ({ notifications }) => {
  const { t } = useLanguage();
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{t('latestNotifications')}</CardTitle>
        <CardDescription>Recent system events and notifications</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationsCard;
