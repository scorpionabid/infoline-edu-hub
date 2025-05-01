
import React from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, Info, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface NotificationsCardProps {
  notifications: {
    id: string;
    title: string;
    message?: string;
    date: string;
    type?: string;
    isRead?: boolean;
  }[];
  title: string;
}

const NotificationsCard: React.FC<NotificationsCardProps> = ({ 
  notifications,
  title 
}) => {
  // Bildirişin tip ikonunu təyin edirik
  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'error':
        return <X className="h-4 w-4 text-red-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  // Tarixi formatlayırıq
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('az-AZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className="shadow-sm h-full">
      <CardContent className="p-5">
        <CardTitle className="text-md font-medium mb-3 flex justify-between items-center">
          {title}
          <Button variant="ghost" size="sm" className="h-7 px-2">
            Hamısına bax
          </Button>
        </CardTitle>
        
        {notifications && notifications.length > 0 ? (
          <ScrollArea className="h-[350px] pr-4">
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={cn(
                    "p-3 border rounded-md",
                    !notification.isRead && "bg-muted/50 border-primary/20",
                    notification.isRead && "bg-card"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{notification.title}</p>
                      {notification.message && (
                        <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">{formatDate(notification.date)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center h-[350px] text-muted-foreground">
            <Bell className="h-10 w-10 mb-2 opacity-20" />
            <p>Yeni bildiriş yoxdur</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationsCard;
