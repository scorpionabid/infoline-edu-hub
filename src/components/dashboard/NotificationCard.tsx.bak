/**
 * NotificationCard Component
 * Dashboard-da istifadə ediləcək notification card
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Mail,
  Eye,
  Trash2,
  MoreVertical,
  // ExternalLink
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotifications } from '@/notifications';
import { useAuthStore, selectUser } from '@/hooks/auth';
import { formatDistanceToNow } from 'date-fns';
import { az } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface NotificationCardProps {
  maxItems?: number;
  showViewAll?: boolean;
  className?: string;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  maxItems = 5,
  showViewAll = true,
  className = ''
}) => {
  const user = useAuthStore(selectUser);
  const navigate = useNavigate();
  const [hoveredNotification, setHoveredNotification] = useState<string | null>(null);
  
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    // deleteNotification
  } = useNotifications(user?.id);

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
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high': {
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'normal': {
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
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

  const displayedNotifications = notifications.slice(0, maxItems);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Bildirişlər
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
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
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Bildirişlər
            </CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                Hamısını oxu
              </Button>
            )}
            {showViewAll && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/notifications')}
                className="text-xs flex items-center gap-1"
              >
                Hamısını gör
                <ExternalLink className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
        <CardDescription>
          Son bildirişləriniz və yeniliklər
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Heç bir bildiriş yoxdur</p>
            <p className="text-sm mt-1">Yeni bildirişlər burada görünəcək</p>
          </div>
        ) : (
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {displayedNotifications.map((notification, index) => (
                <div key={notification.id}>
                  <div 
                    className={`
                      group relative p-3 rounded-lg border transition-all cursor-pointer
                      ${notification.is_read 
                        ? 'bg-gray-50 border-gray-200' 
                        : 'bg-white border-blue-200 shadow-sm hover:shadow-md'
                      }
                    `}
                    onMouseEnter={() => setHoveredNotification(notification.id)}
                    onMouseLeave={() => setHoveredNotification(null)}
                    onClick={() => !notification.is_read && markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`
                            font-medium text-sm line-clamp-2
                            ${notification.is_read ? 'text-gray-600' : 'text-gray-900'}
                          `}>
                            {notification.title}
                          </h4>
                          
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                          )}
                        </div>
                        
                        {notification.message && (
                          <p className={`
                            text-xs mt-1 line-clamp-2
                            ${notification.is_read ? 'text-gray-500' : 'text-gray-700'}
                          `}>
                            {notification.message}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-2 mt-2">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getPriorityColor(notification.priority)}`}
                          >
                            {notification.priority}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatNotificationTime(notification.created_at)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Actions dropdown */}
                      <div className={`
                        transition-opacity
                        ${hoveredNotification === notification.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                      `}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!notification.is_read && (
                              <>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                  className="flex items-center gap-2"
                                >
                                  <Eye className="w-4 h-4" />
                                  Oxunmuş kimi işarələ
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="flex items-center gap-2 text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                              // Sil
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                  
                  {index < displayedNotifications.length - 1 && (
                    <Separator className="mt-3" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        
        {notifications.length > maxItems && (
          <>
            <Separator className="my-3" />
            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/notifications')}
                className="text-xs"
              >
                Daha çox göstər ({notifications.length - maxItems} bildiriş)
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationCard;