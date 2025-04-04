
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Notification } from '@/types/notification';
import {
  AlertCircle,
  Bell,
  CheckCircle,
  InfoIcon,
  XCircle,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface NotificationListProps {
  notifications: Notification[];
}

const NotificationList: React.FC<NotificationListProps> = ({ notifications }) => {
  const { t } = useLanguage();

  if (!notifications || notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <Bell className="h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-2 text-base font-semibold text-foreground">
          {t('noNotifications')}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {t('notificationsEmptyMessage')}
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="max-h-[300px]">
      <div className="space-y-4 p-4">
        {notifications.map((notification) => (
          <div 
            key={notification.id} 
            className={`flex items-start gap-4 p-3 rounded-md border ${notification.isRead ? 'opacity-70' : 'border-primary/50 bg-primary/5'}`}
          >
            <div className="mt-1">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{notification.title}</p>
                <Badge variant="outline" className="text-xs">
                  {notification.time}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {notification.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

function getNotificationIcon(type: string) {
  switch (type) {
    case 'success':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'error':
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'warning':
      return <AlertCircle className="h-5 w-5 text-amber-500" />;
    case 'info':
    default:
      return <InfoIcon className="h-5 w-5 text-blue-500" />;
  }
}

export default NotificationList;
