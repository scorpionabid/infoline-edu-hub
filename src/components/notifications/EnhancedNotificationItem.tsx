
import React from 'react';
import { AppNotification } from '@/types/notification';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  X, 
  Check, 
  Clock,
  AlertCircle,
  Bell
} from 'lucide-react';
import { formatDistance } from 'date-fns';
import { useLanguage } from '@/context/LanguageContext';

interface EnhancedNotificationItemProps {
  notification: AppNotification;
  onMarkAsRead: (id: string) => void;
  showPriority?: boolean;
  showType?: boolean;
  compact?: boolean;
}

export const EnhancedNotificationItem: React.FC<EnhancedNotificationItemProps> = ({
  notification,
  onMarkAsRead,
  showPriority = false,
  showType = false,
  compact = false
}) => {
  const { t } = useLanguage();
  
  const getRelativeTime = (timestamp: string) => {
    if (!timestamp) return t('recently');
    
    try {
      return formatDistance(new Date(timestamp), new Date(), { addSuffix: true });
    } catch (error) {
      return t('recently');
    }
  };
  
  const getTypeIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'deadline':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };
  
  const getPriorityBadge = () => {
    if (!showPriority || !notification.priority) return null;
    
    const priorityColors = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      normal: 'bg-blue-100 text-blue-800 border-blue-200',
      low: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    return (
      <Badge 
        variant="outline" 
        className={cn(
          'text-xs',
          priorityColors[notification.priority as keyof typeof priorityColors] || priorityColors.normal
        )}
      >
        {notification.priority}
      </Badge>
    );
  };
  
  const getTypeBadge = () => {
    if (!showType || !notification.type) return null;
    
    const typeColors = {
      success: 'bg-green-100 text-green-800',
      warning: 'bg-amber-100 text-amber-800',
      error: 'bg-red-100 text-red-800',
      info: 'bg-blue-100 text-blue-800',
      deadline: 'bg-orange-100 text-orange-800'
    };
    
    return (
      <Badge 
        variant="secondary"
        className={cn(
          'text-xs',
          typeColors[notification.type as keyof typeof typeColors] || typeColors.info
        )}
      >
        {notification.type}
      </Badge>
    );
  };
  
  return (
    <div className={cn(
      'flex p-3 transition-colors hover:bg-muted/50',
      !(notification.isRead || notification.is_read) && 'bg-muted/30',
      compact && 'p-2'
    )}>
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5 mr-3">
        {getTypeIcon()}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header with badges */}
        <div className="flex items-start justify-between mb-1">
          <h4 className={cn(
            'text-sm font-medium text-foreground line-clamp-1',
            !(notification.isRead || notification.is_read) && 'font-semibold'
          )}>
            {notification.title}
          </h4>
          
          <div className="flex items-center gap-1 ml-2">
            {getPriorityBadge()}
            {getTypeBadge()}
          </div>
        </div>
        
        {/* Message */}
        {notification.message && (
          <p className={cn(
            'text-sm text-muted-foreground mb-2',
            compact ? 'line-clamp-1' : 'line-clamp-2'
          )}>
            {notification.message}
          </p>
        )}
        
        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {getRelativeTime(notification.createdAt || notification.timestamp)}
          </span>
          
          {/* Action button */}
          {!(notification.isRead || notification.is_read) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead(notification.id);
              }}
              title={t('markAsRead')}
            >
              <Check className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedNotificationItem;
