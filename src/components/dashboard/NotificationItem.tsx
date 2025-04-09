
import React from 'react';
import { format } from 'date-fns';
import { Bell, Check, X, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Notification, NotificationType } from '@/types/notification';

export interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkAsRead }) => {
  // Get icon based on notification type
  const getIcon = () => {
    switch (notification.type) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <X className="h-5 w-5 text-destructive" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'system':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'category':
        return <Bell className="h-5 w-5 text-purple-500" />;
      case 'deadline':
        return <Bell className="h-5 w-5 text-amber-500" />;
      case 'approval':
        return <Check className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  // Format date
  const formattedDate = notification.createdAt 
    ? format(new Date(notification.createdAt), 'MMM d, HH:mm')
    : notification.time 
      ? format(new Date(notification.time), 'MMM d, HH:mm')
      : '';

  return (
    <div className={cn(
      "flex items-start gap-3 rounded-lg p-3 transition-colors",
      notification.isRead ? "opacity-70" : "bg-muted/50",
      "hover:bg-muted"
    )}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background">
        {getIcon()}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">
            {notification.title}
          </h4>
          <div className="flex items-center gap-2">
            <time className="text-xs text-muted-foreground">{formattedDate}</time>
            {!notification.isRead && onMarkAsRead && (
              <button 
                onClick={() => onMarkAsRead(notification.id)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                <Check className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        {notification.message && (
          <p className="text-sm text-muted-foreground">{notification.message}</p>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;
