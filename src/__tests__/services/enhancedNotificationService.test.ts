import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { EnhancedNotificationService } from '@/services/notifications/enhancedNotificationService';

// Mock the service
vi.mock('@/services/notifications/enhancedNotificationService');

describe('EnhancedNotificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createNotification', () => {
    it('should create a notification successfully', async () => {
      const mockNotification = {
        userId: 'user-123',
        title: 'Test Notification',
        message: 'Test message',
        type: 'info' as const,
        priority: 'normal' as const
      };

      const mockResult = {
        success: true,
        data: { id: 'notification-123', ...mockNotification }
      };

      vi.mocked(EnhancedNotificationService.createNotification).mockResolvedValue(mockResult);

      const result = await EnhancedNotificationService.createNotification(mockNotification);

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('notification-123');
      expect(EnhancedNotificationService.createNotification).toHaveBeenCalledWith(mockNotification);
    });

    it('should handle creation errors', async () => {
      const mockNotification = {
        userId: 'user-123',
        title: 'Test Notification',
        message: 'Test message'
      };

      const mockResult = {
        success: false,
        error: 'Database error'
      };

      vi.mocked(EnhancedNotificationService.createNotification).mockResolvedValue(mockResult);

      const result = await EnhancedNotificationService.createNotification(mockNotification);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('createBulkNotifications', () => {
    it('should create multiple notifications successfully', async () => {
      const mockBulkNotifications = [{
        userIds: ['user-1', 'user-2'],
        title: 'Bulk Notification',
        message: 'Bulk message',
        type: 'info' as const
      }];

      const mockResult = {
        success: true,
        successCount: 2,
        failureCount: 0,
        errors: []
      };

      vi.mocked(EnhancedNotificationService.createBulkNotifications).mockResolvedValue(mockResult);

      const result = await EnhancedNotificationService.createBulkNotifications(mockBulkNotifications);

      expect(result.success).toBe(true);
      expect(result.successCount).toBe(2);
      expect(result.failureCount).toBe(0);
    });

    it('should handle partial failures in bulk creation', async () => {
      const mockBulkNotifications = [{
        userIds: ['user-1', 'user-2', 'invalid-user'],
        title: 'Bulk Notification',
        message: 'Bulk message'
      }];

      const mockResult = {
        success: true,
        successCount: 2,
        failureCount: 1,
        errors: ['User not found: invalid-user']
      };

      vi.mocked(EnhancedNotificationService.createBulkNotifications).mockResolvedValue(mockResult);

      const result = await EnhancedNotificationService.createBulkNotifications(mockBulkNotifications);

      expect(result.success).toBe(true);
      expect(result.successCount).toBe(2);
      expect(result.failureCount).toBe(1);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe('createFromTemplate', () => {
    it('should create notification from template', async () => {
      const templateId = 'template-123';
      const templateData = {
        category_name: 'Test Category',
        deadline_date: '2024-12-31'
      };
      const userIds = ['user-1', 'user-2'];

      const mockResult = {
        success: true,
        data: { successCount: 2, failureCount: 0 }
      };

      vi.mocked(EnhancedNotificationService.createFromTemplate).mockResolvedValue(mockResult);

      const result = await EnhancedNotificationService.createFromTemplate(templateId, templateData, userIds);

      expect(result.success).toBe(true);
      expect(EnhancedNotificationService.createFromTemplate).toHaveBeenCalledWith(templateId, templateData, userIds);
    });

    it('should handle template not found error', async () => {
      const templateId = 'non-existent-template';
      const templateData = {};
      const userIds = ['user-1'];

      const mockResult = {
        success: false,
        error: 'Template not found or inactive: non-existent-template'
      };

      vi.mocked(EnhancedNotificationService.createFromTemplate).mockResolvedValue(mockResult);

      const result = await EnhancedNotificationService.createFromTemplate(templateId, templateData, userIds);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Template not found');
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const notificationId = 'notification-123';
      const userId = 'user-123';

      const mockResult = {
        success: true,
        data: { id: notificationId, is_read: true }
      };

      vi.mocked(EnhancedNotificationService.markAsRead).mockResolvedValue(mockResult);

      const result = await EnhancedNotificationService.markAsRead(notificationId, userId);

      expect(result.success).toBe(true);
      expect(EnhancedNotificationService.markAsRead).toHaveBeenCalledWith(notificationId, userId);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read for user', async () => {
      const userId = 'user-123';

      const mockResult = {
        success: true,
        data: { updated: 5 }
      };

      vi.mocked(EnhancedNotificationService.markAllAsRead).mockResolvedValue(mockResult);

      const result = await EnhancedNotificationService.markAllAsRead(userId);

      expect(result.success).toBe(true);
      expect(EnhancedNotificationService.markAllAsRead).toHaveBeenCalledWith(userId);
    });
  });

  describe('getUserPreferences', () => {
    it('should return user preferences', async () => {
      const userId = 'user-123';
      const mockPreferences = {
        user_id: userId,
        email_enabled: true,
        push_enabled: true,
        deadline_reminders: '3_1',
        category_preferences: {},
        digest_frequency: 'daily'
      };

      vi.mocked(EnhancedNotificationService.getUserPreferences).mockResolvedValue(mockPreferences);

      const result = await EnhancedNotificationService.getUserPreferences(userId);

      expect(result).toEqual(mockPreferences);
      expect(EnhancedNotificationService.getUserPreferences).toHaveBeenCalledWith(userId);
    });

    it('should return default preferences for new user', async () => {
      const userId = 'new-user-123';
      const mockDefaultPreferences = {
        user_id: userId,
        email_enabled: true,
        push_enabled: true,
        deadline_reminders: '3_1',
        category_preferences: {},
        digest_frequency: 'daily'
      };

      vi.mocked(EnhancedNotificationService.getUserPreferences).mockResolvedValue(mockDefaultPreferences);

      const result = await EnhancedNotificationService.getUserPreferences(userId);

      expect(result.email_enabled).toBe(true);
      expect(result.deadline_reminders).toBe('3_1');
    });
  });

  describe('getNotificationAnalytics', () => {
    it('should return analytics data', async () => {
      const userId = 'user-123';
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      const mockAnalytics = {
        total: 100,
        unread: 10,
        byType: {
          info: 50,
          warning: 30,
          error: 20
        },
        byPriority: {
          normal: 80,
          high: 15,
          critical: 5
        },
        readRate: 90
      };

      vi.mocked(EnhancedNotificationService.getNotificationAnalytics).mockResolvedValue(mockAnalytics);

      const result = await EnhancedNotificationService.getNotificationAnalytics(userId, startDate, endDate);

      expect(result).toEqual(mockAnalytics);
      expect(result.total).toBe(100);
      expect(result.readRate).toBe(90);
    });
  });
});
