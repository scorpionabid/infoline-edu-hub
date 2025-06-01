import React, { useState, useMemo } from 'react';
import { 
  Bell, 
  BellOff, 
  Check, 
  Filter, 
  Search, 
  RefreshCw,
  Wifi,
  WifiOff,
  Settings,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  Info,
  X
} from 'lucide-react';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { useEnhancedNotifications } from '@/context/EnhancedNotificationContext';
import { useNotificationFilters, useNotificationConnection } from '@/hooks/notifications/useEnhancedNotifications';
import { EnhancedNotificationItem } from './EnhancedNotificationItem';
import { NotificationConnectionStatus } from './NotificationConnectionStatus';
import { NotificationAnalytics } from './NotificationAnalytics';
import { NotificationSettings } from './NotificationSettings';

const EnhancedNotificationSystem: React.FC = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('notifications');
  
  const { 
    notifications = [], 
    unreadCount = 0, 
    markAsRead = () => {}, 
    markAllAsRead = () => {}, 
    clearAll = () => {},
    refreshNotifications = () => {},
    isLoading = false,
    error = null
  } = useEnhancedNotifications();
  
  const { connectionStatus, handleReconnect, getConnectionHealth } = useNotificationConnection();
  const {
    filters,
    filteredNotifications,
    updateFilter,
    clearFilters,
    getFilterOptions
  } = useNotificationFilters();

  // Get filter options
  const { types, priorities } = getFilterOptions();
  
  // Connection health
  const connectionHealth = getConnectionHealth();
  
  // Priority icon mapping
  const priorityIcons = {
    critical: AlertTriangle,
    high: AlertTriangle,
    normal: Info,
    low: Info
  };
  
  // Type icon mapping
  const typeIcons = {
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertTriangle,
    info: Info,
    deadline: Clock
  };

  // Group notifications by status for quick stats
  const notificationStats = useMemo(() => {
    const stats = {
      total: notifications.length,
      unread: unreadCount,
      today: 0,
      critical: 0,
      high: 0
    };
    
    const today = new Date().toDateString();
    
    notifications.forEach(notification => {
      const notificationDate = new Date(notification.createdAt || notification.timestamp).toDateString();
      if (notificationDate === today) {
        stats.today++;
      }
      
      if (notification.priority === 'critical') {
        stats.critical++;
      } else if (notification.priority === 'high') {
        stats.high++;
      }
    });
    
    return stats;
  }, [notifications, unreadCount]);

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAll();
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };

  const handleRefresh = async () => {
    try {
      await refreshNotifications();
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={t('notifications')}
        >
          <Bell className="h-5 w-5" />
          
          {/* Unread count badge */}
          {unreadCount > 0 && (
            <Badge 
              className={cn(
                "absolute -top-2 -right-2 px-1.5 py-0.5 text-white text-xs",
                unreadCount > 99 ? "bg-red-600" : "bg-red-500"
              )}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          
          {/* Connection status indicator */}
          <div className={cn(
            "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background",
            connectionHealth.health === 'excellent' ? "bg-green-500" :
            connectionHealth.health === 'good' ? "bg-yellow-500" :
            connectionHealth.health === 'poor' ? "bg-orange-500" :
            "bg-red-500"
          )} />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-96 p-0" align="end">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span className="font-semibold">{t('notifications')}</span>
              {isLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
            </div>
            
            <TabsList className="grid w-fit grid-cols-3">
              <TabsTrigger value="notifications" className="px-2 py-1 text-xs">
                <Bell className="h-3 w-3 mr-1" />
                {notificationStats.total}
              </TabsTrigger>
              <TabsTrigger value="analytics" className="px-2 py-1 text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                Stats
              </TabsTrigger>
              <TabsTrigger value="settings" className="px-2 py-1 text-xs">
                <Settings className="h-3 w-3" />
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="notifications" className="mt-0">
            {/* Quick stats */}
            <div className="px-4 py-2 bg-muted/50">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{t('today')}: {notificationStats.today}</span>
                <span>{t('unread')}: {notificationStats.unread}</span>
                <span className="flex items-center space-x-1">
                  <AlertTriangle className="h-3 w-3" />
                  <span>{notificationStats.critical + notificationStats.high}</span>
                </span>
              </div>
            </div>

            {/* Connection status */}
            <NotificationConnectionStatus 
              status={connectionStatus}
              health={connectionHealth}
              onReconnect={handleReconnect}
            />

            {/* Filters and actions */}
            <div className="p-3 border-b space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('searchNotifications')}
                  value={filters.searchTerm}
                  onChange={(e) => updateFilter('searchTerm', e.target.value)}
                  className="pl-9 h-8"
                />
              </div>

              {/* Filter controls */}
              <div className="flex items-center space-x-2">
                <Select value={filters.type} onValueChange={(value) => updateFilter('type', value)}>
                  <SelectTrigger className="h-8 w-20">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All</SelectItem>
                    {types.map(type => (
                      <SelectItem key={type} value={type}>
                        <div className="flex items-center space-x-1">
                          {React.createElement(typeIcons[type as keyof typeof typeIcons] || Info, { 
                            className: "h-3 w-3" 
                          })}
                          <span className="capitalize">{type}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.priority} onValueChange={(value) => updateFilter('priority', value)}>
                  <SelectTrigger className="h-8 w-24">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All</SelectItem>
                    {priorities.map(priority => (
                      <SelectItem key={priority} value={priority}>
                        <div className="flex items-center space-x-1">
                          {React.createElement(priorityIcons[priority as keyof typeof priorityIcons] || Info, { 
                            className: "h-3 w-3" 
                          })}
                          <span className="capitalize">{priority}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.read} onValueChange={(value) => updateFilter('read', value)}>
                  <SelectTrigger className="h-8 w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                  </SelectContent>
                </Select>

                {(filters.type || filters.priority || filters.read !== 'all' || filters.searchTerm) && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2">
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between">
                <div className="flex space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleMarkAllAsRead}
                    disabled={unreadCount === 0 || isLoading}
                    className="h-7 px-2 text-xs"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Mark All Read
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleClearAll}
                    disabled={notifications.length === 0 || isLoading}
                    className="h-7 px-2 text-xs"
                  >
                    <BellOff className="h-3 w-3 mr-1" />
                    Clear All
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="h-7 px-2 text-xs"
                >
                  <RefreshCw className={cn("h-3 w-3", isLoading && "animate-spin")} />
                </Button>
              </div>
            </div>
            
            {/* Error display */}
            {error && (
              <div className="p-3 bg-red-50 border-b">
                <div className="flex items-center space-x-2 text-red-600 text-xs">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{error.message}</span>
                </div>
              </div>
            )}

            {/* Notifications list */}
            <ScrollArea className="h-80">
              {filteredNotifications.length > 0 ? (
                <div className="py-1">
                  {filteredNotifications.map((notification, index) => (
                    <React.Fragment key={notification.id}>
                      <div 
                        className={cn(
                          "hover:bg-muted/50 transition-colors",
                          !(notification.isRead || notification.is_read) ? "bg-muted/30" : ""
                        )}
                      >
                        <EnhancedNotificationItem 
                          notification={notification} 
                          onMarkAsRead={markAsRead}
                          showPriority={true}
                          showType={true}
                        />
                      </div>
                      {index < filteredNotifications.length - 1 && (
                        <Separator className="my-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center text-muted-foreground">
                  {notifications.length === 0 ? (
                    <>
                      <Bell className="h-12 w-12 mb-3 opacity-50" />
                      <p className="text-sm">{t('noNotifications')}</p>
                    </>
                  ) : (
                    <>
                      <Filter className="h-12 w-12 mb-3 opacity-50" />
                      <p className="text-sm">No notifications match your filters</p>
                      <Button 
                        variant="link" 
                        size="sm" 
                        onClick={clearFilters}
                        className="mt-2 text-xs"
                      >
                        Clear filters
                      </Button>
                    </>
                  )}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="analytics" className="mt-0">
            <NotificationAnalytics />
          </TabsContent>

          <TabsContent value="settings" className="mt-0">
            <NotificationSettings />
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};

export default EnhancedNotificationSystem;
