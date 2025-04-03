
import React from 'react';
import { Notification, NotificationType } from '@/types/notification';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { formatDistanceToNow } from 'date-fns';
import { az } from 'date-fns/locale';
import {
  Bell,
  Calendar,
  CheckCircle,
  XCircle,
  Info,
  AlertTriangle,
  File
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
}) => {
  const { t } = useLanguage();

  const getIcon = (type: string) => {
    switch (type) {
      case 'newCategory':
        return <File className="h-5 w-5 text-blue-500" />;
      case 'deadline':
        return <Calendar className="h-5 w-5 text-orange-500" />;
      case 'approval':
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejection':
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'system':
        return <Info className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityClass = () => {
    switch (notification.priority) {
      case 'critical':
        return 'border-l-4 border-red-500';
      case 'high':
        return 'border-l-4 border-orange-500';
      default:
        return 'border-l-4 border-blue-500';
    }
  };

  return (
    <div 
      className={cn(
        "p-4 mb-2 bg-background rounded-lg shadow-sm flex items-start space-x-4",
        !notification.isRead ? "bg-muted/30" : "",
        getPriorityClass()
      )}
    >
      <div className="flex-shrink-0 mt-1">
        {getIcon(notification.type)}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between">
          <p className="text-sm font-semibold text-foreground">
            {notification.title}
          </p>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
              locale: az
            })}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {notification.message}
        </p>
        
        {!notification.isRead && (
          <div className="mt-2 flex justify-end">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onMarkAsRead(notification.id)}
              className="text-xs"
            >
              {t('markAsRead')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;
