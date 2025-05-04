
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { Notification } from '@/types/dashboard';
import { cn } from '@/lib/utils';

export interface NotificationsCardProps {
  title?: string;
  notifications: Notification[];
  showViewAll?: boolean;
  className?: string;
}

export function NotificationsCard({
  title = 'Bildirişlər',
  notifications,
  showViewAll = true,
  className
}: NotificationsCardProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const getIconColor = (type: string) => {
    switch (type) {
      case 'error':
      case 'rejection':
      case 'danger':
        return 'text-destructive';
      case 'warning':
      case 'deadline':
        return 'text-warning';
      case 'success':
      case 'approval':
        return 'text-success';
      case 'info':
      case 'system':
      case 'comment':
      default:
        return 'text-info';
    }
  };

  const getIcon = (type: string) => {
    return <Bell className={cn("h-5 w-5", getIconColor(type))} />;
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">
          {title}
        </CardTitle>
        {showViewAll && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/notifications')}
          >
            {t('viewAll')}
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {t('noNotifications')}
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.slice(0, 5).map((notification) => (
              <div 
                key={notification.id} 
                className={cn(
                  "flex space-x-3 p-3 rounded-lg transition-colors",
                  (notification.isRead || notification.read)
                    ? "bg-background hover:bg-secondary/20" 
                    : "bg-secondary/10 hover:bg-secondary/20"
                )}
              >
                <div className="bg-background rounded-full p-2 flex-shrink-0">
                  {getIcon(notification.type)}
                </div>
                <div>
                  <h4 className={cn(
                    "font-medium mb-1",
                    !(notification.isRead || notification.read) && "font-bold"
                  )}>
                    {notification.title}
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    {notification.message}
                  </p>
                  <div className="text-xs text-muted-foreground mt-2">
                    {notification.date || new Date(notification.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default NotificationsCard;
