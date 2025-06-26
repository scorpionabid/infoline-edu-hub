import React from "react";
import { formatDistanceToNow } from "date-fns";
import { az } from "date-fns/locale";
import { CheckCircle, AlertTriangle, Info, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AppNotification } from "@/types/notification";

interface NotificationItemProps {
  notification: AppNotification;
  onMarkAsRead: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
}) => {
  const getIcon = () => {
    switch (notification.type) {
      case "success": {
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning": {
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "error": {
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div
      className={cn(
        "px-4 py-3 border-b last:border-none relative",
        notification.is_read ? "bg-muted/50" : "bg-background hover:bg-muted/20",
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="shrink-0">{getIcon()}</div>
          <div className="space-y-1">
            <p className="text-sm font-medium">{notification.title}</p>
            {notification.message && (
              <p className="text-sm text-muted-foreground">
                {notification.message}
              </p>
            )}
          </div>
        </div>
        {!notification.is_read && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMarkAsRead(notification.id)}
            className="absolute top-2 right-2"
          >
            Oxundu kimi qeyd et
          </Button>
        )}
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(notification.created_at), {
            addSuffix: true,
            locale: az
          })}
        </span>
      </div>
    </div>
  );
};

export default NotificationItem;
