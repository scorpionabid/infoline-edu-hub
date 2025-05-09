
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppNotification, NotificationsCardProps } from '@/types/notification';

const NotificationItem: React.FC<{
  notification: AppNotification;
  onMarkAsRead?: (id: string) => void;
}> = ({ notification, onMarkAsRead }) => {
  const typeToIcon = {
    info: <Bell className="h-4 w-4 text-blue-500" />,
    warning: <Bell className="h-4 w-4 text-yellow-500" />,
    error: <Bell className="h-4 w-4 text-red-500" />,
    success: <Bell className="h-4 w-4 text-green-500" />,
    system: <Bell className="h-4 w-4 text-purple-500" />,
    approval: <Bell className="h-4 w-4 text-amber-500" />,
    deadline: <Bell className="h-4 w-4 text-rose-500" />
  };
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return 'Unknown date';
    }
  };

  return (
    <div className={`mb-3 p-3 rounded-md ${notification.isRead ? 'bg-muted/50' : 'bg-muted'}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2">
          <div className="mt-0.5">{typeToIcon[notification.type] || <Bell className="h-4 w-4" />}</div>
          <div>
            <h4 className="text-sm font-medium">{notification.title}</h4>
            <p className="text-xs text-muted-foreground">{notification.message}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDate(notification.createdAt)}
            </p>
          </div>
        </div>
        
        {!notification.isRead && onMarkAsRead && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => onMarkAsRead(notification.id)}
          >
            <Check className="h-4 w-4" />
            <span className="sr-only">Mark as read</span>
          </Button>
        )}
      </div>
    </div>
  );
};

const NotificationsCard: React.FC<NotificationsCardProps> = ({ 
  title, 
  notifications, 
  onMarkAsRead 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p>No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem 
                key={notification.id} 
                notification={notification} 
                onMarkAsRead={onMarkAsRead}
              />
            ))
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default NotificationsCard;
