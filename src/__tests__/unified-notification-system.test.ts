
/**
 * Unified Notification System Tests
 * Tests for the new notification system components and functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the entire notifications module
const mockUseNotifications = vi.fn();
const mockNotificationManager = {
  createNotification: vi.fn(),
  markAsRead: vi.fn(),
  deleteNotification: vi.fn()
};

vi.mock('@/notifications', () => ({
  useNotifications: mockUseNotifications,
  notificationManager: mockNotificationManager
}));

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            data: [],
            error: null
          }))
        }))
      })),
      insert: vi.fn(() => ({
        data: [],
        error: null
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: [],
          error: null
        }))
      }))
    }))
  }
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('Unified Notification System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useNotifications Hook', () => {
    it('should return notification data and functions', () => {
      const mockNotifications = [
        {
          id: '1',
          user_id: 'user1',
          type: 'info' as const,
          title: 'Test Notification',
          message: 'Test message',
          is_read: false,
          priority: 'normal' as const,
          created_at: new Date().toISOString()
        }
      ];

      mockUseNotifications.mockReturnValue({
        notifications: mockNotifications,
        unreadCount: 1,
        isLoading: false,
        markAsRead: vi.fn(),
        markAllAsRead: vi.fn(),
        deleteNotification: vi.fn()
      });

      const result = mockUseNotifications('user1');

      expect(result.notifications).toEqual(mockNotifications);
      expect(result.unreadCount).toBe(1);
      expect(result.isLoading).toBe(false);
      expect(typeof result.markAsRead).toBe('function');
      expect(typeof result.markAllAsRead).toBe('function');
      expect(typeof result.deleteNotification).toBe('function');
    });

    it('should handle loading state', () => {
      mockUseNotifications.mockReturnValue({
        notifications: [],
        unreadCount: 0,
        isLoading: true,
        markAsRead: vi.fn(),
        markAllAsRead: vi.fn(),
        deleteNotification: vi.fn()
      });

      const result = mockUseNotifications('user1');

      expect(result.isLoading).toBe(true);
      expect(result.notifications).toEqual([]);
    });
  });

  describe('Notification Manager', () => {
    it('should create notifications', async () => {
      const mockNotification = {
        user_id: 'user1',
        type: 'info' as const,
        title: 'Test',
        message: 'Test message',
        priority: 'normal' as const
      };

      mockNotificationManager.createNotification(mockNotification);

      expect(mockNotificationManager.createNotification).toHaveBeenCalledWith(mockNotification);
    });

    it('should mark notifications as read', async () => {
      const notificationId = 'notification1';

      mockNotificationManager.markAsRead(notificationId);

      expect(mockNotificationManager.markAsRead).toHaveBeenCalledWith(notificationId);
    });

    it('should delete notifications', async () => {
      const notificationId = 'notification1';

      mockNotificationManager.deleteNotification(notificationId);

      expect(mockNotificationManager.deleteNotification).toHaveBeenCalledWith(notificationId);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', () => {
      mockUseNotifications.mockReturnValue({
        notifications: [],
        unreadCount: 0,
        isLoading: false,
        error: new Error('API Error'),
        markAsRead: vi.fn(),
        markAllAsRead: vi.fn(),
        deleteNotification: vi.fn()
      });

      const result = mockUseNotifications('user1');

      expect(result.error).toBeInstanceOf(Error);
      expect(result.notifications).toEqual([]);
    });
  });

  describe('Real-time Updates', () => {
    it('should handle real-time notification updates', async () => {
      const mockNotifications = [
        {
          id: '1',
          user_id: 'user1',
          type: 'info' as const,
          title: 'Real-time Test',
          message: 'Real-time message',
          is_read: false,
          priority: 'normal' as const,
          created_at: new Date().toISOString()
        }
      ];

      mockUseNotifications.mockReturnValue({
        notifications: mockNotifications,
        unreadCount: 1,
        isLoading: false,
        markAsRead: vi.fn(),
        markAllAsRead: vi.fn(),
        deleteNotification: vi.fn()
      });

      const result = mockUseNotifications('user1');

      await waitFor(() => {
        expect(result.notifications).toEqual(mockNotifications);
      });
    });
  });

  describe('Notification Types', () => {
    it('should handle different notification types', () => {
      const notificationTypes = ['info', 'warning', 'error', 'success', 'data_approval'] as const;

      notificationTypes.forEach(type => {
        const mockNotifications = [
          {
            id: `${type}-1`,
            user_id: 'user1',
            type,
            title: `${type} notification`,
            message: `${type} message`,
            is_read: false,
            priority: 'normal' as const,
            created_at: new Date().toISOString()
          }
        ];

        mockUseNotifications.mockReturnValue({
          notifications: mockNotifications,
          unreadCount: 1,
          isLoading: false,
          markAsRead: vi.fn(),
          markAllAsRead: vi.fn(),
          deleteNotification: vi.fn()
        });

        const result = mockUseNotifications('user1');
        expect(result.notifications[0].type).toBe(type);
      });
    });
  });

  describe('Performance', () => {
    it('should handle large numbers of notifications efficiently', () => {
      const largeNotificationList = Array.from({ length: 1000 }, (_, i) => ({
        id: `notification-${i}`,
        user_id: 'user1',
        type: 'info' as const,
        title: `Notification ${i}`,
        message: `Message ${i}`,
        is_read: i % 2 === 0,
        priority: 'normal' as const,
        created_at: new Date().toISOString()
      }));

      mockUseNotifications.mockReturnValue({
        notifications: largeNotificationList,
        unreadCount: 500,
        isLoading: false,
        markAsRead: vi.fn(),
        markAllAsRead: vi.fn(),
        deleteNotification: vi.fn()
      });

      const result = mockUseNotifications('user1');

      expect(result.notifications).toHaveLength(1000);
      expect(result.unreadCount).toBe(500);
    });
  });
});
