
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  Bell 
} from 'lucide-react';

export interface NotificationsCardProps {
  title: string;
  notifications: {
    id: string;
    title: string;
    message: string;
    date: string;
    type: 'info' | 'warning' | 'success' | 'error';
    isRead: boolean;
  }[];
}

export const NotificationsCard: React.FC<NotificationsCardProps> = ({ 
  title, 
  notifications = []
}) => {
  const getIconByType = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            {title}
          </CardTitle>
          {notifications.length > 0 ? (
            <Button variant="outline" size="sm" className="text-xs">
              Hamısına bax
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-full p-0">
          <div className="space-y-2 pr-4">
            {notifications.length === 0 ? (
              <div className="text-center text-muted-foreground p-4">
                Bildirişiniz yoxdur
              </div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`py-3 border-b last:border-0 ${notification.isRead ? 'opacity-70' : ''}`}
                >
                  <div className="flex gap-3">
                    <div className="shrink-0 self-start pt-1">
                      {getIconByType(notification.type)}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        <span className="text-xs text-muted-foreground">{notification.date}</span>
                      </div>
                      <p className="text-sm line-clamp-2 text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
