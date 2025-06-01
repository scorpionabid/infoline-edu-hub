import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { az } from 'date-fns/locale';
import {
  AlertTriangle,
  CheckCircle,
  Info,
  Clock,
  ExternalLink,
  Trash2,
  Eye,
  EyeOff,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AppNotification } from '@/types/notification';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/context/LanguageContext';
import { useEnhancedNotifications } from '@/context/EnhancedNotificationContext';

interface EnhancedNotificationItemProps {
  notification: AppNotification;
  onMarkAsRead?: (id: string) => void;
  showPriority?: boolean;
  showType?: boolean;
  showActions?: boolean;
  compact?: boolean;
}

export const EnhancedNotificationItem: React.FC<EnhancedNotificationItemProps> = ({
  notification,
  onMarkAsRead,
  showPriority = false,
  showType = false,
  showActions = true,
  compact = false
}) => {
  const { t } = useLanguage();
  const { deleteNotification } = useEnhancedNotifications();
  const [isDeleting, setIsDeleting] = useState(false);

  const isRead = notification.isRead || notification.is_read;
  const createdAt = new Date(notification.createdAt || notification.timestamp);

  // Priority color mapping
  const priorityColors = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    normal: 'bg-blue-100 text-blue-800 border-blue-200',
    low: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  // Type color mapping
  const typeColors = {
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    deadline: 'bg-purple-100 text-purple-800 border-purple-200'
  };

  // Icon mapping
  const typeIcons = {
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertTriangle,
    info: Info,
    deadline: Clock
  };

  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMarkAsRead && !isRead) {
      await onMarkAsRead(notification.id);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsDeleting(true);
      await deleteNotification(notification.id);
    } catch (error) {
      console.error('Error deleting notification:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClick = () => {
    // Auto-mark as read when clicked
    if (!isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }

    // Handle navigation if link exists
    if (notification.link) {
      window.open(notification.link, '_blank');
    }
  };

  const TypeIcon = typeIcons[notification.type as keyof typeof typeIcons] || Info;

  return (
    <div
      className={cn(
        "group relative p-3 cursor-pointer transition-all duration-200",
        !isRead && "bg-muted/30",
        "hover:bg-muted/50",
        compact && "p-2"
      )}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        {/* Type icon */}
        <div className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          notification.type === 'success' ? 'bg-green-100' :
          notification.type === 'warning' ? 'bg-yellow-100' :
          notification.type === 'error' ? 'bg-red-100' :
          notification.type === 'deadline' ? 'bg-purple-100' :
          'bg-blue-100'
        )}>
          <TypeIcon className={cn(
            "h-4 w-4",
            notification.type === 'success' ? 'text-green-600' :
            notification.type === 'warning' ? 'text-yellow-600' :
            notification.type === 'error' ? 'text-red-600' :
            notification.type === 'deadline' ? 'text-purple-600' :
            'text-blue-600'
          )} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header with title and badges */}
          <div className="flex items-start justify-between mb-1">
            <div className="flex-1">
              <h4 className={cn(
                "text-sm font-medium leading-tight",
                isRead ? "text-muted-foreground" : "text-foreground"
              )}>
                {notification.title}
              </h4>
              
              {/* Badges */}
              <div className="flex items-center space-x-1 mt-1">
                {showType && notification.type && (
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs",
                      typeColors[notification.type as keyof typeof typeColors] || typeColors.info
                    )}
                  >
                    {notification.type}
                  </Badge>
                )}
                
                {showPriority && notification.priority && notification.priority !== 'normal' && (
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs",
                      priorityColors[notification.priority as keyof typeof priorityColors] || priorityColors.normal
                    )}
                  >
                    {notification.priority}
                  </Badge>
                )}
                
                {!isRead && (
                  <Badge variant="secondary" className="text-xs">
                    {t('new')}
                  </Badge>
                )}
              </div>
            </div>

            {/* Actions */}
            {showActions && (
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!isRead ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAsRead}
                    className="h-6 w-6 p-0"
                    title={t('markAsRead')}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Could implement mark as unread functionality
                    }}
                    className="h-6 w-6 p-0"
                    title={t('markAsUnread')}
                  >
                    <EyeOff className="h-3 w-3" />
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {!isRead ? (
                      <DropdownMenuItem onClick={handleMarkAsRead}>
                        <Eye className="h-4 w-4 mr-2" />
                        {t('markAsRead')}
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => {}}>
                        <EyeOff className="h-4 w-4 mr-2" />
                        {t('markAsUnread')}
                      </DropdownMenuItem>
                    )}
                    
                    {notification.link && (
                      <>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(notification.link, '_blank');
                          }}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          {t('openLink')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    
                    <DropdownMenuItem 
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {isDeleting ? t('deleting') : t('delete')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          {/* Message */}
          {notification.message && !compact && (
            <p className={cn(
              "text-xs mt-1 leading-relaxed",
              isRead ? "text-muted-foreground" : "text-muted-foreground"
            )}>
              {notification.message}
            </p>
          )}

          {/* Footer with timestamp and link indicator */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(createdAt, { 
                addSuffix: true, 
                locale: az 
              })}
            </span>
            
            {notification.link && (
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <ExternalLink className="h-3 w-3" />
                <span>{t('hasLink')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Unread indicator */}
      {!isRead && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r" />
      )}
    </div>
  );
};

export default EnhancedNotificationItem;
