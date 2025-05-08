
import React from 'react';
import { AppNotification } from '@/types/notification';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, Bell, Info, Clock, X, Check } from 'lucide-react';
import { formatDistance } from 'date-fns';
import { useLanguage } from '@/context/LanguageContext';

interface NotificationItemProps {
  notification: AppNotification;
  onMarkAsRead: (id: string) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
}) => {
  const { t } = useLanguage();
  
  // Format the notification time as a relative time
  const getRelativeTime = (timestamp: string) => {
    if (!timestamp) return 'recently';
    
    try {
      return formatDistance(new Date(timestamp), new Date(), { addSuffix: true });
    } catch (error) {
      return 'recently';
    }
  };
  
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <X className="h-5 w-5 text-red-500" />;
      case 'info':
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const getPriorityClass = () => {
    if (notification.priority === 'high') {
      return 'bg-amber-50 hover:bg-amber-100';
    }
    return '';
  };
  
  return (
    <div
      className={cn(
        'flex p-3 border-b last:border-b-0 transition-colors',
        notification.isRead ? 'bg-background hover:bg-muted/40' : 'bg-muted/30 hover:bg-muted/40',
        getPriorityClass()
      )}
    >
      <div className="flex-shrink-0 mt-0.5 mr-3">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm font-medium text-foreground',
          !notification.isRead && 'font-semibold'
        )}>
          {notification.title}
        </p>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {getRelativeTime(notification.createdAt)}
        </p>
      </div>
      {!notification.isRead && (
        <Button
          variant="ghost"
          size="sm"
          className="flex-shrink-0 ml-2 h-8 w-8 p-0"
          onClick={(e) => {
            e.stopPropagation();
            onMarkAsRead(notification.id);
          }}
        >
          <span className="sr-only">{t('markAsRead')}</span>
          <Check className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default NotificationItem;
