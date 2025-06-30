import React from 'react';
import { Bell, Check, X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from '@/contexts/TranslationContext';
import { useNotificationContext } from '@/components/notifications/NotificationProvider';
import { cn } from '@/lib/utils';

const NotificationBell: React.FC = () => {
  const { t } = useTranslation();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    removeNotification,
    isLoading 
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
      if (diffInDays < 7) return `${diffInDays} gün əvvəl`;
      return date.toLocaleDateString('az-AZ', {
        day: 'numeric',
        month: 'short'
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-9 w-9 min-h-[44px] min-w-[44px] touch-manipulation"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">
            {t("notifications.title") || "Bildirişlər"} ({unreadCount})
          </span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <h3 className="font-semibold">
            {t("notifications.title") || "Bildirişlər"}
          </h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-8 px-2 text-xs"
              disabled={isLoading}
            >
              <Check className="h-3 w-3 mr-1" />
              {t("notifications.markAllRead") || "Hamısını oxu"}
            </Button>
          )}
        </div>
        
        <DropdownMenuSeparator />
        
        {/* Notifications List */}
        <ScrollArea className="h-96">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
              {t("notifications.loading") || "Yüklənir..."}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              {t("notifications.empty") || "Bildiriş yoxdur"}
            </div>
          ) : (
            <div className="p-1">
              {notifications.slice(0, 20).map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    "flex flex-col items-start p-3 cursor-pointer focus:bg-accent border-l-4 mb-1 rounded-r",
                    getNotificationColor(notification.type, notification.is_read),
                    !notification.is_read && "bg-accent/30"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex w-full items-start justify-between">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "font-medium text-sm leading-tight line-clamp-2",
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
                    
                    <div className="flex items-center gap-1 ml-2">
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
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
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {/* Footer */}
        {notifications.length > 20 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button variant="ghost" className="w-full text-sm" asChild>
                <a href="/notifications">
                  {t("notifications.viewAll") || `Hamısına bax (${notifications.length})`}
                </a>
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;