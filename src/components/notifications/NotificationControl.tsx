
import React, { useState } from 'react';
import { Notification } from '@/types/notification';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import NotificationList from './NotificationList';

interface NotificationControlProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
}

const NotificationControl: React.FC<NotificationControlProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
}) => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <h4 className="font-semibold">{t('notifications')}</h4>
        </div>
        <NotificationList 
          notifications={notifications}
          onMarkAsRead={(id) => {
            onMarkAsRead(id);
          }}
          onMarkAllAsRead={onMarkAllAsRead}
          onClearAll={onClearAll}
        />
      </PopoverContent>
    </Popover>
  );
};

export default NotificationControl;
