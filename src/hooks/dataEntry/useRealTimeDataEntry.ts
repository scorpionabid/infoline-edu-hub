import { useEffect, useRef, useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';

interface ConflictData {
  columnId: string;
  localValue: any;
  serverValue: any;
  lastModified: string;
  modifiedBy: string;
}

interface RealTimeUpdatePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  old: any;
  new: any;
  errors?: any;
}

interface UseRealTimeDataEntryOptions {
  categoryId: string;
  schoolId: string;
  userId?: string;
  onDataChange?: (payload: RealTimeUpdatePayload) => void;
  onConflict?: (conflictData: ConflictData) => void;
  onUserActivity?: (userId: string, action: string) => void;
  enabled?: boolean;
  conflictDetectionWindow?: number; // milliseconds
}

interface ConnectionStatus {
  isConnected: boolean;
  lastHeartbeat: number;
  reconnectAttempts: number;
  latency: number;
}

export const useRealTimeDataEntry = ({
  categoryId,
  schoolId,
  userId,
  onDataChange,
  onConflict,
  onUserActivity,
  enabled = true,
  conflictDetectionWindow = 5000 // 5 seconds
}: UseRealTimeDataEntryOptions) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  
  // Refs for managing subscriptions and state
  const channelRef = useRef<RealtimeChannel | null>(null);
  const presenceChannelRef = useRef<RealtimeChannel | null>(null);
  const lastUpdateTimeRef = useRef<number>(Date.now());
  const userActivityRef = useRef<Map<string, number>>(new Map());
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Connection status state
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    lastHeartbeat: 0,
    reconnectAttempts: 0,
    latency: 0
  });
  
  // Active users state for collaboration awareness
  const [activeUsers, setActiveUsers] = useState<Record<string, any>>({});
  const [isReconnecting, setIsReconnecting] = useState(false);

  // Handle real-time data updates with conflict detection
  const handleRealTimeUpdate = useCallback((payload: RealTimeUpdatePayload) => {
    console.group('Real-time Update Received');
    console.log('Payload:', payload);
    console.log('Event type:', payload.eventType);
    
    try {
      // Skip self-updates to prevent loops
      if (payload.new?.created_by === userId) {
        console.log('Skipping self-update');
        console.groupEnd();
        return;
      }
      
      // Conflict detection
      const updateTime = payload.new?.updated_at ? new Date(payload.new.updated_at).getTime() : Date.now();
      const timeDiff = Math.abs(updateTime - lastUpdateTimeRef.current);
      
      if (timeDiff < conflictDetectionWindow && payload.eventType === 'UPDATE') {
        console.warn('Potential conflict detected:', { timeDiff, conflictDetectionWindow });
        
        // Prepare conflict data
        const conflictData: ConflictData = {
          columnId: payload.new?.column_id || '',
          localValue: 'local_value', // This will be provided by the calling component
          serverValue: payload.new?.value,
          lastModified: payload.new?.updated_at || new Date().toISOString(),
          modifiedBy: payload.new?.created_by || 'unknown'
        };
        
        onConflict?.(conflictData);
        console.groupEnd();
        return;
      }
      
      // Normal update processing
      onDataChange?.(payload);
      
      // Update last modification time
      lastUpdateTimeRef.current = Date.now();
      
      // Show subtle notification for updates from other users
      if (payload.eventType === 'UPDATE' && payload.new?.created_by !== userId) {
        toast({
          title: t('dataUpdatedByOtherUser'),
          description: t('formDataSyncedFromServer'),
          duration: 2000,
        });
      }
      
    } catch (error) {
      console.error('Error processing real-time update:', error);
    } finally {
      console.groupEnd();
    }
  }, [userId, onDataChange, onConflict, conflictDetectionWindow, toast, t]);

  // Handle user presence updates
  const handlePresenceUpdate = useCallback((presenceState: any) => {
    console.log('Presence update:', presenceState);
    
    const users: Record<string, any> = {};
    
    Object.keys(presenceState).forEach(key => {
      const presence = presenceState[key];
      if (presence && presence.length > 0) {
        const user = presence[0];
        if (user.user_id !== userId) { // Don't include self
          users[user.user_id] = {
            ...user,
            lastSeen: new Date()
          };
        }
      }
    });
    
    setActiveUsers(users);
    
    // Notify about user activity
    Object.keys(users).forEach(id => {
      onUserActivity?.(id, 'active');
    });
  }, [userId, onUserActivity]);

  // Initialize heartbeat monitoring
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }
    
    heartbeatIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const timeSinceLastHeartbeat = now - connectionStatus.lastHeartbeat;
      
      // Update latency measurement
      setConnectionStatus(prev => ({
        ...prev,
        latency: timeSinceLastHeartbeat,
        lastHeartbeat: now
      }));
      
      // Check connection health
      if (timeSinceLastHeartbeat > 30000) { // 30 seconds
        console.warn('Connection appears stale, attempting reconnection');
        reconnectChannels();
      }
    }, 5000); // Check every 5 seconds
  }, [connectionStatus.lastHeartbeat]);

  // Reconnection logic with exponential backoff
  const reconnectChannels = useCallback(async () => {
    if (isReconnecting) return;
    
    setIsReconnecting(true);
    
    try {
      console.log('Attempting to reconnect real-time channels...');
      
      // Unsubscribe existing channels
      if (channelRef.current) {
        await channelRef.current.unsubscribe();
        channelRef.current = null;
      }
      
      if (presenceChannelRef.current) {
        await presenceChannelRef.current.unsubscribe();
        presenceChannelRef.current = null;
      }
      
      // Wait before reconnecting (exponential backoff)
      const backoffDelay = Math.min(1000 * Math.pow(2, connectionStatus.reconnectAttempts), 30000);
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
      
      // Reinitialize channels
      initializeChannels();
      
      setConnectionStatus(prev => ({
        ...prev,
        reconnectAttempts: prev.reconnectAttempts + 1
      }));
      
    } catch (error) {
      console.error('Reconnection failed:', error);
    } finally {
      setIsReconnecting(false);
    }
  }, [isReconnecting, connectionStatus.reconnectAttempts]);

  // Initialize real-time channels
  const initializeChannels = useCallback(() => {
    if (!enabled || !categoryId || !schoolId) {
      console.log('Real-time disabled or missing required params');
      return;
    }
    
    try {
      // Main data channel for data_entries updates
      const dataChannelName = `data_entry_${categoryId}_${schoolId}`;
      console.log('Initializing data channel:', dataChannelName);
      
      channelRef.current = supabase
        .channel(dataChannelName)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'data_entries',
          filter: `category_id=eq.${categoryId} AND school_id=eq.${schoolId}`
        }, (payload) => {
          handleRealTimeUpdate(payload as RealTimeUpdatePayload);
        })
        .subscribe((status) => {
          console.log('Data channel status:', status);
          
          setConnectionStatus(prev => ({
            ...prev,
            isConnected: status === 'SUBSCRIBED',
            lastHeartbeat: Date.now(),
            reconnectAttempts: status === 'SUBSCRIBED' ? 0 : prev.reconnectAttempts
          }));
          
          if (status === 'SUBSCRIBED') {
            startHeartbeat();
            toast({
              title: t('realTimeConnected'),
              description: t('collaborationEnabled'),
              duration: 2000,
            });
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Data channel error, attempting reconnection...');
            reconnectChannels();
          }
        });
      
      // Presence channel for user activity tracking
      const presenceChannelName = `presence_${categoryId}_${schoolId}`;
      console.log('Initializing presence channel:', presenceChannelName);
      
      presenceChannelRef.current = supabase
        .channel(presenceChannelName)
        .on('presence', { event: 'sync' }, () => {
          const presenceState = presenceChannelRef.current?.presenceState();
          handlePresenceUpdate(presenceState || {});
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('User joined:', key, newPresences);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('User left:', key, leftPresences);
        })
        .subscribe(async (status) => {
          console.log('Presence channel status:', status);
          
          if (status === 'SUBSCRIBED' && userId) {
            // Track current user presence
            await presenceChannelRef.current?.track({
              user_id: userId,
              online_at: new Date().toISOString(),
              category_id: categoryId,
              school_id: schoolId
            });
          }
        });
        
    } catch (error) {
      console.error('Error initializing real-time channels:', error);
      toast({
        title: t('error'),
        description: t('realTimeConnectionFailed'),
        variant: 'destructive'
      });
    }
  }, [enabled, categoryId, schoolId, userId, handleRealTimeUpdate, handlePresenceUpdate, startHeartbeat, reconnectChannels, toast, t]);

  // Main effect for channel management
  useEffect(() => {
    initializeChannels();
    
    return () => {
      console.log('Cleaning up real-time channels...');
      
      // Clear heartbeat
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      
      // Unsubscribe from channels
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
      
      if (presenceChannelRef.current) {
        presenceChannelRef.current.unsubscribe();
        presenceChannelRef.current = null;
      }
      
      setConnectionStatus({
        isConnected: false,
        lastHeartbeat: 0,
        reconnectAttempts: 0,
        latency: 0
      });
    };
  }, [initializeChannels]);

  // Update timestamp when user makes changes (prevents self-conflicts)
  const updateTimestamp = useCallback(() => {
    lastUpdateTimeRef.current = Date.now();
  }, []);

  // Manual reconnection trigger
  const reconnect = useCallback(() => {
    reconnectChannels();
  }, [reconnectChannels]);

  // Get connection statistics
  const getConnectionStats = useCallback(() => {
    return {
      isConnected: connectionStatus.isConnected,
      activeUsers: Object.keys(activeUsers).length,
      latency: connectionStatus.latency,
      reconnectAttempts: connectionStatus.reconnectAttempts,
      isReconnecting
    };
  }, [connectionStatus, activeUsers, isReconnecting]);

  return {
    // Connection management
    connectionStatus,
    isConnected: connectionStatus.isConnected,
    isReconnecting,
    reconnect,
    
    // User presence
    activeUsers,
    activeUserCount: Object.keys(activeUsers).length,
    
    // Utilities
    updateTimestamp,
    getConnectionStats,
    
    // Internal state (for debugging)
    _debug: {
      channelConnected: channelRef.current?.state === 'joined',
      presenceConnected: presenceChannelRef.current?.state === 'joined',
      lastUpdateTime: lastUpdateTimeRef.current
    }
  };
};

export default useRealTimeDataEntry;