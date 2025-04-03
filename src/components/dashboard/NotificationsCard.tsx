
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Bell, Mail, AlertTriangle, Calendar, FileCheck } from 'lucide-react';
import { Notification } from '@/types/notification';

interface NotificationsCardProps {
  notifications: Notification[];
  onMarkAsRead?: (id: string) => void;
}

const NotificationsCard: React.FC<NotificationsCardProps> = ({ notifications, onMarkAsRead }) => {
  const { t } = useLanguage();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'deadline':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'alert':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'message':
        return <Mail className="h-4 w-4 text-indigo-500" />;
      case 'approval':
        return <FileCheck className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-yellow-500" />;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('notifications')}</CardTitle>
      </CardHeader>
      <CardContent>
        {notifications && notifications.length > 0 ? (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`flex items-start space-x-3 p-3 rounded-md ${notification.isRead ? 'bg-card' : 'bg-accent/20'}`}
                >
                  <div className="pt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium ${!notification.isRead ? 'text-primary' : ''}`}>
                      {notification.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground">{notification.time}</span>
                      {!notification.isRead && onMarkAsRead && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 text-xs"
                          onClick={() => onMarkAsRead(notification.id)}
                        >
                          {t('markAsRead')}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center h-[300px] text-center">
            <Bell className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">{t('noNotifications')}</h3>
            <p className="text-sm text-muted-foreground/70 max-w-xs mt-2">
              {t('noNotificationsDesc')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationsCard;
