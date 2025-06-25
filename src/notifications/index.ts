import { useState, useCallback, useEffect } from 'react';
import { notificationManager, UnifiedNotification } from './notificationManager';

export interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  deadline_reminders: '3_1' | '1' | 'none';
  digest_frequency: 'immediate' | 'daily' | 'weekly';
}

export interface NotificationStats {
  total: number;
  unread: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
}

export const useNotifications = (userId?: string) => {
  const [notifications, setNotifications] = useState<UnifiedNotification[]>([]);

  useEffect(() => {
    // Simulate fetching notifications for a user
    const initialNotifications = notificationManager.getAll().filter(n => n.userId === userId);
    setNotifications(initialNotifications);

    // Subscribe to notification changes
    const handleNotificationChange = () => {
      const updatedNotifications = notificationManager.getAll().filter(n => n.userId === userId);
      setNotifications(updatedNotifications);
    };

    // You might need a more robust event system
    return () => {
      // Clean up the subscription
    };
  }, [userId]);

  const addNotification = useCallback((notification: Omit<UnifiedNotification, 'id' | 'timestamp'>) => {
    const newNotification = notificationManager.add(notification);
    setNotifications(prev => [...prev, newNotification]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    notificationManager.remove(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    notificationManager.clear();
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications
  };
};

export { notificationManager, UnifiedNotification };

export const useNotificationPreferences = (userId?: string) => {
  const [preferences, setPreferences] = useState({
    email_notifications: true,
    push_notifications: false,
    deadline_reminders: '3_1' as '3_1' | '1' | 'none',
    digest_frequency: 'immediate' as 'immediate' | 'daily' | 'weekly'
  });

  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isTestingNotification, setIsTestingNotification] = useState(false);

  const toggleEmailNotifications = useCallback(async (enabled: boolean) => {
    setIsUpdating(true);
    try {
      setPreferences(prev => ({ ...prev, email_notifications: enabled }));
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const togglePushNotifications = useCallback(async (enabled: boolean) => {
    setIsUpdating(true);
    try {
      setPreferences(prev => ({ ...prev, push_notifications: enabled }));
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const updateDeadlineReminders = useCallback(async (value: '3_1' | '1' | 'none') => {
    setIsUpdating(true);
    try {
      setPreferences(prev => ({ ...prev, deadline_reminders: value }));
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const updateDigestFrequency = useCallback(async (value: 'immediate' | 'daily' | 'weekly') => {
    setIsUpdating(true);
    try {
      setPreferences(prev => ({ ...prev, digest_frequency: value }));
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const resetToDefaults = useCallback(async () => {
    setIsUpdating(true);
    try {
      setPreferences({
        email_notifications: true,
        push_notifications: false,
        deadline_reminders: '3_1',
        digest_frequency: 'immediate'
      });
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const sendTestNotification = useCallback(async () => {
    setIsTestingNotification(true);
    try {
      notificationManager.add({
        title: 'Test Notification',
        message: 'This is a test notification',
        type: 'info'
      });
    } finally {
      setIsTestingNotification(false);
    }
  }, []);

  const canReceiveEmail = preferences.email_notifications;
  const canReceivePush = preferences.push_notifications;
  const deadlineRemindersEnabled = preferences.deadline_reminders !== 'none';

  return {
    preferences,
    stats,
    isLoading,
    toggleEmailNotifications,
    togglePushNotifications,
    updateDeadlineReminders,
    updateDigestFrequency,
    resetToDefaults,
    sendTestNotification,
    isUpdating,
    isTestingNotification,
    canReceiveEmail,
    canReceivePush,
    deadlineRemindersEnabled
  };
};
