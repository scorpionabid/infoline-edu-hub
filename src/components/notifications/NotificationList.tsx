
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Notification } from '@/types/notification';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, Trash2 } from 'lucide-react';
import NotificationItem from './NotificationItem';

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
}

const NotificationList: React.FC<NotificationListProps> = ({ 
  notifications, 
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll
}) => {
  const { t } = useLanguage();
  
  return (
    <div className="flex flex-col h-full max-h-[450px]">
      <div className="flex items-center justify-between p-3 border-b">
        <div className="font-semibold">{t('notifications')}</div>
        <div className="flex gap-2">
          {notifications.length > 0 && (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onMarkAllAsRead} 
                className="h-8 px-2 text-xs"
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                {t('markAllAsRead')}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClearAll} 
                className="h-8 px-2 text-xs"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                {t('clearAll')}
              </Button>
            </>
          )}
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        {notifications.length > 0 ? (
          <div className="divide-y">
            {notifications.map((notification) => (
              <NotificationItem 
                key={notification.id} 
                notification={notification} 
                onMarkAsRead={onMarkAsRead}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full p-4 text-center text-muted-foreground">
            <div>
              <p>{t('noNotifications')}</p>
              <p className="text-xs mt-1">{t('noNotificationsDesc')}</p>
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default NotificationList;
