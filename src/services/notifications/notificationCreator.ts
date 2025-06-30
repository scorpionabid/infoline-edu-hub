import { NotificationService } from '@/services/api/notificationService';
import type { 
  CreateNotificationParams,
  ApprovalNotificationData,
  DataEntryNotificationData 
} from '@/types/notifications';

/**
 * High-level notification creator for common business scenarios
 * Business logic üçün yüksək səviyyəli helper
 */
export class NotificationCreator {
  
  /**
   * Create approval workflow notification
   */
  static async createApprovalNotification(data: ApprovalNotificationData) {
    try {
      const result = await NotificationService.createApprovalNotification(data);
      console.log(`[NotificationCreator] Created approval notification: ${data.isApproved ? 'approved' : 'rejected'}`);
      return result;
    } catch (error) {
      console.error('[NotificationCreator] Error creating approval notification:', error);
      throw error;
    }
  }

  /**
   * Create data entry notification for admins
   */
  static async createDataEntryNotification(data: DataEntryNotificationData) {
    try {
      const result = await NotificationService.createDataEntryNotification(data);
      console.log(`[NotificationCreator] Created data entry notification: ${data.action}`);
      return result;
    } catch (error) {
      console.error('[NotificationCreator] Error creating data entry notification:', error);
      throw error;
    }
  }

  /**
   * Create system maintenance notification
   */
  static async createMaintenanceNotification(
    title: string,
    message: string,
    scheduledTime: string,
    affectedRoles: string[] = ['all']
  ) {
    try {
      // Get all users or filtered by roles
      const userIds = await this.getUsersByRoles(affectedRoles);

      const result = await NotificationService.createBulkNotifications({
        userIds,
        title,
        message,
        type: 'system',
        priority: 'high',
        relatedEntityType: 'system'
      });

      console.log(`[NotificationCreator] Created maintenance notification for ${userIds.length} users`);
      return result;
    } catch (error) {
      console.error('[NotificationCreator] Error creating maintenance notification:', error);
      throw error;
    }
  }

  /**
   * Create welcome notification for new users
   */
  static async createWelcomeNotification(userId: string, userRole: string) {
    try {
      const params: CreateNotificationParams = {
        userId,
        title: 'İnfoLine platformasına xoş gəlmisiniz!',
        message: `${userRole} rolu ilə sistemi istifadə etməyə başlaya bilərsiniz. Kömək lazımdırsa, admin ilə əlaqə saxlayın.`,
        type: 'info',
        priority: 'normal',
        relatedEntityType: 'user'
      };

      const result = await NotificationService.createNotification(params);
      console.log(`[NotificationCreator] Created welcome notification for user: ${userId}`);
      return result;
    } catch (error) {
      console.error('[NotificationCreator] Error creating welcome notification:', error);
      throw error;
    }
  }

  /**
   * Create category update notification
   */
  static async createCategoryUpdateNotification(
    categoryId: string,
    categoryName: string,
    updateType: 'created' | 'updated' | 'deadline_changed',
    affectedUserIds: string[]
  ) {
    try {
      let title: string;
      let message: string;

      switch (updateType) {
        case 'created':
          title = 'Yeni kateqoriya əlavə edildi';
          message = `${categoryName} kateqoriyası sistemi əlavə edildi və məlumat daxil etmə üçün hazırdır.`;
          break;
        case 'updated':
          title = 'Kateqoriya yeniləndi';
          message = `${categoryName} kateqoriyasında dəyişikliklər edildi. Zəhmət olmasa yenidən nəzərdən keçirin.`;
          break;
        case 'deadline_changed':
          title = 'Kateqoriya son tarixi dəyişdi';
          message = `${categoryName} kateqoriyasının son tarixi dəyişdirildi. Yeni tarixi yoxlayın.`;
          break;
      }

      const result = await NotificationService.createBulkNotifications({
        userIds: affectedUserIds,
        title,
        message,
        type: 'category_update',
        priority: updateType === 'deadline_changed' ? 'high' : 'normal',
        relatedEntityId: categoryId,
        relatedEntityType: 'category'
      });

      console.log(`[NotificationCreator] Created category update notification: ${updateType}`);
      return result;
    } catch (error) {
      console.error('[NotificationCreator] Error creating category update notification:', error);
      throw error;
    }
  }

  /**
   * Helper to get user IDs by roles
   */
  private static async getUsersByRoles(roles: string[]): Promise<string[]> {
    // This would typically query the user_roles table
    // For now, return empty array - implement based on requirements
    console.log(`[NotificationCreator] Getting users for roles:`, roles);
    return [];
  }
}

export default NotificationCreator;