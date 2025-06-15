
export interface ConnectionHealth {
  status: 'connected' | 'disconnected' | 'reconnecting';
  lastConnected?: Date;
  reconnectCount: number;
  health: 'excellent' | 'good' | 'poor' | 'offline';
}

export const useConnectionHealth = () => {
  const connectionHealth: ConnectionHealth = {
    status: 'connected',
    health: 'excellent',
    reconnectCount: 0,
    lastConnected: new Date()
  };

  return {
    connectionHealth,
    isConnected: connectionHealth.status === 'connected'
  };
};
