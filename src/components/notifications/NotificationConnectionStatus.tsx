
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { ConnectionHealth } from '@/hooks/notifications/useEnhancedNotifications';

interface NotificationConnectionStatusProps {
  status: string;
  health: ConnectionHealth;
  onReconnect: () => void;
  className?: string;
}

export const NotificationConnectionStatus: React.FC<NotificationConnectionStatusProps> = ({
  status,
  health,
  onReconnect,
  className = ''
}) => {
  const { t } = useLanguage();

  const getStatusBadge = () => {
    switch (health.health) {
      case 'excellent':
        return (
          <Badge variant="default" className="bg-green-500 text-white">
            <Wifi className="h-3 w-3 mr-1" />
            {t('connected')}
          </Badge>
        );
      case 'good':
        return (
          <Badge variant="secondary" className="bg-yellow-500 text-white">
            <Wifi className="h-3 w-3 mr-1" />
            {t('connected')}
          </Badge>
        );
      case 'poor':
        return (
          <Badge variant="destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {t('unstable')}
          </Badge>
        );
      case 'offline':
      default:
        return (
          <Badge variant="destructive">
            <WifiOff className="h-3 w-3 mr-1" />
            {t('disconnected')}
          </Badge>
        );
    }
  };

  // Only show if connection is poor or offline
  if (health.health === 'excellent' || health.health === 'good') {
    return null;
  }

  return (
    <div className={`px-3 py-2 bg-muted/50 border-b ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getStatusBadge()}
          {health.reconnectCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {t('reconnectAttempts')}: {health.reconnectCount}
            </span>
          )}
        </div>

        {health.health !== 'excellent' && (
          <Button
            variant="outline"
            size="sm"
            onClick={onReconnect}
            className="h-6 px-2 text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            {t('reconnect')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default NotificationConnectionStatus;
