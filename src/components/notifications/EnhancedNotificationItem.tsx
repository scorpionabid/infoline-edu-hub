
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  XCircle, 
  Trash2, 
  Eye,
  Calendar
} from 'lucide-react';
import { AppNotification, NotificationType, NotificationPriority } from '@/types/notification';
import { formatDistanceToNow } from 'date-fns';
import { az } from 'date-fns/locale';

interface EnhancedNotificationItemProps {
  notification: AppNotification;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (notification: AppNotification) => void;
  showActions?: boolean;
  compact?: boolean;
}

const EnhancedNotificationItem: React.FC<EnhancedNotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  onClick,
  showActions = true,
  compact = false
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: az 
      });
    } catch (error) {
      return 'Bilinmir';
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick(notification);
    } else if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(notification.id);
    }
  };

  if (compact) {
    return (
      <div
        className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
          !notification.isRead ? 'bg-blue-50 border-blue-200' : 'bg-background border-border'
        }`}
        onClick={handleClick}
      >
        <div className="flex-shrink-0">
          {getIcon(notification.type || 'info')}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${
            !notification.isRead ? 'text-foreground' : 'text-muted-foreground'
          }`}>
            {notification.title}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatTimeAgo(notification.createdAt)}
          </p>
        </div>
        {!notification.isRead && (
          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
        )}
      </div>
    );
  }

  return (
    <Card className={`cursor-pointer transition-all hover:shadow-md ${
      !notification.isRead ? 'ring-2 ring-blue-200 bg-blue-50/50' : ''
    }`}>
      <CardContent className="p-4" onClick={handleClick}>
        <div className="flex items-start justify-between space-x-3">
          <div className="flex space-x-3 flex-1">
            <div className="flex-shrink-0 mt-1">
              {getIcon(notification.type || 'info')}
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className={`font-medium ${
                  !notification.isRead ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {notification.title}
                </h4>
                <div className="flex items-center space-x-2">
                  {notification.priority && notification.priority !== 'normal' && (
                    <Badge variant="outline" className={getPriorityColor(notification.priority)}>
                      {notification.priority}
                    </Badge>
                  )}
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </div>
              </div>
              
              {(notification.message || notification.description) && (
                <p className="text-sm text-muted-foreground">
                  {notification.message || notification.description}
                </p>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{formatTimeAgo(notification.createdAt)}</span>
                </div>
                
                {showActions && (
                  <div className="flex items-center space-x-1">
                    {!notification.isRead && onMarkAsRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleMarkAsRead}
                        className="h-8 w-8 p-0"
                        title="Oxundu olaraq işarələ"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDelete}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        title="Sil"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedNotificationItem;
