import { useState, useEffect } from 'react';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { useLanguage } from '@/context/LanguageContext';
import { createDeadlineNotification } from '@/services/notificationService';

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
      
      await createDeadlineNotification(title, message, categoryId);
      
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
