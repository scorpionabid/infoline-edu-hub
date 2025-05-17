
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, AlertCircle, Info, Bell, CalendarClock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { AppNotification, NotificationType, NotificationPriority } from '@/types/notification';

interface NotificationItemProps {
  notification: AppNotification;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onMarkAsRead,
  onDelete
}) => {
  const getIcon = () => {
    switch(notification.type) {
      case 'error':
        return <AlertCircle className="text-destructive" />;
      case 'success':
        return <Check className="text-success" />;
      case 'warning':
        return <AlertCircle className="text-warning" />;
      case 'deadline':
        return <CalendarClock className="text-primary" />;
      default:
        return <Info className="text-info" />;
    }
  };

  const getPriorityClass = (priority: string | undefined) => {
    if (!priority) return '';
    
    switch(priority) {
      case 'high':
        return 'border-l-4 border-orange-500';
      case 'critical':
        return 'border-l-4 border-red-500';
      case 'low':
        return 'border-l-4 border-blue-300';
      default:
        return '';
    }
  };

  const handleMarkAsRead = () => {
    if (onMarkAsRead && !notification.isRead) {
      onMarkAsRead(notification.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(notification.id);
    }
  };

  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });

  return (
    <Card 
      className={`cursor-pointer transition-all hover:bg-accent p-3 ${!notification.isRead ? 'bg-accent/50' : ''} ${getPriorityClass(notification.priority)}`}
      onClick={handleMarkAsRead}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1">
          {getIcon()}
        </div>
        <div className="flex-1">
          <h4 className="font-medium">{notification.title}</h4>
          <p className="text-sm text-muted-foreground">{notification.message}</p>
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-muted-foreground">{timeAgo}</p>
            {onDelete && (
              <Button variant="ghost" size="sm" onClick={handleDelete}>
                <Bell className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default NotificationItem;
