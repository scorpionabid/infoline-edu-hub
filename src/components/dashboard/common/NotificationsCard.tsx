
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { AppNotification } from '@/types/notification';
import { formatDate } from '@/utils/formatters';

export interface NotificationsCardProps {
  title?: string;
  notifications: AppNotification[];
  emptyMessage?: string;
  onMarkAsRead?: (id: string) => void;
  limit?: number;
  className?: string;
}

export const NotificationsCard: React.FC<NotificationsCardProps> = ({ 
  title = 'Bildirişlər',
  notifications = [], 
  emptyMessage = 'Bildiriş yoxdur',
  onMarkAsRead,
  limit = 5,
  className
}) => {
  const { t } = useLanguage();

  // Bildirişləri tarix əsasında sıralayaq
  const sortedNotifications = [...notifications]
    .sort((a, b) => {
      const dateA = a.createdAt || a.timestamp || a.date || '';
      const dateB = b.createdAt || b.timestamp || b.date || '';
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    })
    .slice(0, limit);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title || t('notifications')}</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedNotifications.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground flex flex-col items-center justify-center">
            <Bell className="h-8 w-8 mb-2 opacity-25" />
            <p>{emptyMessage || t('noNotifications')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-3 rounded-md border ${notification.isRead ? 'bg-background' : 'bg-accent'}`}
                onClick={() => onMarkAsRead && onMarkAsRead(notification.id)}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    notification.type === 'success' ? 'bg-green-500' : 
                    notification.type === 'error' ? 'bg-red-500' : 
                    notification.type === 'warning' ? 'bg-amber-500' : 
                    'bg-blue-500'
                  }`} />
                  <h4 className="font-medium text-sm">{notification.title}</h4>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                <div className="text-xs text-muted-foreground mt-2">
                  {formatDate(notification.createdAt || notification.timestamp || notification.date || '')}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationsCard;
