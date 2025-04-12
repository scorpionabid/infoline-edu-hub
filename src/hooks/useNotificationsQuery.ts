
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/services/notificationService';
import { Notification } from '@/types/notifications';
import { useAuth } from '@/context/auth';
import { toast } from 'sonner';

export const useNotificationsQuery = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Bildirişlər sorğusunu almaq üçün
  const { data: notifications = [], isLoading: loading, error } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: fetchNotifications,
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 dəqiqə
    refetchOnWindowFocus: true
  });
  
  // Oxunmamış bildirişlərin sayını hesablayaq
  const unreadCount = notifications.filter(notification => !notification.isRead).length;
  
  // Bildirişi oxunmuş kimi işarələmək üçün mutation
  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: (_, notificationId) => {
      queryClient.setQueryData(['notifications', user?.id], (old: Notification[] | undefined) => {
        if (!old) return [];
        return old.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true } 
            : notification
        );
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });
  
  // Bütün bildirişləri oxunmuş kimi işarələmək üçün mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.setQueryData(['notifications', user?.id], (old: Notification[] | undefined) => {
        if (!old) return [];
        return old.map(notification => ({ ...notification, isRead: true }));
      });
      
      toast.success('Bütün bildirişlər oxundu kimi işarələndi');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });
  
  // Bildirişlər komponentində istifadə üçün
  const markAsRead = async (notificationId: string) => {
    await markAsReadMutation.mutateAsync(notificationId);
  };
  
  const markAllAsRead = async () => {
    await markAllAsReadMutation.mutateAsync();
  };
  
  // Bildirişləri silmək üçün (gələcək implementasiya)
  const clearAll = async () => {
    // Gələcək implementasiya
    toast.info('Bu funksionallıq hələ implementasiya edilməyib');
  };
  
  return {
    notifications,
    unreadCount,
    loading,
    error: error instanceof Error ? error.message : null,
    markAsRead,
    markAllAsRead,
    clearAll
  };
};
