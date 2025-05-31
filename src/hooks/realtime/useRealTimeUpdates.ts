
import { useEffect, useCallback, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealTimeUpdatesProps {
  tableName: string;
  filter?: {
    column: string;
    value: any;
  };
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
}

export const useRealTimeUpdates = ({
  tableName,
  filter,
  onInsert,
  onUpdate,
  onDelete
}: UseRealTimeUpdatesProps) => {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('DISCONNECTED');
  const [lastReconnectAttempt, setLastReconnectAttempt] = useState<number>(0);
  const callbacksRef = useRef({ onInsert, onUpdate, onDelete });
  
  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = { onInsert, onUpdate, onDelete };
  }, [onInsert, onUpdate, onDelete]);
  
  const setupChannel = useCallback(() => {
    // Prevent frequent reconnection attempts
    const now = Date.now();
    if (now - lastReconnectAttempt < 3000) {
      console.log('Skipping reconnection attempt - too soon');
      return channelRef.current;
    }
    
    setLastReconnectAttempt(now);
    
    // Remove existing channel if any
    if (channelRef.current) {
      try {
        supabase.removeChannel(channelRef.current);
      } catch (err) {
        console.warn('Error removing existing channel:', err);
      }
    }
    
    // Base channel configuration
    const channelConfig = {
      event: '*',
      schema: 'public',
      table: tableName
    } as any;

    // Add filter if provided
    if (filter) {
      channelConfig.filter = `${filter.column}=eq.${filter.value}`;
    }

    // Create new channel
    try {
      const channelName = `realtime-${tableName}-${now}`;
      const channel = supabase
        .channel(channelName)
        .on('postgres_changes', channelConfig, (payload) => {
          if (connectionStatus !== 'SUBSCRIBED') return; // Skip if not properly subscribed
          
          console.log('Real-time update received:', payload);
          
          switch (payload.eventType) {
            case 'INSERT':
              callbacksRef.current.onInsert?.(payload);
              break;
            case 'UPDATE':
              callbacksRef.current.onUpdate?.(payload);
              break;
            case 'DELETE':
              callbacksRef.current.onDelete?.(payload);
              break;
          }
        })
        .subscribe((status) => {
          console.log(`Real-time subscription status for ${tableName}:`, status);
          setConnectionStatus(status);
          
          // Handle reconnection if needed
          if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            // Attempt reconnect with exponential backoff
            const backoffDelay = Math.min(1000 * Math.pow(2, Math.floor((now - lastReconnectAttempt) / 3000)), 30000);
            
            console.log(`WebSocket connection ${status}, will retry in ${backoffDelay}ms`);
            
            const reconnectTimer = setTimeout(() => {
              setupChannel();
            }, backoffDelay);
            
            return () => clearTimeout(reconnectTimer);
          }
        });
        
      channelRef.current = channel;
      return channel;
    } catch (err) {
      console.error('Error setting up real-time channel:', err);
      return null;
    }
  }, [tableName, filter, connectionStatus, lastReconnectAttempt]);

  useEffect(() => {
    const channel = setupChannel();
    
    return () => {
      if (channelRef.current) {
        try {
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
          setConnectionStatus('DISCONNECTED');
        } catch (err) {
          console.warn('Error cleaning up channel:', err);
        }
      }
    };
  }, [setupChannel]);
};

// Specific hook for data entries with debouncing
export const useDataEntryRealTime = (schoolId: string, onUpdate: (data: any) => void) => {
  // Debounce the update callback to prevent excessive renders
  const debouncedCallback = useCallback(
    ((data: any) => {
      // Create debounce mechanism using refs to avoid recreating the function
      let timeoutId: number | null = null;
      
      return (payload: any) => {
        if (timeoutId !== null) {
          clearTimeout(timeoutId);
        }
        
        timeoutId = window.setTimeout(() => {
          onUpdate(payload);
          timeoutId = null;
        }, 500); // 500ms debounce
      };
    })({}),
    [onUpdate]
  );
  
  // Only create a new subscription if schoolId is valid
  if (!schoolId) {
    console.log('No schoolId provided for real-time updates');
    return;
  }
  
  return useRealTimeUpdates({
    tableName: 'data_entries',
    filter: {
      column: 'school_id',
      value: schoolId
    },
    onInsert: debouncedCallback,
    onUpdate: debouncedCallback,
    onDelete: debouncedCallback
  });
};

// Specific hook for approval updates with improved behavior
export const useApprovalRealTime = (onUpdate: (data: any) => void) => {
  // Create a stable filter callback that only triggers on status changes
  const statusChangeFilter = useCallback(
    (payload: any) => {
      // Only trigger on status changes to avoid unnecessary updates
      if (payload.new?.status !== payload.old?.status) {
        // Debounce status updates
        setTimeout(() => {
          onUpdate(payload);
        }, 300);
      }
    },
    [onUpdate]
  );
  
  return useRealTimeUpdates({
    tableName: 'data_entries',
    onUpdate: statusChangeFilter
  });
};
