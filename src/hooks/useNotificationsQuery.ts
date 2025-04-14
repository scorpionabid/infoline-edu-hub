
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  clearAllNotifications 
} from '@/services/notificationService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useNotificationsQuery = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Bildirişləri əldə et
  const {
    data: notifications = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => fetchNotifications(user?.id || ''),
    enabled: !!user?.id,
  });
  
  // Bildirişi oxunmuş kimi işarələ
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => markNotificationAsRead(notificationId, user?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    },
    onError: (error: any) => {
      toast({
        title: 'Xəta',
        description: 'Bildiriş oxunmuş kimi işarələnə bilmədi',
        variant: 'destructive'
      });
      console.error('Bildiriş oxunmuş kimi işarələnərkən xəta:', error);
    }
  });
  
  // Bütün bildirişləri oxunmuş kimi işarələ
  const markAllAsReadMutation = useMutation({
    mutationFn: () => markAllNotificationsAsRead(user?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      toast({
        title: 'Uğurlu əməliyyat',
        description: 'Bütün bildirişlər oxunmuş kimi işarələndi',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Xəta',
        description: 'Bildirişlər oxunmuş kimi işarələnə bilmədi',
        variant: 'destructive'
      });
      console.error('Bildirişlər oxunmuş kimi işarələnərkən xəta:', error);
    }
  });
  
  // Bütün bildirişləri təmizlə
  const clearAllMutation = useMutation({
    mutationFn: () => clearAllNotifications(user?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      toast({
        title: 'Uğurlu əməliyyat',
        description: 'Bütün bildirişlər təmizləndi',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Xəta',
        description: 'Bildirişlər təmizlənə bilmədi',
        variant: 'destructive'
      });
      console.error('Bildirişlər təmizlənərkən xəta:', error);
    }
  });
  
  // Oxunmamış bildirişlərin sayını hesabla
  const unreadCount = notifications.filter(notification => !notification.isRead).length;
  
  return {
    notifications,
    isLoading,
    error,
    refetch,
    unreadCount,
    markAsRead: (id: string) => markAsReadMutation.mutate(id),
    markAllAsRead: () => markAllAsReadMutation.mutate(),
    clearAll: () => clearAllMutation.mutate(),
    isMarkAsReadLoading: markAsReadMutation.isPending,
    isMarkAllAsReadLoading: markAllAsReadMutation.isPending,
    isClearAllLoading: clearAllMutation.isPending
  };
};
