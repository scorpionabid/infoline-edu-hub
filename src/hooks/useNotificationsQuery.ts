
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead, clearAllNotifications } from '@/services/notificationService';
import { Notification } from '@/types/notification';

export const useNotificationsQuery = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  // Bildirişləri əldə etmək üçün sorğu
  const { data: notifications = [], isLoading, error } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: async ({ queryKey }) => {
      // Sorğu kontekstindən userId-ni alırıq
      const [_, userId] = queryKey;
      if (!userId) return [];
      return fetchNotifications(userId as string);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000 // 5 dəqiqə
  });

  // Bildirişi oxunmuş kimi işarələmək üçün mutasiya
  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    }
  });

  // Bütün bildirişləri oxunmuş kimi işarələmək üçün mutasiya
  const markAllAsReadMutation = useMutation({
    mutationFn: () => {
      if (!userId) return Promise.resolve(false);
      return markAllNotificationsAsRead(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    }
  });

  // Bütün bildirişləri silmək üçün mutasiya
  const clearAllMutation = useMutation({
    mutationFn: () => {
      if (!userId) return Promise.resolve(false);
      return clearAllNotifications(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    }
  });

  return {
    notifications,
    isLoading,
    error,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    clearAll: clearAllMutation.mutate
  };
};
