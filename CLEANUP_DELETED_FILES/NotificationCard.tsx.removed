import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: "info" | "warning" | "success" | "error";
}

interface NotificationCardProps {
  maxItems?: number;
}

const NotificationCard = ({ maxItems = 3 }: NotificationCardProps) => {
  // Mock notification data for initial implementation
  // In production, this would come from an API or context
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Yeni məlumatlar əlavə edildi",
      message: "Region 5 üçün yeni məlumatlar sistem tərəfindən əlavə edildi",
      date: "2025-06-26T10:30:00",
      read: false,
      type: "info"
    },
    {
      id: "2",
      title: "Təsdiq gözləyən məlumatlar",
      message: "3 məktəb üçün məlumatların təsdiqlənməsi tələb olunur",
      date: "2025-06-25T16:45:00",
      read: true,
      type: "warning"
    },
    {
      id: "3",
      title: "Sistem yeniləməsi",
      message: "Sistem texniki xidmət üçün sabah 22:00-da müvəqqəti olaraq əlçatmaz olacaq",
      date: "2025-06-24T09:15:00",
      read: false,
      type: "error"
    }
  ]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('az-AZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">Bildirişlər</CardTitle>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-gray-500" />
            {unreadCount > 0 && (
              <Badge variant="destructive" className="h-5 min-w-[20px] flex items-center justify-center">
                {unreadCount}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[280px] pr-4">
          {notifications.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-6">Bildiriş yoxdur</p>
          ) : (
            <div className="space-y-4">
              {notifications.slice(0, maxItems).map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-3 rounded-md border ${!notification.read ? 'bg-slate-50' : ''}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex justify-between">
                    <h4 className="text-sm font-medium">{notification.title}</h4>
                    <Badge 
                      variant={
                        notification.type === "error" ? "destructive" : 
                        notification.type === "warning" ? "outline" :
                        notification.type === "success" ? "default" : 
                        "secondary"
                      }
                      className="text-xs"
                    >
                      {notification.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-400">{formatDate(notification.date)}</span>
                    {!notification.read && <span className="h-2 w-2 rounded-full bg-blue-500"></span>}
                  </div>
                </div>
              ))}
              {notifications.length > maxItems && (
                <button 
                  className="text-xs text-blue-600 hover:underline w-full text-center pt-2"
                  onClick={() => console.log("Show all notifications")}
                >
                  Bütün bildirişləri göstər ({notifications.length})
                </button>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default NotificationCard;
