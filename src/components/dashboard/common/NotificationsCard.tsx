
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DashboardNotification, NotificationsCardProps } from '@/types/dashboard';
import { Info, AlertTriangle, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useLanguage } from '@/context/LanguageContext';

export const NotificationsCard: React.FC<NotificationsCardProps> = ({ 
  title, 
  notifications, 
  viewAll
}) => {
  const { t } = useLanguage();

  const getNotificationIcon = (type: DashboardNotification['type']) => {
    switch (type) {
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {viewAll && (
          <Button variant="ghost" size="sm" className="text-xs" onClick={viewAll}>
            {t('viewAll')}
            <ChevronRight className="ml-1 h-3 w-3" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-60 pr-4">
          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-3 rounded-lg border",
                    notification.isRead ? "bg-background" : "bg-muted/40"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {getNotificationIcon(notification.type)}
                    <div className="font-medium text-sm">{notification.title}</div>
                  </div>
                  <p className="text-xs mt-1 text-muted-foreground">
                    {notification.message}
                  </p>
                  <div className="text-[10px] text-muted-foreground mt-2">
                    {notification.timestamp 
                      ? formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })
                      : notification.date}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">{t('noNotificationsYet')}</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
