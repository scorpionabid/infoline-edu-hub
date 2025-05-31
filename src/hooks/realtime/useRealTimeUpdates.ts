
import { useEffect, useCallback } from 'react';
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
  
  const setupChannel = useCallback(() => {
    let channel: RealtimeChannel;

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

    channel = supabase
      .channel(`realtime-${tableName}`)
      .on('postgres_changes', channelConfig, (payload) => {
        console.log('Real-time update received:', payload);
        
        switch (payload.eventType) {
          case 'INSERT':
            onInsert?.(payload);
            break;
          case 'UPDATE':
            onUpdate?.(payload);
            break;
          case 'DELETE':
            onDelete?.(payload);
            break;
        }
      })
      .subscribe((status) => {
        console.log(`Real-time subscription status for ${tableName}:`, status);
      });

    return channel;
  }, [tableName, filter, onInsert, onUpdate, onDelete]);

  useEffect(() => {
    const channel = setupChannel();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [setupChannel]);
};

// Specific hook for data entries
export const useDataEntryRealTime = (schoolId: string, onUpdate: (data: any) => void) => {
  return useRealTimeUpdates({
    tableName: 'data_entries',
    filter: {
      column: 'school_id',
      value: schoolId
    },
    onInsert: onUpdate,
    onUpdate: onUpdate,
    onDelete: onUpdate
  });
};

// Specific hook for approval updates
export const useApprovalRealTime = (onUpdate: (data: any) => void) => {
  return useRealTimeUpdates({
    tableName: 'data_entries',
    onUpdate: (payload) => {
      // Only trigger on status changes
      if (payload.new?.status !== payload.old?.status) {
        onUpdate(payload);
      }
    }
  });
};
