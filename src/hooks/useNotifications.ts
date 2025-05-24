
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/common/useToast';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message?: string;
  is_read: boolean;
  priority: string;
  related_entity_id?: string;
  related_entity_type?: string;
  created_at: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const { error } = useToast();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data, error: dbError } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (dbError) throw dbError;
      setNotifications(data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      error('Bildirişlər yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error: dbError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (dbError) throw dbError;
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true }
            : notif
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return {
    notifications,
    loading,
    markAsRead,
    refetch: fetchNotifications
  };
};

export default useNotifications;
