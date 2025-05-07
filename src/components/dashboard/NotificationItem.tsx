
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/utils/formatters";
import { AppNotification } from '@/types/notification';
import { Eye, BellRing } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  notification: AppNotification;
  onMarkAsRead?: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkAsRead }) => {
  const getTypeIcon = () => {
    switch (notification.type) {
      case 'warning':
        return <span className="text-amber-500">⚠️</span>;
      case 'error':
        return <span className="text-destructive">❌</span>;
      case 'success':
        return <span className="text-green-500">✓</span>;
      case 'deadline':
        return <span className="text-amber-500">⏰</span>;
      case 'approval':
        return <span className="text-blue-500">👍</span>;
      case 'category':
        return <span className="text-indigo-500">📋</span>;
      case 'system':
        return <span className="text-gray-500">🔧</span>;
      case 'info':
      default:
        return <span className="text-blue-500">ℹ️</span>;
    }
  };
  
  const getTypeClass = () => {
    switch (notification.type) {
      case 'warning':
        return "border-l-4 border-l-amber-500";
      case 'error':
        return "border-l-4 border-l-destructive";
      case 'success':
        return "border-l-4 border-l-green-500";
      case 'deadline':
        return "border-l-4 border-l-amber-500";
      case 'approval':
        return "border-l-4 border-l-blue-500";
      case 'category':
        return "border-l-4 border-l-indigo-500";
      case 'system':
        return "border-l-4 border-l-gray-500";
      case 'info':
      default:
        return "border-l-4 border-l-blue-500";
    }
  };
  
  const getPriorityClass = () => {
    switch (notification.priority) {
      case 'high':
        return "bg-orange-50 dark:bg-orange-900/20";
      case 'critical':
        return "bg-red-50 dark:bg-red-900/20";
      case 'normal':
      default:
        return "";
    }
  };
  
  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };
  
  const isRead = notification.read || notification.isRead;
  
  return (
    <Card className={cn(
      "mb-3 transition-all hover:shadow-md cursor-pointer",
      getTypeClass(),
      getPriorityClass(),
      !isRead ? "bg-primary-foreground/50" : ""
    )}>
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <div className="flex-shrink-0 mt-1">
            {getTypeIcon()}
          </div>
          <div className="flex-grow">
            <div className="text-sm font-medium">
              {notification.title}
              {!isRead && <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-blue-600"></span>}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
            <div className="flex items-center justify-between text-xs mt-2 text-muted-foreground">
              <span>{formatDate(notification.date)}</span>
              {!isRead && onMarkAsRead && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={handleMarkAsRead}
                  className="h-6 px-2 text-xs"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Oxundu
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationItem;
