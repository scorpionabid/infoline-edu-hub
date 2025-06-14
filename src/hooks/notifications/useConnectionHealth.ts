
export interface ConnectionHealth {
  status: 'connected' | 'disconnected' | 'reconnecting';
  lastConnected?: Date;
  reconnectCount: number;
  health: 'good' | 'poor' | 'critical';
}

export const useConnectionHealth = () => {
  const connectionHealth: ConnectionHealth = {
    status: 'connected',
    health: 'good',
    reconnectCount: 0,
    lastConnected: new Date()
  };

  return {
    connectionHealth,
    isConnected: connectionHealth.status === 'connected'
  };
};
