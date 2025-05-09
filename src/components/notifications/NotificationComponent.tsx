
import React, { useState } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { NotificationItem } from './NotificationItem'; 
import { useLanguage } from '@/context/LanguageContext';
import { useNotifications, NotificationContextType } from '@/hooks/useNotifications';
import { AppNotification } from '@/types/notification';

export const NotificationComponent: React.FC = () => {
  const { t } = useLanguage();
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead,
    markAllAsRead, 
    clearAll 
  } = useNotifications();

  const [open, setOpen] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleClearAll = async () => {
    await clearAll();
    setOpen(false);
  };

  const renderNotifications = () => {
    if (loading) {
      return <div className="p-4 text-center text-muted-foreground">{t('loading')}</div>;
    }

    if (notifications.length === 0) {
      return (
        <div className="p-6 text-center">
          <p className="text-xl font-semibold mb-2">{t('noNotifications')}</p>
          <p className="text-sm text-muted-foreground">{t('noNotificationsDesc')}</p>
        </div>
      );
    }

    return (
      <ScrollArea className="h-[300px]">
        <div className="space-y-2 p-2">
          {notifications.map((notification) => (
            <NotificationItem 
              key={notification.id} 
              notification={notification}
              onMarkAsRead={markAsRead}
            />
          ))}
        </div>
      </ScrollArea>
    );
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0" align="end">
        <div className="p-4 flex items-center justify-between">
          <h3 className="font-semibold">{t('notifications')}</h3>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleMarkAllAsRead}
              disabled={notifications.length === 0 || notifications.every(n => n.isRead)}
              title={t('markAllAsRead')}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleClearAll}
              disabled={notifications.length === 0}
              title={t('clearAll')}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Separator />
        {renderNotifications()}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationComponent;
