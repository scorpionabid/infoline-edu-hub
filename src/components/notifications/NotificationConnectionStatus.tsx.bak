
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface ConnectionHealth {
  status: 'connected' | 'disconnected' | 'reconnecting';
  lastConnected?: Date;
  reconnectCount: number;
  health: 'excellent' | 'good' | 'poor' | 'offline';
}

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
      case 'good':
        return null; // Don't show badge for good connections
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

        <Button
          variant="outline"
          size="sm"
          onClick={onReconnect}
          className="h-6 px-2 text-xs"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          {t('reconnect')}
        </Button>
      </div>
    </div>
  );
};

export default NotificationConnectionStatus;
