
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { DashboardNotification } from '@/types/dashboard';
import { formatDistanceToNow } from 'date-fns';
import { az } from 'date-fns/locale';

interface NotificationsCardProps {
  notifications: DashboardNotification[];
}

const NotificationsCard: React.FC<NotificationsCardProps> = ({ notifications }) => {
  const { t, locale } = useLanguage();

  // Notification-ın yaranma tarixini formatla
  const formatDate = (notification: DashboardNotification) => {
    // createdAt varsa, əvvəlcə onu istifadə et, əks halda date və time birləşdir
    if (notification.createdAt) {
      try {
        return formatDistanceToNow(new Date(notification.createdAt), { 
          addSuffix: true,
          locale: locale === 'az' ? az : undefined 
        });
      } catch (error) {
        console.error('Tarix formatlaşdırma xətası:', error);
        return notification.date || '';
      }
    }

    // createdAt yoxdursa və date varsa, onu istifadə et
    if (notification.date) {
      if (notification.time) {
        // Əgər həm date, həm də time varsa, birləşdir
        try {
          const dateTime = `${notification.date}T${notification.time}`;
          return formatDistanceToNow(new Date(dateTime), { 
            addSuffix: true,
            locale: locale === 'az' ? az : undefined 
          });
        } catch (error) {
          console.error('Tarix formatlaşdırma xətası:', error);
          return notification.date;
        }
      }
      return notification.date;
    }

    return '';
  };

  // Priorityə əsasən rəng təyin et
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!notifications || notifications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('notifications')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('noNotifications')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('notifications')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div key={notification.id} className="flex flex-col space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{notification.title}</p>
                <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(notification.priority)}`}>
                  {t(notification.priority)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{notification.message}</p>
              <p className="text-xs text-muted-foreground">{formatDate(notification)}</p>
              <div className="h-px bg-muted my-1"></div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationsCard;
