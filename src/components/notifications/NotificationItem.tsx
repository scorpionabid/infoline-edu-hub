
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { az } from 'date-fns/locale';
import {
  BellRing, 
  CalendarClock, 
  CheckCircle, 
  XCircle, 
  Info, 
  AlertTriangle, 
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Notification, NotificationType } from '@/types/notification';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkAsRead }) => {
  const renderIcon = () => {
    switch (notification.type) {
      case 'category':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'deadline':
        return <CalendarClock className="h-5 w-5 text-orange-500" />;
      case 'approval':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'system':
        return <Info className="h-5 w-5 text-indigo-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <BellRing className="h-5 w-5 text-slate-500" />;
    }
  };

  const formatTime = (time?: string) => {
    if (!time) return '';
    
    try {
      return formatDistanceToNow(new Date(time), { addSuffix: true, locale: az });
    } catch (error) {
      console.error('Tarix formatı xətası:', error);
      return time;
    }
  };

  const handleRead = () => {
    if (onMarkAsRead && !notification.isRead) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <div 
      onClick={handleRead}
      className={cn(
        "flex items-start p-3 gap-3 border-b border-border transition-colors cursor-pointer",
        !notification.isRead ? "bg-accent/30 hover:bg-accent/50" : "hover:bg-muted"
      )}
    >
      <div className="flex-shrink-0 mt-0.5">
        {renderIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm font-medium",
          !notification.isRead && "font-semibold"
        )}>
          {notification.title}
        </p>
        {notification.message && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {notification.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {formatTime(notification.createdAt || notification.time)}
        </p>
      </div>
      {!notification.isRead && (
        <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0"></div>
      )}
    </div>
  );
};

export default NotificationItem;
