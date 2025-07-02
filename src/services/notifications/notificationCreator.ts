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
   * Create user deletion notification
   */
  static async createUserDeletionNotification(
    deletedUserId: string,
    deletedUserName: string,
    deletedByUserId: string,
    deletionType: 'soft' | 'hard'
  ) {
    try {
      const title = deletionType === 'hard' 
        ? 'İstifadəçi tamamilə silindi'
        : 'İstifadəçi deaktiv edildi';
      
      const message = deletionType === 'hard'
        ? `${deletedUserName} istifadəçisi sistemdən tamamilə silindi`
        : `${deletedUserName} istifadəçisi deaktiv edildi və artıq sistemi istifadə edə bilməz`;

      // Get superadmins and regionadmins to notify
      const adminUserIds = await this.getAdminUsers();
      
      const result = await NotificationService.createBulkNotifications({
        userIds: adminUserIds,
        title,
        message,
        type: 'user_deleted',
        priority: deletionType === 'hard' ? 'high' : 'normal',
        relatedEntityId: deletedUserId,
        relatedEntityType: 'user'
      });

      console.log(`[NotificationCreator] Created user deletion notification: ${deletionType}`);
      return result;
    } catch (error) {
      console.error('[NotificationCreator] Error creating user deletion notification:', error);
      throw error;
    }
  }

  /**
   * Create user restoration notification
   */
  static async createUserRestorationNotification(
    restoredUserId: string,
    restoredUserName: string,
    restoredByUserId: string
  ) {
    try {
      const title = 'İstifadəçi bərpa edildi';
      const message = `${restoredUserName} istifadəçisi bərpa edildi və yenidən sistemi istifadə edə bilər`;

      // Get superadmins and regionadmins to notify
      const adminUserIds = await this.getAdminUsers();
      
      const result = await NotificationService.createBulkNotifications({
        userIds: adminUserIds,
        title,
        message,
        type: 'user_restored',
        priority: 'normal',
        relatedEntityId: restoredUserId,
        relatedEntityType: 'user'
      });

      console.log(`[NotificationCreator] Created user restoration notification`);
      return result;
    } catch (error) {
      console.error('[NotificationCreator] Error creating user restoration notification:', error);
      throw error;
    }
  }

  /**
   * Helper to get admin user IDs (superadmin and regionadmin)
   */
  private static async getAdminUsers(): Promise<string[]> {
    try {
      // Import supabase here to avoid circular dependencies
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('role', ['superadmin', 'regionadmin']);
      
      if (error) {
        console.error('[NotificationCreator] Error fetching admin users:', error);
        return [];
      }
      
      return data?.map(item => item.user_id) || [];
    } catch (error) {
      console.error('[NotificationCreator] Error in getAdminUsers:', error);
      return [];
    }
  }

  /**
   * Helper to get user IDs by roles
   */
  private static async getUsersByRoles(roles: string[]): Promise<string[]> {
    try {
      if (roles.includes('all')) {
        // Import supabase here to avoid circular dependencies
        const { supabase } = await import('@/integrations/supabase/client');
        
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .is('deleted_at', null);
        
        if (error) {
          console.error('[NotificationCreator] Error fetching all users:', error);
          return [];
        }
        
        return data?.map(item => item.id) || [];
      }
      
      // Import supabase here to avoid circular dependencies
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('role', roles);
      
      if (error) {
        console.error('[NotificationCreator] Error fetching users by roles:', error);
        return [];
      }
      
      return data?.map(item => item.user_id) || [];
    } catch (error) {
      console.error('[NotificationCreator] Error in getUsersByRoles:', error);
      return [];
    }
  }
}

export default NotificationCreator;