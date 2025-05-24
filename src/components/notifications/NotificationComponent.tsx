
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCircle, Trash2 } from 'lucide-react';
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
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Yüklənir...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Bildirişlər
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount}
            </Badge>
          )}
        </CardTitle>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button size="sm" variant="outline" onClick={markAllAsRead}>
              <CheckCircle className="w-3 h-3 mr-1" />
              Hamısını oxu
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={clearAll}>
            <Trash2 className="w-3 h-3 mr-1" />
            Təmizlə
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            Hələ ki heç bir bildiriş yoxdur
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.slice(0, 5).map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border ${
                  notification.is_read ? 'bg-gray-50' : 'bg-blue-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{notification.title}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <CheckCircle className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {notifications.length > 5 && (
              <p className="text-xs text-muted-foreground text-center">
                +{notifications.length - 5} əlavə bildiriş
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
