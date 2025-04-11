
import React from 'react';
import { Notification } from '@/types/notification';
import { 
  Bell, 
  Info, 
  AlertTriangle, 
  CheckCircle, 
  Calendar, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onMarkAsRead
}) => {
  const { id, title, message, type, isRead } = notification;
  
  const handleClick = () => {
    if (!isRead) {
      onMarkAsRead(id);
    }
  };
  
  const getIcon = () => {
    switch (type) {
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'deadline':
        return <Calendar className="h-4 w-4 text-purple-500" />;
      case 'category':
        return <FileText className="h-4 w-4 text-indigo-500" />;
      default:
        return <Bell className="h-4 w-4 text-slate-500" />;
    }
  };
  
  const getTypeClass = () => {
    switch (type) {
      case 'info':
        return 'border-l-blue-500';
      case 'warning':
        return 'border-l-amber-500';
      case 'success':
        return 'border-l-green-500';
      case 'error':
        return 'border-l-red-500';
      case 'deadline':
        return 'border-l-purple-500';
      case 'category':
        return 'border-l-indigo-500';
      default:
        return 'border-l-slate-500';
    }
  };
  
  // Zaman formatlandırma
  const notificationTime = notification.time || (notification.created_at ? 
    new Date(notification.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 
    '');
  
  return (
    <div 
      className={cn(
        "p-3 cursor-pointer transition-colors border-l-2",
        getTypeClass(),
        !isRead ? "bg-blue-50 dark:bg-blue-950/10" : ""
      )}
      onClick={handleClick}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-1">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium line-clamp-1">{title}</p>
          
          {message && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
              {message}
            </p>
          )}
          
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              {notificationTime}
            </span>
            {!isRead && (
              <span className="flex h-2 w-2 rounded-full bg-blue-500"></span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
