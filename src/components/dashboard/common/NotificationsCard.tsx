/**
 * Enhanced NotificationsCard with Real-time Features
 * Dashboard üçün real-time notification kart komponentini
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Eye,
  EyeOff,
  Trash2,
  Filter,
  Wifi,
  WifiOff,
  // RefreshCw
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { az } from 'date-fns/locale';
import { useNotifications } from '@/notifications';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import type { UnifiedNotification } from '@/notifications/core/types';

interface NotificationsCardProps {
  showHeader?: boolean;
  maxNotifications?: number;
  showFilters?: boolean;
  showRealTimeStatus?: boolean;
  autoRefresh?: boolean;
  className?: string;
}

const NotificationsCard: React.FC<NotificationsCardProps> = ({
  showHeader = true,
  maxNotifications = 5,
  showFilters = false,
  showRealTimeStatus = true,
  autoRefresh = true,
  // className
}) => {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('unread');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    realTimeEnabled,
    toggleRealTime,
    // refetch
  } = useNotifications(user?.id);

  // Auto-refresh every 30 seconds if real-time is disabled
  useEffect(() => {
    if (!autoRefresh || realTimeEnabled) return;

    const interval = setInterval(() => {
      refetch();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, realTimeEnabled, refetch]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'deadline': {
      case 'warning': {
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'success': {
      case 'approval': {
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': {
      case 'rejection': {
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'info': {
      case 'system': {
        return <Bell className="w-4 h-4 text-blue-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': {
        return 'bg-red-500 text-white';
      case 'high': {
        return 'bg-orange-500 text-white';
      case 'normal': {
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const formatNotificationTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: az
      });
    } catch {
      return 'Bilinmir';
    }
  };

  // Filter notifications based on selected filter
  const filteredNotifications = React.useMemo(() => {
    let filtered = notifications;

    switch (filter) {
      case 'unread': {
        filtered = filtered.filter(n => !n.is_read);
        break; }
      case 'urgent': {
        filtered = filtered.filter(n => n.priority === 'critical' || n.priority === 'high');
        break; }
      case 'all': {
      default:
        break; }
    }

    return filtered.slice(0, maxNotifications);
  }, [notifications, filter, maxNotifications]);

  const renderNotificationItem = (notification: UnifiedNotification) => (
    <div
      key={notification.id}
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg transition-all hover:bg-gray-50",
        !notification.is_read && "bg-blue-50 border-l-4 border-l-blue-500"
      )}
    >
      <div className="flex-shrink-0 mt-1">
        {getNotificationIcon(notification.type)}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className={cn(
            "text-sm font-medium truncate",
            notification.is_read ? "text-gray-600" : "text-gray-900"
          )}>
            {notification.title}
          </h4>
          
          <div className="flex items-center gap-1">
            <Badge
              className={cn("text-xs", getPriorityColor(notification.priority))}
            >
              {notification.priority}
            </Badge>
            {!notification.is_read && (
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </div>
        </div>
        
        {notification.message && (
          <p className={cn(
            "text-xs mt-1 line-clamp-2",
            notification.is_read ? "text-gray-500" : "text-gray-700"
          )}>
            {notification.message}
          </p>
        )}
        
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">
            {formatNotificationTime(notification.created_at)}
          </span>
          
          <div className="flex items-center gap-1">
            {!notification.is_read && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAsRead(notification.id)}
                className="h-6 px-2"
              >
                <Eye className="w-3 h-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteNotification(notification.id)}
              className="h-6 px-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Bildirişlər</CardTitle>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-start gap-3">
                <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Bildirişlər
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Son bildirişlər və xəbərdarlıqlar
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-1">
              {showRealTimeStatus && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleRealTime(!realTimeEnabled)}
                  title={realTimeEnabled ? 'Real-time deaktiv et' : 'Real-time aktiv et'}
                  className="h-8 w-8 p-0"
                >
                  {realTimeEnabled ? (
                    <Wifi className="w-4 h-4 text-green-600" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-gray-400" />
                  )}
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="h-8 w-8 p-0"
                title="Yenilə"
              >
                <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
              </Button>
            </div>
          </div>
          
          {showFilters && (
            <div className="flex items-center gap-2 mt-3">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <div className="flex gap-1">
                {[
                  { key: 'unread', label: 'Oxunmamış', count: unreadCount },
                  { key: 'urgent', label: 'Təcili', count: notifications.filter(n => ['critical', 'high'].includes(n.priority)).length },
                  { key: 'all', label: 'Hamısı', count: notifications.length }
                ].map(filterOption => (
                  <Button
                    key={filterOption.key}
                    variant={filter === filterOption.key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter(filterOption.key as any)}
                    className="h-7 text-xs"
                  >
                    {filterOption.label}
                    {filterOption.count > 0 && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {filterOption.count}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardHeader>
      )}

      <CardContent className={showHeader ? "" : "pt-6"}>
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {filter === 'unread' ? 'Oxunmamış bildiriş yoxdur' : 
               filter === 'urgent' ? 'Təcili bildiriş yoxdur' : 
               'Bildiriş yoxdur'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <ScrollArea className="h-auto max-h-96">
              <div className="space-y-1">
                {filteredNotifications.map(renderNotificationItem)}
              </div>
            </ScrollArea>
            
            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Hamısını oxu
                  </Button>
                )}
              </div>
              
              <Link to="/notifications">
                <Button variant="ghost" size="sm" className="text-xs">
                  Hamısını gör
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationsCard;