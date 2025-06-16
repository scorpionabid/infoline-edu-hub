import React from "react";
import { AppNotification } from "@/types/notification";
import NotificationItem from "./NotificationItem";
import { useTranslation } from "@/contexts/TranslationContext";
import { Button } from "@/components/ui/button";
import { BellOff } from "lucide-react";

interface NotificationListProps {
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
}) => {
  const { t } = useTranslation();

  if (notifications.length === 0) {
    return (
      <div className="p-6 text-center">
        <BellOff className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-2 text-base font-semibold text-foreground">
          {t("noNotifications")}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("noNotificationsDesc")}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between p-4">
        <Button variant="outline" size="sm" onClick={onMarkAllAsRead}>
          {t("markAllAsRead")}
        </Button>
        <Button variant="outline" size="sm" onClick={onClearAll}>
          {t("clearAll")}
        </Button>
      </div>

      <div className="max-h-[400px] overflow-y-auto p-4">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={onMarkAsRead}
          />
        ))}
      </div>
    </div>
  );
};

export default NotificationList;
