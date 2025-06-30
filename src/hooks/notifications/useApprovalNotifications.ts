import { useCallback } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { ApprovalNotificationService } from '@/services/notifications/approvalNotifications';
import { DeadlineScheduler } from '@/services/notifications/scheduler/deadlineScheduler';
import { NotificationService } from '@/services/api/notificationService';
import type { CreateNotificationParams } from '@/types/notifications';

/**
 * Business Logic Hook for Approval and Data Entry Notifications
 * Approval və Data Entry notification-ları üçün business logic hook
 */
export const useApprovalNotifications = () => {
  const { user } = useAuth();

  /**
   * Notify when school admin submits data entry
   */
  const notifyDataSubmission = useCallback(async (
    schoolId: string,
    categoryId: string,
    entryCount: number = 1
  ) => {
    try {
      await ApprovalNotificationService.notifyDataEntrySubmitted(
        schoolId,
        categoryId,
        entryCount
      );
      console.log(`[useApprovalNotifications] Data submission notification sent for school ${schoolId}`);
    } catch (error) {
      console.error('Error sending data submission notification:', error);
    }
  }, []);

  /**
   * Notify when admin approves/rejects data entry
   */
  const notifyApprovalDecision = useCallback(async (
    schoolId: string,
    categoryId: string,
    isApproved: boolean,
    rejectionReason?: string
  ) => {
    try {
      await ApprovalNotificationService.notifyApproval(
        schoolId,
        categoryId,
        isApproved,
        rejectionReason
      );
      console.log(`[useApprovalNotifications] Approval decision notification sent: ${isApproved ? 'approved' : 'rejected'}`);
    } catch (error) {
      console.error('Error sending approval decision notification:', error);
    }
  }, []);

  /**
   * Notify when data entry is updated
   */
  const notifyDataUpdate = useCallback(async (
    schoolId: string,
    categoryId: string,
    entryCount: number = 1
  ) => {
    try {
      await ApprovalNotificationService.notifyDataEntryUpdated(
        schoolId,
        categoryId,
        entryCount
      );
      console.log(`[useApprovalNotifications] Data update notification sent for school ${schoolId}`);
    } catch (error) {
      console.error('Error sending data update notification:', error);
    }
  }, []);

  /**
   * Notify when category is completed
   */
  const notifyCompletion = useCallback(async (
    schoolId: string,
    categoryId: string
  ) => {
    try {
      await ApprovalNotificationService.notifyCompletedCategory(
        schoolId,
        categoryId
      );
      console.log(`[useApprovalNotifications] Completion notification sent for school ${schoolId}`);
    } catch (error) {
      console.error('Error sending completion notification:', error);
    }
  }, []);

  /**
   * Bulk approval notifications
   */
  const notifyBulkApproval = useCallback(async (
    approvals: Array<{
      schoolId: string;
      categoryId: string;
      isApproved: boolean;
      rejectionReason?: string;
    }>
  ) => {
    try {
      await ApprovalNotificationService.notifyBulkApproval(approvals);
      console.log(`[useApprovalNotifications] Bulk approval notifications sent for ${approvals.length} items`);
    } catch (error) {
      console.error('Error sending bulk approval notifications:', error);
    }
  }, []);

  /**
   * Send immediate deadline reminder for category
   */
  const sendDeadlineReminder = useCallback(async (categoryId: string) => {
    try {
      const success = await DeadlineScheduler.sendImmediateDeadlineReminder(categoryId);
      if (success) {
        console.log(`[useApprovalNotifications] Deadline reminder sent for category ${categoryId}`);
      }
      return success;
    } catch (error) {
      console.error('Error sending deadline reminder:', error);
      return false;
    }
  }, []);

  /**
   * Create custom notification
   */
  const createCustomNotification = useCallback(async (params: CreateNotificationParams) => {
    try {
      const notification = await NotificationService.createNotification(params);
      if (notification) {
        console.log(`[useApprovalNotifications] Custom notification created: ${params.title}`);
      }
      return notification;
    } catch (error) {
      console.error('Error creating custom notification:', error);
      return null;
    }
  }, []);

  /**
   * Quick helpers for common scenarios
   */
  const helpers = {
    /**
     * Notify when school submits category for first time
     */
    notifyFirstSubmission: async (schoolId: string, categoryId: string) => {
      await createCustomNotification({
        userId: user?.id || '',
        title: 'İlk məlumat göndərildi',
        message: 'Kateqoriya üzrə ilk dəfə məlumat daxil edildi',
        type: 'info',
        priority: 'normal',
        relatedEntityId: categoryId,
        relatedEntityType: 'category'
      });
    },

    /**
     * Notify when deadline is approaching (manual trigger)
     */
    notifyDeadlineApproaching: async (categoryId: string, daysLeft: number) => {
      await createCustomNotification({
        userId: user?.id || '',
        title: 'Son tarix yaxınlaşır',
        message: `Kateqoriya üçün ${daysLeft} gün qalıb`,
        type: 'deadline',
        priority: daysLeft <= 1 ? 'critical' : 'high',
        relatedEntityId: categoryId,
        relatedEntityType: 'category'
      });
    },

    /**
     * Notify when new category is created
     */
    notifyNewCategory: async (categoryName: string, categoryId: string) => {
      await createCustomNotification({
        userId: user?.id || '',
        title: 'Yeni kateqoriya əlavə edildi',
        message: `${categoryName} kateqoriyası sisteminə əlavə edildi`,
        type: 'info',
        priority: 'normal',
        relatedEntityId: categoryId,
        relatedEntityType: 'category'
      });
    }
  };

  return {
    // Main notification functions
    notifyDataSubmission,
    notifyApprovalDecision,
    notifyDataUpdate,
    notifyCompletion,
    notifyBulkApproval,
    sendDeadlineReminder,
    createCustomNotification,

    // Helper functions
    ...helpers
  };
};

export default useApprovalNotifications;
