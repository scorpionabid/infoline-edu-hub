
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface NotificationItem {
  id: string;
  title: string;
  message?: string;
  date: string;
  type?: string;
  isRead?: boolean;
}

export interface NotificationsCardProps {
  notifications: NotificationItem[];
  title?: string;
  viewAllLink?: string;
  onViewAll?: () => void;
  onNotificationClick?: (notification: NotificationItem) => void;
  className?: string;
  maxItems?: number;
}

export const NotificationsCard: React.FC<NotificationsCardProps> = ({
  notifications,
  title = "Bildirişlər",
  viewAllLink,
  onViewAll,
  onNotificationClick,
  className,
  maxItems = 5
}) => {
  const displayedNotifications = notifications.slice(0, maxItems);
  
  const getNotificationTypeClass = (type?: string) => {
    switch(type) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'info': 
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Card className={cn("shadow-sm", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {displayedNotifications.length > 0 ? (
          <div className="space-y-4">
            {displayedNotifications.map(notification => (
              <div 
                key={notification.id}
                className={cn(
                  "p-3 rounded-lg border",
                  notification.isRead ? "bg-background" : "bg-muted/20"
                )}
                onClick={() => onNotificationClick && onNotificationClick(notification)}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="font-medium">{notification.title}</div>
                  {notification.type && (
                    <Badge className={getNotificationTypeClass(notification.type)}>
                      {notification.type}
                    </Badge>
                  )}
                </div>
                {notification.message && (
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                )}
                <div className="text-xs text-muted-foreground mt-2">{notification.date}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <p>Bildiriş yoxdur</p>
          </div>
        )}
        
        {(viewAllLink || onViewAll) && notifications.length > 0 && (
          <div className="mt-4 text-center">
            {viewAllLink ? (
              <Button variant="ghost" size="sm" asChild>
                <a href={viewAllLink}>Hamısına bax</a>
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={onViewAll}>
                Hamısına bax
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
