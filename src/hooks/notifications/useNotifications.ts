
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationService, Notification } from '@/services/api/notificationService';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { useToast } from '@/hooks/use-toast';

export interface UseNotificationsResult {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (notificationIds: string[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => void;
}

export const useNotifications = (): UseNotificationsResult => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch notifications
  const { 
    data: notifications = [], 
    isLoading 
  } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => NotificationService.getUserNotifications(user?.id || ''),
    enabled: !!user?.id,
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  // Get unread count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications-unread-count', user?.id],
    queryFn: () => NotificationService.getUnreadCount(user?.id || ''),
    enabled: !!user?.id,
    refetchInterval: 30000
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: NotificationService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
    onError: () => {
      toast({
        title: 'Xəta',
        description: 'Bildirişlər yenilənmədi',
        variant: 'destructive'
      });
    }
  });

  const markAsRead = async (notificationIds: string[]) => {
    await markAsReadMutation.mutateAsync(notificationIds);
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications
      .filter(notification => !notification.isRead)
      .map(notification => notification.id);
    
    if (unreadIds.length > 0) {
      await markAsReadMutation.mutateAsync(unreadIds);
    }
  };

  const refreshNotifications = () => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refreshNotifications
  };
};

export default useNotifications;
