
import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';

export const NotificationComponent: React.FC = () => {
  const {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll
  } = useNotifications();

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <Bell className="h-5 w-5" />
        <span>Yüklənir...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <Button variant="ghost" size="sm" className="relative">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>
      
      {notifications.length > 0 && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white shadow-lg rounded-lg border z-50">
          <div className="p-3 border-b flex justify-between items-center">
            <h3 className="font-medium">Bildirişlər</h3>
            <div className="space-x-2">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  Hamısını oxu
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={clearAll}>
                Təmizlə
              </Button>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.slice(0, 5).map((notification) => (
              <div 
                key={notification.id}
                className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                  !notification.is_read ? 'bg-blue-50' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="font-medium text-sm">{notification.title}</div>
                {notification.message && (
                  <div className="text-xs text-gray-600 mt-1">{notification.message}</div>
                )}
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(notification.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationComponent;
