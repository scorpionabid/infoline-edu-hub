
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppNotification } from '@/types/notification';
import NotificationItem from '../NotificationItem';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';

interface NotificationsCardProps {
  title: string;
  notifications: AppNotification[];
  showViewAllButton?: boolean;
  maxItems?: number;
  onMarkAsRead?: (id: string) => void;
}

const NotificationsCard: React.FC<NotificationsCardProps> = ({
  title,
  notifications,
  showViewAllButton = true,
  maxItems = 3,
  onMarkAsRead
}) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const displayedNotifications = notifications.slice(0, maxItems);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayedNotifications.length > 0 ? (
            <>
              {displayedNotifications.map((notification) => (
                <NotificationItem 
                  key={notification.id} 
                  notification={notification}
                  onMarkAsRead={onMarkAsRead}
                />
              ))}
              
              {showViewAllButton && notifications.length > maxItems && (
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="sm"
                  onClick={() => navigate('/notifications')}
                >
                  {t('viewAllNotifications')} ({notifications.length - maxItems} {t('more')})
                </Button>
              )}
            </>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              {t('noNotifications')}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationsCard;
