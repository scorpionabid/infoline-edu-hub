
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Notification } from '@/types/notification';

interface NotificationsCardProps {
  notifications: Notification[];
  viewAllLink?: string;
}

const NotificationsCard: React.FC<NotificationsCardProps> = ({ 
  notifications,
  viewAllLink = '/notifications'
}) => {
  const { t } = useLanguage();

  // Bildiriş tipinə uyğun rəng təyin edir
  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'system':
        return 'bg-blue-100 text-blue-800';
      case 'category':
        return 'bg-green-100 text-green-800';
      case 'deadline':
        return 'bg-amber-100 text-amber-800';
      case 'approval':
        return 'bg-purple-100 text-purple-800';
      case 'form':
        return 'bg-indigo-100 text-indigo-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      case 'success':
        return 'bg-green-100 text-green-800'; 
      case 'warning':
        return 'bg-amber-100 text-amber-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center">
          <Bell className="mr-2 h-5 w-5" />
          {t('notifications')}
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <a href={viewAllLink} className="flex items-center">
            {t('viewAll')} <ChevronRight className="ml-1 h-4 w-4" />
          </a>
        </Button>
      </CardHeader>
      <CardContent>
        {notifications && notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification.id} className="flex items-start gap-3 border-b pb-2">
                <Badge 
                  variant="outline" 
                  className={`${getNotificationTypeColor(notification.type)} mt-0.5`}
                >
                  {t(notification.type)}
                </Badge>
                <div className="flex-1">
                  <p className="font-medium">{notification.title}</p>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-muted-foreground">
                      {notification.date || (notification.createdAt ? new Date(notification.createdAt).toLocaleDateString() : '')}
                    </p>
                    {!((notification.isRead ?? false) || (notification.read ?? false)) && (
                      <Badge variant="secondary" className="text-xs">
                        {t('new')}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">{t('noNotifications')}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationsCard;
