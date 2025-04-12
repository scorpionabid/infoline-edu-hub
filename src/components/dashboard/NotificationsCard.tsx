
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Notification } from '@/types/notification';
import { Button } from '@/components/ui/button';
import { NotificationItem } from '../notifications/NotificationItem';
import { useNotifications } from '@/context/NotificationContext';
import { Bell } from 'lucide-react';

interface NotificationsCardProps {
  dashboardNotifications?: Notification[];
  notifications?: Notification[]; // Əlavə prop əlavə edirik, köhnə kodla uyğunluq üçün
}

const NotificationsCard: React.FC<NotificationsCardProps> = ({ 
  dashboardNotifications,
  notifications
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { notifications: contextNotifications, loading } = useNotifications();
  
  // Notifications prop üstünlük təşkil edir, sonra dashboardNotifications, sonra isə context-dən
  const displayNotifications = notifications || dashboardNotifications || contextNotifications.slice(0, 5);
  
  const handleViewAll = () => {
    navigate('/notifications');
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <span>{t('recentNotifications')}</span>
        </CardTitle>
        <CardDescription>{t('systemNotificationsDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[200px]">
            <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent"></div>
          </div>
        ) : displayNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-4 h-[200px]">
            <Bell className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-lg font-medium">{t('noNotifications')}</p>
            <p className="text-sm text-muted-foreground">{t('noNotificationsDesc')}</p>
          </div>
        ) : (
          <>
            <ScrollArea className="h-[250px]">
              <div className="space-y-3">
                {displayNotifications.map(notification => (
                  <NotificationItem 
                    key={notification.id} 
                    notification={{
                      id: notification.id,
                      title: notification.title,
                      message: notification.message,
                      createdAt: notification.createdAt || notification.date,
                      isRead: notification.isRead,
                      type: notification.type,
                      priority: notification.priority as any,
                      userId: notification.userId || '',
                      date: notification.date || notification.createdAt
                    }} 
                  />
                ))}
              </div>
            </ScrollArea>
            <div className="mt-4 flex justify-center">
              <Button variant="outline" onClick={handleViewAll}>{t('viewAllNotifications')}</Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationsCard;
