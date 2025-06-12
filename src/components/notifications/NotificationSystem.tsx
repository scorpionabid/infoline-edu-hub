import React, { useEffect, useState } from 'react';
import { Bell, X, Check, AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { useNotifications } from '@/hooks/notifications/useNotifications';
import { toast } from 'sonner';

interface NotificationData {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'success' | 'warning' | 'error';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  is_read: boolean;
  created_at: string;
  reference_id?: string;
  reference_type?: string;
}

const NotificationSystem: React.FC = () => {
  const { t } = useLanguage();
  const user = useAuthStore(state => state.user);
  const { notifications, loading, error, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [open, setOpen] = useState(false);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(t('locale'), {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" onClick={() => setOpen(!open)}>
        <Bell className="h-5 w-5" />
        {notifications.filter(n => !n.is_read).length > 0 && (
          <Badge
            className="absolute -top-1 -right-1 rounded-full px-2 py-0.5 text-xs"
            variant="destructive"
          >
            {notifications.filter(n => !n.is_read).length}
          </Badge>
        )}
      </Button>

      {open && (
        <Card className="absolute z-50 right-0 mt-2 w-96 shadow-xl">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>{t('notifications')}</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 text-center">{t('loading')}...</div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">{error}</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center">{t('noNotifications')}</div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-4 border-b last:border-b-0"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          {getIcon(notification.type)}
                          <CardTitle className="text-sm font-medium">{notification.title}</CardTitle>
                          {!notification.is_read && (
                            <Badge variant="secondary">{t('unread')}</Badge>
                          )}
                        </div>
                        <CardContent className="text-xs text-muted-foreground p-0">
                          {notification.description}
                        </CardContent>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(notification.created_at)}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            )}
            {notifications.length > 0 && (
              <>
                <Separator />
                <div className="p-4 flex justify-end">
                  <Button variant="outline" size="sm" onClick={markAllAsRead}>
                    {t('markAllAsRead')}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NotificationSystem;
