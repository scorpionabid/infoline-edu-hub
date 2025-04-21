
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardNotification } from '@/types/dashboard';
import { useLanguage } from '@/context/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { Bell, Calendar, CheckCheck, Clock } from 'lucide-react';

interface NotificationsCardProps {
  notifications: DashboardNotification[];
  className?: string;
}

const NotificationsCard: React.FC<NotificationsCardProps> = ({ notifications, className }) => {
  const { t } = useLanguage();
  const [showAll, setShowAll] = React.useState(false);
  
  // En son 3 bildirişi göstər, əgər showAll = true olarsa hamısını göstər
  const displayedNotifications = showAll 
    ? notifications 
    : notifications.slice(0, 3);

  if (notifications.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{t('notifications')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <Bell className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">{t('noNotifications')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Bildiriş tipinə görə ikonasını təyin et
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Bell className="h-4 w-4 text-blue-500" />;
      case 'warning':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'success':
        return <CheckCheck className="h-4 w-4 text-green-500" />;
      case 'error':
        return <Bell className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  // Bildiriş tarixçəsini formatla
  const formatNotificationTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return t('today');
    } else if (diffDays === 1) {
      return t('yesterday');
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t('notifications')}</CardTitle>
        <Badge variant="secondary">{notifications.length}</Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayedNotifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`flex items-start p-3 rounded-lg border ${
                notification.read ? 'bg-background' : 'bg-muted/30'
              }`}
            >
              <div className="flex-shrink-0 mr-3 mt-1">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h5 className="font-medium text-sm">{notification.title}</h5>
                  <span className="text-xs text-muted-foreground flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatNotificationTime(notification.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{notification.message}</p>
              </div>
            </div>
          ))}
          
          {notifications.length > 3 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? t('showLess') : t('showMore')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationsCard;
