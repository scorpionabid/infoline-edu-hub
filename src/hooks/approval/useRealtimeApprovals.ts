
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';

interface UseRealtimeApprovalsOptions {
  onDataChange?: () => void;
  userId?: string;
}

export const useRealtimeApprovals = (options: UseRealtimeApprovalsOptions = {}) => {
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleRealtimeUpdate = useCallback((payload: any) => {
    console.log('Real-time approval update:', payload);
    
    // Notify user of changes
    if (payload.eventType === 'UPDATE') {
      const { new: newRecord, old: oldRecord } = payload;
      
      if (newRecord.status !== oldRecord.status) {
        let message = '';
        switch (newRecord.status) {
          case 'approved':
            message = t('dataApproved');
            break;
          case 'rejected':
            message = t('dataRejected');
            break;
          case 'pending':
            message = t('dataReturned');
            break;
        }
        
        if (message) {
          toast({
            title: t('statusUpdate'),
            description: message,
          });
        }
      }
    }
    
    // Trigger data refresh
    options.onDataChange?.();
  }, [options.onDataChange, toast, t]);

  useEffect(() => {
    // Subscribe to data_entries changes
    const dataEntriesChannel = supabase
      .channel('data-entries-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'data_entries'
        },
        handleRealtimeUpdate
      );

    // Subscribe to notifications
    const notificationsChannel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: options.userId ? `user_id=eq.${options.userId}` : undefined
        },
        (payload) => {
          const notification = payload.new;
          if (notification.type === 'approval') {
            toast({
              title: notification.title,
              description: notification.message,
            });
          }
        }
      );

    // Subscribe to channels
    dataEntriesChannel.subscribe();
    notificationsChannel.subscribe();

    return () => {
      supabase.removeChannel(dataEntriesChannel);
      supabase.removeChannel(notificationsChannel);
    };
  }, [handleRealtimeUpdate, options.userId]);

  return {
    // Return any needed utilities
  };
};
