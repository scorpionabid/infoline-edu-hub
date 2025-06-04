
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Bell,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useEnhancedNotifications } from '@/hooks/notifications/useEnhancedNotifications';

export const NotificationAnalytics: React.FC = () => {
  const { t } = useLanguage();
  const { notifications, unreadCount } = useEnhancedNotifications();

  // Calculate analytics
  const analytics = React.useMemo(() => {
    const total = notifications.length;
    const unread = unreadCount;
    const readRate = total > 0 ? ((total - unread) / total) * 100 : 0;

    // Last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const thisWeek = notifications.filter(n => 
      new Date(n.createdAt || n.timestamp) >= sevenDaysAgo
    ).length;

    // Last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const today = notifications.filter(n => 
      new Date(n.createdAt || n.timestamp) >= oneDayAgo
    ).length;

    // By type
    const byType = notifications.reduce((acc, notification) => {
      const type = notification.type || 'info';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // By priority
    const byPriority = notifications.reduce((acc, notification) => {
      const priority = notification.priority || 'normal';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      unread,
      readRate,
      thisWeek,
      today,
      byType,
      byPriority
    };
  }, [notifications, unreadCount]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">{t('total')}</p>
              <p className="text-lg font-semibold">{analytics.total}</p>
            </div>
            <Bell className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">{t('unread')}</p>
              <p className="text-lg font-semibold">{analytics.unread}</p>
            </div>
            <div className="flex items-center">
              {analytics.unread > 0 ? (
                <TrendingUp className="h-4 w-4 text-red-500" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
            </div>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">{t('thisWeek')}</p>
              <p className="text-lg font-semibold">{analytics.thisWeek}</p>
            </div>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">{t('readRate')}</p>
              <p className="text-lg font-semibold">{Math.round(analytics.readRate)}%</p>
            </div>
            <div className="w-12 h-2 bg-muted rounded-full">
              <div 
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${analytics.readRate}%` }}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* By Type */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{t('byType')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Object.entries(analytics.byType).map(([type, count]) => (
            <div key={type} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getTypeIcon(type)}
                <span className="text-sm capitalize">{type}</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {count}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* By Priority */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{t('byPriority')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Object.entries(analytics.byPriority).map(([priority, count]) => (
            <div key={priority} className="flex items-center justify-between">
              <span className="text-sm capitalize">{priority}</span>
              <Badge 
                variant={priority === 'critical' ? 'destructive' : 
                         priority === 'high' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {count}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationAnalytics;
