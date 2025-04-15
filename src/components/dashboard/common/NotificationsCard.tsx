
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { DashboardNotification } from '@/types/dashboard';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Mail, 
  MessageSquare, 
  Calendar, 
  User,
  X 
} from 'lucide-react';

interface NotificationsCardProps {
  notifications: DashboardNotification[];
}

const NotificationsCard: React.FC<NotificationsCardProps> = ({ notifications }) => {
  const { t } = useLanguage();

  // Get icon based on notification type
  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'email':
        return <Mail className="h-4 w-4 text-indigo-500" />;
      case 'message':
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case 'event':
        return <Calendar className="h-4 w-4 text-yellow-500" />;
      case 'user':
        return <User className="h-4 w-4 text-teal-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  // Format date function (assumes format YYYY-MM-DD)
  const formatDate = (date: string, time?: string) => {
    if (!date) return '';
    
    const today = new Date();
    const notificationDate = new Date(date);
    
    // Check if it's today
    if (
      today.getDate() === notificationDate.getDate() &&
      today.getMonth() === notificationDate.getMonth() &&
      today.getFullYear() === notificationDate.getFullYear()
    ) {
      return time ? `${t('today')}, ${time}` : t('today');
    }
    
    // Check if it's yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (
      yesterday.getDate() === notificationDate.getDate() &&
      yesterday.getMonth() === notificationDate.getMonth() &&
      yesterday.getFullYear() === notificationDate.getFullYear()
    ) {
      return time ? `${t('yesterday')}, ${time}` : t('yesterday');
    }
    
    // Format as DD/MM/YYYY
    const day = notificationDate.getDate().toString().padStart(2, '0');
    const month = (notificationDate.getMonth() + 1).toString().padStart(2, '0');
    const year = notificationDate.getFullYear();
    
    return time ? `${day}/${month}/${year}, ${time}` : `${day}/${month}/${year}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('notifications')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="text-center text-muted-foreground p-4">
              {t('noNotifications')}
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className={`p-3 rounded-md border ${notification.isRead ? 'bg-background' : 'bg-secondary/30'}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getIcon(notification.type)}
                      </div>
                      <div>
                        <div className="font-medium mb-1">{notification.title}</div>
                        <div className="text-sm text-muted-foreground">{notification.message}</div>
                        <div className="text-xs text-muted-foreground mt-2">
                          {formatDate(notification.date, notification.time || undefined)}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default NotificationsCard;
