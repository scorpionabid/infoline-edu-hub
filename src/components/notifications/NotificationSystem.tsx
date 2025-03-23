
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Notification } from '@/components/dashboard/NotificationsCard';
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
import NotificationItem from '@/components/dashboard/NotificationItem';
import { cn } from '@/lib/utils';

// Demo bildirişlər
const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    type: 'deadline',
    title: 'Son tarix yaxınlaşır',
    message: 'Ümumi məlumatlar kateqoriyası üçün son tarixə 2 gün qalıb',
    time: '1 saat əvvəl'
  },
  {
    id: 2,
    type: 'approval',
    title: 'Məlumatlar təsdiqləndi',
    message: 'Müəllim heyəti kateqoriyası üzrə məlumatlarınız təsdiqləndi',
    time: '3 saat əvvəl'
  },
  {
    id: 3,
    type: 'rejection',
    title: 'Məlumatlar rədd edildi',
    message: 'Şagird kontingenti məlumatları düzəliş tələb edir',
    time: '1 gün əvvəl'
  },
  {
    id: 4,
    type: 'system',
    title: 'Sistem yeniləndi',
    message: 'Sistem v1.2 versiyasına yeniləndi, yeni funksiyalar əlavə edildi',
    time: '2 gün əvvəl'
  },
  {
    id: 5,
    type: 'category',
    title: 'Yeni kateqoriya',
    message: 'Dərs saatları kateqoriyası əlavə edildi',
    time: '3 gün əvvəl'
  }
];

const NotificationSystem = () => {
  const { t } = useLanguageSafe();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>(DEMO_NOTIFICATIONS);
  const [unreadCount, setUnreadCount] = useState<number>(3);
  
  // Demo məqsədilə bildiriş oxunma statusunu simulyasiya edirik
  const markAllAsRead = () => {
    setUnreadCount(0);
    // Gerçək tətbiqdə burada API çağırışı olacaq
  };
  
  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
    // Gerçək tətbiqdə burada API çağırışı olacaq
  };
  
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
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                >
                  <Check className="h-4 w-4 mr-1" />
                  <span className="text-xs">{t('markAllAsRead')}</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearAllNotifications}
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
                    notification.id <= unreadCount ? "bg-muted/50" : ""
                  )}
                >
                  <NotificationItem notification={notification} />
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
