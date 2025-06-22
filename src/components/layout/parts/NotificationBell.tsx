import React, { useState } from 'react';
import { Bell, Check, X } from 'lucide-react';
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
import { useNotifications } from '@/hooks/notifications/useNotifications';
import { cn } from '@/lib/utils';

const NotificationBell: React.FC = () => {
  const { t } = useTranslation();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    isLoading 
  } = useNotifications();

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
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">
            {t("notifications") || "Bildirişlər"} ({unreadCount})
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
              {t("notifications.loading") || "Yüklənir..."}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {t("notifications.empty") || "Bildiriş yoxdur"}
            </div>
          ) : (
            <div className="p-1">
              {notifications.slice(0, 10).map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    "flex flex-col items-start p-3 cursor-pointer focus:bg-accent",
                    !notification.is_read && "bg-accent/50"
                  )}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex w-full items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm leading-tight">
                        {notification.title}
                      </p>
                      {notification.message && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.created_at).toLocaleDateString('az-AZ', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    
                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-primary rounded-full mt-1 ml-2 flex-shrink-0" />
                    )}
                  </div>
                  
                  {/* Priority indicator */}
                  {notification.priority === 'high' && (
                    <div className="w-full mt-2">
                      <Badge variant="destructive" className="text-xs">
                        {t("notifications.highPriority") || "Yüksək prioritet"}
                      </Badge>
                    </div>
                  )}
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {/* Footer */}
        {notifications.length > 10 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button variant="ghost" className="w-full text-sm" asChild>
                <a href="/notifications">
                  {t("notifications.viewAll") || "Hamısına bax"}
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