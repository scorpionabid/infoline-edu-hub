
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { Notification } from '@/types/notification';
import NotificationList from './NotificationList';

interface NotificationsCardProps {
  notifications: Notification[];
}

const NotificationsCard: React.FC<NotificationsCardProps> = ({ notifications }) => {
  const { t } = useLanguage();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('notifications')}</CardTitle>
      </CardHeader>
      <CardContent>
        <NotificationList notifications={notifications} />
      </CardContent>
    </Card>
  );
};

export default NotificationsCard;
