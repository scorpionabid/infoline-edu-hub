import React, { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTranslation } from "@/contexts/TranslationContext";
import NotificationList from "./NotificationList";
import { AppNotification } from "@/types/notification";

// Props interfeysi əlavə edildi
interface NotificationControlProps {
  notifications: AppNotification[];
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
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read, // Fixed: use is_read instead of isRead
  ).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <div className="absolute top-0 right-0 h-5 w-5 bg-destructive text-destructive-foreground text-xs flex items-center justify-center rounded-full transform translate-x-1 -translate-y-1">
              {unreadCount}
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <NotificationList
          notifications={notifications}
          onMarkAsRead={onMarkAsRead}
          onMarkAllAsRead={onMarkAllAsRead}
          onClearAll={onClearAll}
        />
      </PopoverContent>
    </Popover>
  );
};

export default NotificationControl;
