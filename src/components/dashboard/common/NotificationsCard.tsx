
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardNotification } from '@/types/dashboard';
import { Button } from '@/components/ui/button';
import { Bell, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { formatDistanceToNow } from 'date-fns';
import { az, tr, ru, enUS } from 'date-fns/locale';
import NotificationItem from '../NotificationItem';

export interface NotificationsCardProps {
  title: string;
  notifications: DashboardNotification[];
  maxItems?: number;
  onViewAll?: () => void;
  emptyMessage?: string;
}

export const NotificationsCard: React.FC<NotificationsCardProps> = ({
  title,
  notifications,
  maxItems = 5,
  onViewAll,
  emptyMessage = "Bildiriş yoxdur"
}) => {
  const { t, currentLanguage } = useLanguage();
  
  // Dil lokallaşdırmasını əldə et
  const getLocale = () => {
    switch (currentLanguage) {
      case 'az': return az;
      case 'tr': return tr;
      case 'ru': return ru;
      default: return enUS;
    }
  };
  
  const locale = getLocale();
  
  // Bildirişləri tarixi ilə formatla
  const formattedNotifications = notifications?.map(notification => ({
    ...notification,
    formattedDate: notification.date 
      ? formatDistanceToNow(new Date(notification.date), { addSuffix: true, locale })
      : ''
  })) || [];
  
  const displayNotifications = formattedNotifications.slice(0, maxItems);
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Bell className="h-5 w-5 mr-2 text-muted-foreground" /> 
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        {displayNotifications.length > 0 ? (
          <div className="space-y-4">
            {displayNotifications.map((notification, i) => (
              <NotificationItem 
                key={notification.id || i}
                notification={notification}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p>{emptyMessage}</p>
          </div>
        )}
      </CardContent>
      {onViewAll && notifications.length > 0 && (
        <CardFooter>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={onViewAll}
          >
            {t('viewAllNotifications')} <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default NotificationsCard;
