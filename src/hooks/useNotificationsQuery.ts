
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/auth';
import { getUserNotifications } from '@/services/notificationService';
import { useState } from 'react';

export function useNotificationsQuery() {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  
  const {
    data: notifications,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('User ID is missing');
      }
      
      try {
        return await getUserNotifications(user.id);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications');
        throw err;
      }
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2
  });

  return {
    notifications: notifications || [],
    isLoading,
    refetch,
    error
  };
}

export default useNotificationsQuery;
