
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface ConnectionHealth {
  health: 'excellent' | 'good' | 'poor' | 'disconnected';
  latency: number;
  lastUpdate: Date;
}

interface NotificationConnectionStatusProps {
  status: 'connected' | 'disconnected' | 'connecting';
  health: ConnectionHealth;
  onReconnect: () => void;
}

export const NotificationConnectionStatus: React.FC<NotificationConnectionStatusProps> = ({
  status,
  health,
  onReconnect
}) => {
  if (status === 'connected' && health.health === 'excellent') {
    return null; // Don't show when everything is working well
  }

  return (
    <div className="px-3 py-2 bg-gray-50 border-b">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {status === 'connected' ? (
            <Wifi className="h-4 w-4 text-green-600" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-600" />
          )}
          
          <span className="text-xs text-gray-600">
            {status === 'connected' ? 'Bağlantı qurulub' : 'Bağlantı yoxdur'}
          </span>
          
          <Badge 
            variant="outline" 
            className={`text-xs ${
              health.health === 'excellent' ? 'text-green-600' :
              health.health === 'good' ? 'text-yellow-600' :
              'text-red-600'
            }`}
          >
            {health.latency}ms
          </Badge>
        </div>

        {status !== 'connected' && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onReconnect}
            className="h-6 px-2 text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Yenidən bağlan
          </Button>
        )}
      </div>
    </div>
  );
};

export default NotificationConnectionStatus;
