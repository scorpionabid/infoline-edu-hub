
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { az } from 'date-fns/locale';
import { Notification } from '@/types/notifications';
import { useNotifications } from '@/context/NotificationContext';
import { cn } from '@/lib/utils';
import {
  Bell,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  CalendarClock
} from 'lucide-react';

interface NotificationItemProps {
  notification: Notification;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const { markAsRead } = useNotifications();
  
  const handleClick = () => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };
  
  const getIcon = () => {
    switch (notification.type) {
      case 'newCategory':
        return <Bell className="h-4 w-4" />;
      case 'deadline':
        return <CalendarClock className="h-4 w-4" />;
      case 'approvalRequest':
        return <Clock className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'systemUpdate':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'reminder':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };
  
  const getPriorityClass = () => {
    switch (notification.priority) {
      case 'high':
        return 'border-l-red-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-blue-500';
    }
  };
  
  const getTimeAgo = () => {
    return formatDistanceToNow(notification.createdAt, {
      addSuffix: true,
      locale: az
    });
  };
  
  return (
    <div 
      className={cn(
        "p-3 border-l-4 bg-card rounded-md cursor-pointer hover:bg-accent/50 transition-colors flex gap-3",
        getPriorityClass(),
        !notification.isRead && "bg-accent/20"
      )}
      onClick={handleClick}
    >
      <div className="mt-0.5">{getIcon()}</div>
      <div className="flex-1">
        <div className="font-medium line-clamp-1">{notification.title}</div>
        <div className="text-sm text-muted-foreground line-clamp-2">{notification.message}</div>
        <div className="text-xs text-muted-foreground mt-1">{getTimeAgo()}</div>
      </div>
    </div>
  );
};
