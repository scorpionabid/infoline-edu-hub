
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { Notification } from '@/types/notification';
import NotificationList from '@/components/notifications/NotificationList';

interface NotificationsCardProps {
  notifications: Notification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onClearAll?: () => void;
}

const NotificationsCard: React.FC<NotificationsCardProps> = ({ 
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll
}) => {
  const { t } = useLanguage();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('notifications')}</CardTitle>
      </CardHeader>
      <CardContent>
        <NotificationList 
          notifications={notifications} 
          onMarkAsRead={onMarkAsRead || (() => {})}
          onMarkAllAsRead={onMarkAllAsRead || (() => {})} 
          onClearAll={onClearAll || (() => {})}
        />
      </CardContent>
    </Card>
  );
};

export default NotificationsCard;
