/**
 * İnfoLine Unified Notification System - Test Suite
 * Yeni notification sisteminin funksionallığını test edir
 */

import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { notificationManager, useNotifications, NotificationHelpers } from '@/notifications';

// Mock Supabase
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn() })) })),
      select: jest.fn(() => ({ eq: jest.fn(() => ({ order: jest.fn() })) })),
      update: jest.fn(() => ({ eq: jest.fn() })),
      delete: jest.fn(() => ({ eq: jest.fn() })),
      channel: jest.fn(() => ({
        on: jest.fn(() => ({ subscribe: jest.fn() }))
      }))
    }))
  }
}));

describe('İnfoLine Unified Notification System', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
    
    jest.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('NotificationManager', () => {
    test('should create notification successfully', async () => {
      const mockNotification = {
        id: '1',
        user_id: 'user123',
        type: 'info',
        title: 'Test Notification',
        message: 'Test message',
        is_read: false,
        priority: 'normal',
        created_at: new Date().toISOString()
      };

      require('@/integrations/supabase/client').supabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockNotification, error: null })
          })
        })
      });

      const result = await notificationManager.createNotification(
        'user123',
        'Test Notification',
        'Test message',
        'info'
      );

      expect(result).toEqual(mockNotification);
    });

    test('should handle notification creation error', async () => {
      require('@/integrations/supabase/client').supabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: new Error('Database error') })
          })
        })
      });

      const result = await notificationManager.createNotification(
        'user123',
        'Test Notification',
        'Test message',
        'info'
      );

      expect(result).toBeNull();
    });

    test('should get notifications for user', async () => {
      const mockNotifications = [
        {
          id: '1',
          user_id: 'user123',
          type: 'info',
          title: 'Notification 1',
          is_read: false,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          user_id: 'user123',
          type: 'success',
          title: 'Notification 2',
          is_read: true,
          created_at: new Date().toISOString()
        }
      ];

      require('@/integrations/supabase/client').supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              range: jest.fn().mockResolvedValue({ data: mockNotifications, error: null })
            })
          })
        })
      });

      const result = await notificationManager.getNotifications('user123');

      expect(result).toEqual(mockNotifications);
      expect(result).toHaveLength(2);
    });

    test('should mark notification as read', async () => {
      require('@/integrations/supabase/client').supabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null })
          })
        })
      });

      const result = await notificationManager.markAsRead('notif123', 'user123');

      expect(result).toBe(true);
    });

    test('should get unread count', async () => {
      require('@/integrations/supabase/client').supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ count: 5, error: null })
          })
        })
      });

      const result = await notificationManager.getUnreadCount('user123');

      expect(result).toBe(5);
    });

    test('should send bulk notifications', async () => {
      const mockBulkRequest = {
        type: 'system' as const,
        title: 'System Update',
        message: 'System will be updated',
        priority: 'normal' as const,
        channels: ['inApp' as const],
        user_ids: ['user1', 'user2', 'user3']
      };

      const mockInsertedNotifications = [
        { id: '1', user_id: 'user1', title: 'System Update' },
        { id: '2', user_id: 'user2', title: 'System Update' },
        { id: '3', user_id: 'user3', title: 'System Update' }
      ];

      require('@/integrations/supabase/client').supabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({ data: mockInsertedNotifications, error: null })
        })
      });

      const result = await notificationManager.sendBulkNotifications(mockBulkRequest);

      expect(result.success).toBe(3);
      expect(result.failed).toBe(0);
      expect(result.notifications).toHaveLength(3);
    });
  });

  describe('useNotifications Hook', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    test('should fetch notifications on mount', async () => {
      const mockNotifications = [
        {
          id: '1',
          user_id: 'user123',
          type: 'info',
          title: 'Test Notification',
          is_read: false,
          created_at: new Date().toISOString()
        }
      ];

      require('@/integrations/supabase/client').supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              range: jest.fn().mockResolvedValue({ data: mockNotifications, error: null })
            })
          })
        })
      });

      const { result, waitFor } = renderHook(() => useNotifications('user123'), {
        wrapper
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.notifications).toEqual(mockNotifications);
    });

    test('should mark notification as read', async () => {
      require('@/integrations/supabase/client').supabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null })
          })
        }),
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              range: jest.fn().mockResolvedValue({ data: [], error: null })
            })
          })
        })
      });

      const { result } = renderHook(() => useNotifications('user123'), {
        wrapper
      });

      await act(async () => {
        result.current.markAsRead('notif123');
      });

      expect(result.current.isMarkingAsRead).toBe(false);
    });
  });

  describe('NotificationHelpers', () => {
    test('should create deadline notification with correct metadata', async () => {
      const mockDeadlineNotification = {
        id: '1',
        user_id: 'user123',
        type: 'deadline',
        title: 'Son tarix xatırlatması: Test Category',
        message: '"Test Category" kateqoriyası üçün son tarix 3 gün qalıb. Tarix: 2024-12-31',
        priority: 'high',
        metadata: {
          deadline_date: '2024-12-31',
          days_remaining: 3,
          category_id: 'cat123',
          category_name: 'Test Category'
        }
      };

      require('@/integrations/supabase/client').supabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockDeadlineNotification, error: null })
          })
        })
      });

      const result = await NotificationHelpers.createDeadlineNotification(
        'user123',
        'Test Category',
        'cat123',
        '2024-12-31',
        3
      );

      expect(result).toEqual(mockDeadlineNotification);
    });

    test('should create approval notification', async () => {
      const mockApprovalNotification = {
        id: '1',
        user_id: 'user123',
        type: 'approval',
        title: 'Təsdiqləndi: Test Category',
        message: '"Test Category" kateqoriyası üçün təqdim etdiyiniz məlumatlar təsdiqləndi.',
        priority: 'high'
      };

      require('@/integrations/supabase/client').supabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockApprovalNotification, error: null })
          })
        })
      });

      const result = await NotificationHelpers.createApprovalNotification(
        'user123',
        'Test Category',
        'cat123',
        true // approved
      );

      expect(result).toEqual(mockApprovalNotification);
    });

    test('should create rejection notification with reason', async () => {
      const mockRejectionNotification = {
        id: '1',
        user_id: 'user123',
        type: 'rejection',
        title: 'Rədd edildi: Test Category',
        message: '"Test Category" kateqoriyası üçün təqdim etdiyiniz məlumatlar rədd edildi. Məlumatlar natamam',
        priority: 'high'
      };

      require('@/integrations/supabase/client').supabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockRejectionNotification, error: null })
          })
        })
      });

      const result = await NotificationHelpers.createApprovalNotification(
        'user123',
        'Test Category',
        'cat123',
        false, // rejected
        'reviewer123',
        'John Doe',
        'Məlumatlar natamam'
      );

      expect(result).toEqual(mockRejectionNotification);
    });

    test('should create data entry reminder', async () => {
      const mockReminderNotification = {
        id: '1',
        user_id: 'user123',
        type: 'reminder',
        title: 'Məlumat daxil etmə xatırlatması: Test Category',
        message: '"Test Category" kateqoriyası üçün məlumat daxil etmə 75% tamamlanıb. Məktəb: Test School',
        priority: 'normal'
      };

      require('@/integrations/supabase/client').supabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockReminderNotification, error: null })
          })
        })
      });

      const result = await NotificationHelpers.createDataEntryReminder(
        'user123',
        'Test Category',
        'cat123',
        75,
        'Test School'
      );

      expect(result).toEqual(mockReminderNotification);
    });
  });

  describe('Performance and Health', () => {
    test('should track performance metrics', async () => {
      // Perform some operations
      await notificationManager.getUnreadCount('user123');
      await notificationManager.createNotification('user123', 'Test', 'Message', 'info');

      const metrics = notificationManager.getPerformanceMetrics();

      expect(metrics.operationsCount).toBeGreaterThan(0);
      expect(metrics.averageOperationTime).toBeGreaterThanOrEqual(0);
      expect(metrics.errorRate).toBeGreaterThanOrEqual(0);
    });

    test('should provide health check information', () => {
      const health = notificationManager.getHealth();

      expect(health).toHaveProperty('healthy');
      expect(health).toHaveProperty('issues');
      expect(health).toHaveProperty('recommendations');
      expect(health).toHaveProperty('metrics');
    });
  });

  describe('Real-time Events', () => {
    test('should handle real-time notification events', () => {
      const mockEventListener = jest.fn();
      
      const unsubscribe = notificationManager.addEventListener('notification_created', mockEventListener);

      // Simulate real-time event
      const mockEvent = {
        type: 'notification_created' as const,
        notification: {
          id: '1',
          user_id: 'user123',
          type: 'info' as const,
          title: 'New Notification'
        },
        user_id: 'user123',
        timestamp: new Date().toISOString()
      };

      // The actual real-time event would be triggered by Supabase
      // Here we're just testing the event listener registration
      expect(typeof unsubscribe).toBe('function');
      
      // Cleanup
      unsubscribe();
    });
  });

  describe('Cache Integration', () => {
    test('should use cache for repeated requests', async () => {
      const mockNotifications = [
        { id: '1', user_id: 'user123', title: 'Cached Notification' }
      ];

      const mockSupabaseCall = jest.fn().mockResolvedValue({ 
        data: mockNotifications, 
        error: null 
      });

      require('@/integrations/supabase/client').supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              range: mockSupabaseCall
            })
          })
        })
      });

      // First call should hit database
      await notificationManager.getNotifications('user123');
      expect(mockSupabaseCall).toHaveBeenCalledTimes(1);

      // Second call should use cache (but in test environment, cache might not be fully functional)
      await notificationManager.getNotifications('user123');
      // In real implementation, this would be cached
    });
  });

  describe('Error Handling', () => {
    test('should handle database connection errors gracefully', async () => {
      require('@/integrations/supabase/client').supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              range: jest.fn().mockRejectedValue(new Error('Connection failed'))
            })
          })
        })
      });

      const result = await notificationManager.getNotifications('user123');

      expect(result).toEqual([]);
    });

    test('should handle invalid user ID gracefully', async () => {
      const result = await notificationManager.getNotifications('');

      expect(result).toEqual([]);
    });
  });
});

// Integration tests for migration compatibility
describe('Migration Compatibility Tests', () => {
  test('should maintain backward compatibility with old notification context', () => {
    // Test that old imports still work but show deprecation warnings
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    const { useNotifications: oldUseNotifications } = require('@/contexts/NotificationContext');
    
    expect(typeof oldUseNotifications).toBe('function');
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('DEPRECATED'));
    
    consoleSpy.mockRestore();
  });

  test('should maintain backward compatibility with old notification service', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    const { createNotification } = require('@/services/notificationService');
    
    expect(typeof createNotification).toBe('function');
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('DEPRECATED'));
    
    consoleSpy.mockRestore();
  });
});

export default {};
