import React from 'react';
import { Wifi, WifiOff, AlertTriangle, RefreshCw, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

interface ConnectionStatus {
  isConnected: boolean;
  status: string;
  reconnectCount: number;
  lastReconnectAttempt?: number;
}

interface ConnectionHealth {
  health: 'excellent' | 'good' | 'poor' | 'disconnected';
  isConnected: boolean;
  status: string;
  reconnectCount: number;
  lastReconnectAttempt?: number;
}

interface NotificationConnectionStatusProps {
  status: ConnectionStatus;
  health: ConnectionHealth;
  onReconnect: () => Promise<void>;
  className?: string;
}

export const NotificationConnectionStatus: React.FC<NotificationConnectionStatusProps> = ({
  status,
  health,
  onReconnect,
  className
}) => {
  const { t } = useLanguage();
  const [reconnecting, setReconnecting] = React.useState(false);

  const handleReconnect = async () => {
    try {
      setReconnecting(true);
      await onReconnect();
    } catch (error) {
      console.error('Reconnection failed:', error);
    } finally {
      setReconnecting(false);
    }
  };

  // Don't show connection status if everything is excellent
  if (health.health === 'excellent') {
    return null;
  }

  const getStatusConfig = () => {
    switch (health.health) {
      case 'disconnected':
        return {
          icon: WifiOff,
          text: t('disconnected'),
          description: t('notReceivingRealTimeUpdates'),
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          badgeVariant: 'destructive' as const,
          showReconnect: true
        };
      case 'poor':
        return {
          icon: AlertTriangle,
          text: t('unstableConnection'),
          description: t('connectionInstable', { count: health.reconnectCount }),
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          badgeVariant: 'secondary' as const,
          showReconnect: true
        };
      case 'good':
        return {
          icon: Wifi,
          text: t('reconnected'),
          description: t('connectionRestored'),
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          badgeVariant: 'secondary' as const,
          showReconnect: false
        };
      default:
        return {
          icon: CheckCircle,
          text: t('connected'),
          description: t('realTimeActive'),
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          badgeVariant: 'secondary' as const,
          showReconnect: false
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <div className={cn(
      "px-3 py-2 border-b",
      config.bgColor,
      config.borderColor,
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <IconComponent className={cn("h-4 w-4", config.color)} />
          
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className={cn("text-sm font-medium", config.color)}>
                {config.text}
              </span>
              
              <Badge variant={config.badgeVariant} className="text-xs">
                {status.status}
              </Badge>
            </div>
            
            <p className="text-xs text-muted-foreground mt-1">
              {config.description}
            </p>
          </div>
        </div>
        
        {config.showReconnect && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReconnect}
            disabled={reconnecting}
            className="h-7 px-2 text-xs"
          >
            <RefreshCw className={cn(
              "h-3 w-3 mr-1", 
              reconnecting && "animate-spin"
            )} />
            {reconnecting ? t('connecting') : t('reconnect')}
          </Button>
        )}
      </div>
      
      {/* Additional connection info for debugging */}
      {health.reconnectCount > 0 && (
        <div className="mt-2 pt-2 border-t border-current/20">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{t('reconnectAttempts')}: {health.reconnectCount}</span>
            {health.lastReconnectAttempt && (
              <span>
                {t('lastAttempt')}: {new Date(health.lastReconnectAttempt).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationConnectionStatus;
