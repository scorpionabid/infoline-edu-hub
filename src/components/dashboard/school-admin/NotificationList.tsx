
import React from 'react';
import { AlertCircle, Bell } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface NotificationProps {
  id: string;
  title: string;
  message?: string;
  date?: string;
  read?: boolean;
  type?: string;
}

export const NotificationList: React.FC<{
  notifications: NotificationProps[];
}> = ({ notifications = [] }) => {
  return (
    <div>
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
          <Bell className="h-8 w-8 mb-2 text-muted-foreground" />
          <p>Bildiriş yoxdur</p>
        </div>
      ) : (
        <ScrollArea className="h-60">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                'flex items-start gap-3 p-3 border-b last:border-0',
                !notification.read && 'bg-muted/30'
              )}
            >
              <div 
                className={cn(
                  'p-1 rounded-full',
                  notification.type === 'warning' && 'bg-amber-100',
                  notification.type === 'error' && 'bg-red-100',
                  notification.type === 'success' && 'bg-green-100',
                  notification.type === 'info' && 'bg-blue-100',
                )}
              >
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between">
                  <p className="text-sm font-medium">{notification.title}</p>
                  {notification.date && (
                    <span className="text-xs text-muted-foreground">{notification.date}</span>
                  )}
                </div>
                {notification.message && (
                  <p className="text-xs text-muted-foreground">{notification.message}</p>
                )}
              </div>
            </div>
          ))}
        </ScrollArea>
      )}
    </div>
  );
};
