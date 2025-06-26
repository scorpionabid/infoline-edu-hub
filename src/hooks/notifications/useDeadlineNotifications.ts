
import { useState, useEffect } from 'react';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { useLanguage } from '@/context/LanguageContext';
import { notificationManager } from '@/notifications/notificationManager';

export const useDeadlineNotifications = () => {
  const user = useAuthStore(selectUser);
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const createNotification = async (categoryId: string, daysLeft: number) => {
    if (!user) return false;

    setLoading(true);
    try {
      const title = t('deadlineNotificationTitle');
      const message = t('deadlineNotificationBody', { days: daysLeft });
      
      notificationManager.add({
        user_id: user.id,
        title,
        message,
        type: 'deadline',
        is_read: false,
        priority: 'high',
        created_at: new Date().toISOString(),
        related_entity_id: categoryId,
        related_entity_type: 'category'
      });
      
      return true;
    } catch (error) {
      console.error('Error creating deadline notification:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createNotification
  };
};

export default useDeadlineNotifications;
