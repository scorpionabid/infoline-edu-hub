
import React from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useLanguageSafe } from '@/context/LanguageContext';
import { Bell, BellOff, Check } from 'lucide-react';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NotificationItem } from './NotificationItem';
import { cn } from '@/lib/utils';
import { AppNotification } from '@/types/notification';

const NotificationSystem = () => {
  const { t } = useLanguageSafe();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearAll 
  } = useNotifications();
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={t('notifications')}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-rose-500 text-white text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <div className="font-semibold">{t('notifications')}</div>
          <div className="flex gap-2">
            {notifications.length > 0 && (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => markAllAsRead()}
                  disabled={unreadCount === 0}
                >
                  <Check className="h-4 w-4 mr-1" />
                  <span className="text-xs">{t('markAllAsRead')}</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => clearAll()}
                >
                  <BellOff className="h-4 w-4 mr-1" />
                  <span className="text-xs">{t('clearAll')}</span>
                </Button>
              </>
            )}
          </div>
        </div>
        
        <ScrollArea className="h-[300px]">
          {notifications.length > 0 ? (
            <div className="py-1">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={cn(
                    "hover:bg-muted transition-colors",
                    !notification.isRead ? "bg-muted/50" : ""
                  )}
                >
                  <NotificationItem 
                    notification={notification} 
                    onMarkAsRead={markAsRead}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full p-4 text-center text-muted-foreground">
              {t('noNotifications')}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationSystem;
