
import { useState, useMemo } from 'react';
import { AppNotification } from '@/types/notification';

export interface NotificationFilters {
  searchTerm: string;
  type: string;
  priority: string;
  read: string;
}

export const useNotificationFilters = () => {
  const [filters, setFilters] = useState<NotificationFilters>({
    searchTerm: '',
    type: '',
    priority: '',
    read: 'all'
  });

  const [notifications] = useState<AppNotification[]>([]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      const matchesSearch = !filters.searchTerm || 
        notification.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        notification.message?.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      const matchesType = !filters.type || notification.type === filters.type;
      const matchesPriority = !filters.priority || notification.priority === filters.priority;
      const matchesRead = 
        filters.read === 'all' ||
        (filters.read === 'unread' && !notification.isRead) ||
        (filters.read === 'read' && notification.isRead);

      return matchesSearch && matchesType && matchesPriority && matchesRead;
    });
  }, [notifications, filters]);

  const updateFilter = (key: keyof NotificationFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      type: '',
      priority: '',
      read: 'all'
    });
  };

  const getFilterOptions = () => {
    const types = [...new Set(notifications.map(n => n.type).filter(Boolean))];
    const priorities = [...new Set(notifications.map(n => n.priority).filter(Boolean))];
    
    return { types, priorities };
  };

  return {
    filters,
    filteredNotifications,
    updateFilter,
    clearFilters,
    getFilterOptions
  };
};

export const useNotificationConnection = () => {
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connected');

  const handleReconnect = async () => {
    setConnectionStatus('connecting');
    // Mock reconnection
    await new Promise(resolve => setTimeout(resolve, 1000));
    setConnectionStatus('connected');
  };

  const getConnectionHealth = () => {
    return {
      health: 'excellent' as const,
      latency: 45,
      lastUpdate: new Date()
    };
  };

  return {
    connectionStatus,
    handleReconnect,
    getConnectionHealth
  };
};
