
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NotificationsCardProps } from '@/types/dashboard';
import { cn } from '@/lib/utils';

export const NotificationsCard = ({
  notifications,
  title,
  maxNotifications = 5
}: NotificationsCardProps) => {
  // Bildirişlərin tipinə görə rəngini təyin etmə
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'warning': return 'border-l-amber-500 bg-amber-50';
      case 'error': return 'border-l-red-500 bg-red-50';
      case 'success': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-blue-500 bg-blue-50';
    }
  };

  // Məhdud sayda bildiriş göstər
  const limitedNotifications = notifications.slice(0, maxNotifications);

  return (
    <Card className="col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {limitedNotifications.length > 0 ? (
            limitedNotifications.map(notification => (
              <div 
                key={notification.id} 
                className={cn(
                  'p-3 border-l-4 rounded shadow-sm', 
                  getNotificationColor(notification.type),
                  notification.isRead ? 'opacity-70' : 'opacity-100'
                )}
              >
                <h4 className="font-medium">{notification.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>{notification.date}</span>
                  {!notification.isRead && <span className="font-medium text-blue-600">Yeni</span>}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              Bildiriş yoxdur
            </div>
          )}
          
          {notifications.length > maxNotifications && (
            <div className="text-center">
              <button className="text-sm text-primary hover:underline">
                Bütün bildirişləri göstər ({notifications.length})
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationsCard;
