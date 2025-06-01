import { useState, useEffect, useCallback } from 'react';
import { useEnhancedNotifications } from '@/context/EnhancedNotificationContext';
import { DeadlineSchedulerService } from '@/services/notifications/scheduler/deadlineScheduler';
import { NotificationTemplateService } from '@/services/notifications/templates/templateService';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';

/**
 * Hook for managing deadline notifications
 */
export const useEnhancedDeadlineNotifications = () => {
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState<any>(null);
  const user = useAuthStore(selectUser);

  // Get deadline statistics
  const getDeadlineStatistics = useCallback(async () => {
    try {
      setLoading(true);
      const stats = await DeadlineSchedulerService.getDeadlineStatistics();
      setStatistics(stats);
      return stats;
    } catch (error) {
      console.error('Error getting deadline statistics:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Check upcoming deadlines manually
  const checkUpcomingDeadlines = useCallback(async () => {
    try {
      setLoading(true);
      const result = await DeadlineSchedulerService.checkUpcomingDeadlines();
      return result;
    } catch (error) {
      console.error('Error checking upcoming deadlines:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Schedule deadline notifications for a category
  const scheduleDeadlineNotifications = useCallback(async (categoryId: string) => {
    try {
      setLoading(true);
      await DeadlineSchedulerService.scheduleDeadlineNotifications(categoryId);
    } catch (error) {
      console.error('Error scheduling deadline notifications:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Run deadline check job
  const runDeadlineCheckJob = useCallback(async () => {
    try {
      setLoading(true);
      const result = await DeadlineSchedulerService.runDeadlineCheckJob();
      return result;
    } catch (error) {
      console.error('Error running deadline check job:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load statistics on mount
  useEffect(() => {
    getDeadlineStatistics();
  }, [getDeadlineStatistics]);

  return {
    loading,
    statistics,
    getDeadlineStatistics,
    checkUpcomingDeadlines,
    scheduleDeadlineNotifications,
    runDeadlineCheckJob
  };
};

/**
 * Hook for managing notification templates
 */
export const useNotificationTemplates = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch all templates
  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const templateList = await NotificationTemplateService.getAllTemplates();
      setTemplates(templateList);
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Get template by name
  const getTemplateByName = useCallback(async (name: string) => {
    try {
      return await NotificationTemplateService.getTemplateByName(name);
    } catch (error) {
      console.error('Error getting template by name:', error);
      throw error;
    }
  }, []);

  // Create custom template
  const createTemplate = useCallback(async (template: any) => {
    try {
      setLoading(true);
      const templateId = await NotificationTemplateService.createCustomTemplate(template);
      await fetchTemplates(); // Refresh templates
      return templateId;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchTemplates]);

  // Update template
  const updateTemplate = useCallback(async (id: string, updates: any) => {
    try {
      setLoading(true);
      await NotificationTemplateService.updateTemplate(id, updates);
      await fetchTemplates(); // Refresh templates
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchTemplates]);

  // Deactivate template
  const deactivateTemplate = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await NotificationTemplateService.deactivateTemplate(id);
      await fetchTemplates(); // Refresh templates
    } catch (error) {
      console.error('Error deactivating template:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchTemplates]);

  // Render template with data
  const renderTemplate = useCallback(async (templateId: string, data: any) => {
    try {
      return await NotificationTemplateService.renderTemplate(templateId, data);
    } catch (error) {
      console.error('Error rendering template:', error);
      throw error;
    }
  }, []);

  // Validate template syntax
  const validateTemplate = useCallback((template: string) => {
    return NotificationTemplateService.validateTemplate(template);
  }, []);

  // Extract template variables
  const extractVariables = useCallback((template: string) => {
    return NotificationTemplateService.extractTemplateVariables(template);
  }, []);

  // Initialize default templates
  const initializeDefaults = useCallback(async () => {
    try {
      setLoading(true);
      await NotificationTemplateService.initializeDefaultTemplates();
      await fetchTemplates();
    } catch (error) {
      console.error('Error initializing default templates:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchTemplates]);

  // Load templates on mount
  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    getTemplateByName,
    createTemplate,
    updateTemplate,
    deactivateTemplate,
    renderTemplate,
    validateTemplate,
    extractVariables,
    initializeDefaults
  };
};

/**
 * Hook for notification analytics
 */
export const useNotificationAnalytics = (startDate?: Date, endDate?: Date) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { getAnalytics } = useEnhancedNotifications();

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAnalytics();
      setAnalytics(data);
      return data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getAnalytics]);

  // Get analytics for specific period
  const getAnalyticsForPeriod = useCallback(async (start: Date, end: Date) => {
    try {
      setLoading(true);
      // This would call a more specific analytics function
      const data = await getAnalytics();
      setAnalytics(data);
      return data;
    } catch (error) {
      console.error('Error fetching period analytics:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getAnalytics]);

  // Load analytics on mount
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    fetchAnalytics,
    getAnalyticsForPeriod
  };
};

/**
 * Hook for notification preferences
 */
export const useNotificationPreferences = () => {
  const { preferences, updatePreferences } = useEnhancedNotifications();
  const [loading, setLoading] = useState(false);

  // Update email preferences
  const updateEmailPreferences = useCallback(async (emailPrefs: any) => {
    try {
      setLoading(true);
      await updatePreferences({
        email_enabled: emailPrefs.enabled,
        category_preferences: {
          ...preferences.category_preferences,
          ...emailPrefs.types
        }
      });
    } catch (error) {
      console.error('Error updating email preferences:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [preferences, updatePreferences]);

  // Update deadline reminder preferences
  const updateDeadlinePreferences = useCallback(async (deadlinePrefs: string) => {
    try {
      setLoading(true);
      await updatePreferences({
        deadline_reminders: deadlinePrefs
      });
    } catch (error) {
      console.error('Error updating deadline preferences:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [updatePreferences]);

  // Update digest frequency
  const updateDigestFrequency = useCallback(async (frequency: string) => {
    try {
      setLoading(true);
      await updatePreferences({
        digest_frequency: frequency
      });
    } catch (error) {
      console.error('Error updating digest frequency:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [updatePreferences]);

  // Toggle specific notification type
  const toggleNotificationType = useCallback(async (type: string, enabled: boolean) => {
    try {
      setLoading(true);
      await updatePreferences({
        category_preferences: {
          ...preferences.category_preferences,
          [type]: enabled
        }
      });
    } catch (error) {
      console.error('Error toggling notification type:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [preferences, updatePreferences]);

  return {
    preferences,
    loading,
    updateEmailPreferences,
    updateDeadlinePreferences,
    updateDigestFrequency,
    toggleNotificationType
  };
};

/**
 * Hook for real-time connection management
 */
export const useNotificationConnection = () => {
  const { connectionStatus, reconnect } = useEnhancedNotifications();
  const [reconnecting, setReconnecting] = useState(false);

  // Manual reconnect with loading state
  const handleReconnect = useCallback(async () => {
    try {
      setReconnecting(true);
      await reconnect();
    } catch (error) {
      console.error('Error during reconnect:', error);
      throw error;
    } finally {
      setReconnecting(false);
    }
  }, [reconnect]);

  // Get connection health
  const getConnectionHealth = useCallback(() => {
    const { isConnected, status, reconnectCount, lastReconnectAttempt } = connectionStatus;
    
    let health: 'excellent' | 'good' | 'poor' | 'disconnected';
    
    if (!isConnected) {
      health = 'disconnected';
    } else if (reconnectCount === 0) {
      health = 'excellent';
    } else if (reconnectCount <= 2) {
      health = 'good';
    } else {
      health = 'poor';
    }
    
    return {
      health,
      isConnected,
      status,
      reconnectCount,
      lastReconnectAttempt
    };
  }, [connectionStatus]);

  return {
    connectionStatus,
    reconnecting,
    handleReconnect,
    getConnectionHealth
  };
};

/**
 * Hook for filtering and searching notifications
 */
export const useNotificationFilters = () => {
  const { notifications, getNotificationsByType, getNotificationsByPriority } = useEnhancedNotifications();
  const [filters, setFilters] = useState({
    type: '',
    priority: '',
    read: 'all', // 'read', 'unread', 'all'
    searchTerm: ''
  });

  // Filter notifications based on current filters
  const filteredNotifications = useCallback(() => {
    let filtered = notifications;

    // Filter by type
    if (filters.type) {
      filtered = getNotificationsByType(filters.type);
    }

    // Filter by priority
    if (filters.priority) {
      filtered = getNotificationsByPriority(filters.priority);
    }

    // Filter by read status
    if (filters.read === 'read') {
      filtered = filtered.filter(n => n.isRead || n.is_read);
    } else if (filters.read === 'unread') {
      filtered = filtered.filter(n => !(n.isRead || n.is_read));
    }

    // Filter by search term
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchLower) ||
        (n.message && n.message.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [notifications, filters, getNotificationsByType, getNotificationsByPriority]);

  // Update specific filter
  const updateFilter = useCallback((key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      type: '',
      priority: '',
      read: 'all',
      searchTerm: ''
    });
  }, []);

  // Get unique filter options
  const getFilterOptions = useCallback(() => {
    const types = [...new Set(notifications.map(n => n.type).filter(Boolean))];
    const priorities = [...new Set(notifications.map(n => n.priority).filter(Boolean))];
    
    return { types, priorities };
  }, [notifications]);

  return {
    filters,
    filteredNotifications: filteredNotifications(),
    updateFilter,
    clearFilters,
    getFilterOptions
  };
};

export default {
  useEnhancedDeadlineNotifications,
  useNotificationTemplates,
  useNotificationAnalytics,
  useNotificationPreferences,
  useNotificationConnection,
  useNotificationFilters
};
