
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { useLanguage } from '@/context/LanguageContext';
import { Bell, Info, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DashboardNotification } from '@/types/notification';

interface NotificationsCardProps {
  notifications: DashboardNotification[];
  onMarkAsRead: (id: string) => void;
}

const NotificationsCard: React.FC<NotificationsCardProps> = ({
  notifications,
  onMarkAsRead,
}) => {
  const { t } = useLanguage();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'error':
        return <X className="h-4 w-4 text-red-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-slate-500" />;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex justify-between items-center">
          <span>{t('notifications')}</span>
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => {}}>
              {t('viewAll')}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="mx-auto h-8 w-8 mb-2 opacity-50" />
            <p>{t('noNotifications')}</p>
          </div>
        ) : (
          <ScrollArea className="h-[240px]">
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border ${
                    notification.isRead ? 'bg-background' : 'bg-accent'
                  }`}
                >
                  <div className="flex items-start">
                    <div className="mr-2 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{notification.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {notification.message}
                      </p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(notification.createdAt)}
                        </span>
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => onMarkAsRead(notification.id)}
                          >
                            {t('markAsRead')}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationsCard;
