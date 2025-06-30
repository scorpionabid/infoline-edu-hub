import React from 'react';
import { Bell, X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNotificationContext } from '@/components/notifications/NotificationProvider';
import { cn } from '@/lib/utils';

export const NotificationSystem: React.FC = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    removeNotification
  } = useNotificationContext();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
      case 'approval':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      
      case 'warning':
      case 'deadline':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      
      case 'error':
      case 'rejection':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getNotificationColor = (type: string, isRead: boolean) => {
    const baseOpacity = isRead ? 'opacity-60' : '';
    switch (type) {
      case 'success':
      case 'approval':
        return `border-l-green-500 ${baseOpacity}`;
      case 'warning':
      case 'deadline':
        return `border-l-yellow-500 ${baseOpacity}`;
      case 'error':
      case 'rejection':
        return `border-l-red-500 ${baseOpacity}`;
      default:
        return `border-l-blue-500 ${baseOpacity}`;
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return diffInMinutes <= 1 ? 'İndi' : `${diffInMinutes} dəqiqə əvvəl`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} saat əvvəl`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays === 1) return 'Dünən';
      return date.toLocaleDateString('az-AZ');
    }
  };

  if (error) {
    return (
      <Button variant="ghost" size="sm" className="relative">
        <Bell className="h-4 w-4" />
        <span className="sr-only">Xəta</span>
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center animate-pulse"
              variant="destructive"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">
            {unreadCount > 0 ? `${unreadCount} oxunmamış bildiriş` : 'Bildirişlər'}
          </span>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Bildirişlər</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
              disabled={isLoading}
            >
              Hamısını oxunmuş kimi işarələ
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-96">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
              Yüklənir...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              Bildiriş yoxdur
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={cn(
                    "border-0 border-l-4 rounded-none cursor-pointer hover:bg-muted/50 transition-colors",
                    getNotificationColor(notification.type, notification.is_read),
                    !notification.is_read && "bg-muted/30"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-sm font-medium truncate",
                            !notification.is_read && "font-semibold"
                          )}>
                            {notification.title}
                          </p>
                          {notification.message && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-muted-foreground">
                              {formatDate(notification.created_at)}
                            </p>
                            {notification.priority === 'high' && (
                              <Badge variant="destructive" className="text-xs ml-2">
                                Təcili
                              </Badge>
                            )}
                            {notification.priority === 'critical' && (
                              <Badge variant="destructive" className="text-xs ml-2 animate-pulse">
                                Kritik
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Sil</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationSystem;