
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';
import { useLanguage } from '@/context/LanguageContext';
import { format } from 'date-fns';
import { az, enUS, ru, tr } from 'date-fns/locale';
import { Bell, CheckCircle, ChevronRight, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const NotificationsCard = () => {
  const { t, language } = useLanguage();
  
  // Locales mapping
  const getLocale = () => {
    switch (language) {
      case 'az': return az;
      case 'en': return enUS;
      case 'ru': return ru;
      case 'tr': return tr;
      default: return az;
    }
  };
  
  const { notifications, markAsRead } = useNotifications();
  const [expanded, setExpanded] = useState(false);
  
  // Format notification timestamp
  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, 'HH:mm - dd MMM', { locale: getLocale() });
    } catch (e) {
      console.error("Date formatting error:", e);
      return dateStr;
    }
  };
  
  // Get notification type color
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'deadline': return 'bg-yellow-100 text-yellow-700';
      case 'system': return 'bg-blue-100 text-blue-700';
      case 'approval': return 'bg-green-100 text-green-700';
      case 'warning': 
      case 'error': return 'bg-red-100 text-red-700';
      case 'success': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };
  
  // Limit the number of notifications displayed
  const displayedNotifications = expanded 
    ? notifications 
    : notifications.slice(0, 3);
  
  const hasMoreNotifications = notifications.length > 3;
  
  // Handle notification click
  const handleNotificationClick = (id: string) => {
    markAsRead(id);
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            {t('notifications')}
            {notifications.filter(n => !n.isRead).length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {notifications.filter(n => !n.isRead).length}
              </Badge>
            )}
          </CardTitle>
          
          {hasMoreNotifications && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setExpanded(prev => !prev)}
            >
              {expanded ? t('showLess') : t('showAll')}
              <ChevronRight className={`ml-1 h-4 w-4 transform ${expanded ? 'rotate-90' : ''}`} />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {displayedNotifications.length > 0 ? (
          <div className="space-y-4">
            {displayedNotifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                {index > 0 && <Separator />}
                <div 
                  className={`flex items-start p-2 rounded-md transition-colors ${
                    !notification.isRead ? 'bg-muted/80' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  <div className={`p-2 rounded-full mr-3 ${getNotificationColor(notification.type)}`}>
                    {notification.isRead ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Bell className="h-4 w-4" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      <span className="text-xs text-muted-foreground">
                        {notification.time || formatTime(notification.createdAt.toString())}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    
                    {notification.relatedId && (
                      <div className="mt-2">
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                          {t('viewDetails')}
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <p>{t('noNotifications')}</p>
          </div>
        )}
        
        {/* View all notifications link */}
        {notifications.length > 0 && (
          <div className="mt-4 text-center">
            <Button variant="ghost" size="sm">
              {t('viewAllNotifications')}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationsCard;
