
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Notification } from '@/types/notification';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { BellOff } from 'lucide-react';

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onClearAll?: () => void;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
}) => {
  const { t } = useLanguage();

  if (!notifications || notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <BellOff className="h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-2 text-base font-semibold text-foreground">
          {t('noNotifications')}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {t('noNotificationsDesc')}
        </p>
      </div>
    );
  }

  return (
    <div>
      {(onMarkAllAsRead || onClearAll) && (
        <div className="flex justify-between p-4 border-b">
          {onMarkAllAsRead && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onMarkAllAsRead}
            >
              {t('markAllAsRead')}
            </Button>
          )}
          {onClearAll && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClearAll}
            >
              {t('clearAll')}
            </Button>
          )}
        </div>
      )}
      
      <ScrollArea className="max-h-[300px]">
        <div className="p-4 space-y-4">
          {notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`p-3 rounded-lg border ${notification.isRead ? 'bg-background' : 'bg-accent/20'}`}
            >
              <div className="flex justify-between items-start">
                <h4 className="font-medium text-sm">{notification.title}</h4>
                <span className="text-xs text-muted-foreground">{notification.time}</span>
              </div>
              <p className="text-sm mt-1 text-muted-foreground">{notification.message}</p>
              {!notification.isRead && onMarkAsRead && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs mt-2 ml-auto" 
                  onClick={() => onMarkAsRead(notification.id)}
                >
                  {t('markAsRead')}
                </Button>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default NotificationList;
