import { NotificationService } from '@/services/api/notificationService';
import type { ApprovalNotificationData, DataEntryNotificationData } from '@/types/notifications';

/**
 * Business Logic for Approval and Data Entry Notifications
 * Təsdiq prosesi və məlumat giriş bildirişləri üçün business logic
 */
export class ApprovalNotificationService {

  /**
   * Notify when data entry is submitted for approval
   */
  static async notifyDataEntrySubmitted(
    schoolId: string,
    categoryId: string,
    entryCount: number
  ): Promise<void> {
    try {
      // Get school and category info
      const [schoolInfo, categoryInfo] = await Promise.all([
        this.getSchoolInfo(schoolId),
        this.getCategoryInfo(categoryId)
      ]);

      if (!schoolInfo || !categoryInfo) return;

      const notificationData: DataEntryNotificationData = {
        categoryName: categoryInfo.name,
        categoryId,
        schoolName: schoolInfo.name,
        schoolId,
        entryCount,
        action: 'submitted'
      };

      await NotificationService.createDataEntryNotification(notificationData);
      
      console.log(`[ApprovalNotificationService] Notified submission for ${schoolInfo.name} - ${categoryInfo.name}`);
    } catch (error) {
      console.error('Error notifying data entry submission:', error);
    }
  }

  /**
   * Notify when data entry is approved
   */
  static async notifyApproval(
    schoolId: string,
    categoryId: string,
    isApproved: boolean,
    rejectionReason?: string
  ): Promise<void> {
    try {
      // Get school admin for this school
      const schoolAdmin = await this.getSchoolAdmin(schoolId);
      if (!schoolAdmin) {
        console.warn(`No school admin found for school ${schoolId}`);
        return;
      }

      // Get school and category info
      const [schoolInfo, categoryInfo] = await Promise.all([
        this.getSchoolInfo(schoolId),
        this.getCategoryInfo(categoryId)
      ]);

      if (!schoolInfo || !categoryInfo) return;

      const notificationData: ApprovalNotificationData = {
        categoryName: categoryInfo.name,
        categoryId,
        schoolName: schoolInfo.name,
        schoolId,
        adminId: schoolAdmin.user_id,
        isApproved,
        rejectionReason
      };

      await NotificationService.createApprovalNotification(notificationData);
      
      console.log(`[ApprovalNotificationService] Notified ${isApproved ? 'approval' : 'rejection'} for ${schoolInfo.name} - ${categoryInfo.name}`);
    } catch (error) {
      console.error('Error notifying approval:', error);
    }
  }

  /**
   * Notify when data entry is updated
   */
  static async notifyDataEntryUpdated(
    schoolId: string,
    categoryId: string,
    entryCount: number
  ): Promise<void> {
    try {
      const [schoolInfo, categoryInfo] = await Promise.all([
        this.getSchoolInfo(schoolId),
        this.getCategoryInfo(categoryId)
      ]);

      if (!schoolInfo || !categoryInfo) return;

      const notificationData: DataEntryNotificationData = {
        categoryName: categoryInfo.name,
        categoryId,
        schoolName: schoolInfo.name,
        schoolId,
        entryCount,
        action: 'updated'
      };

      await NotificationService.createDataEntryNotification(notificationData);
      
      console.log(`[ApprovalNotificationService] Notified update for ${schoolInfo.name} - ${categoryInfo.name}`);
    } catch (error) {
      console.error('Error notifying data entry update:', error);
    }
  }

  /**
   * Notify when category is completed by school
   */
  static async notifyCompletedCategory(
    schoolId: string,
    categoryId: string
  ): Promise<void> {
    try {
      const [schoolInfo, categoryInfo] = await Promise.all([
        this.getSchoolInfo(schoolId),
        this.getCategoryInfo(categoryId)
      ]);

      if (!schoolInfo || !categoryInfo) return;

      const notificationData: DataEntryNotificationData = {
        categoryName: categoryInfo.name,
        categoryId,
        schoolName: schoolInfo.name,
        schoolId,
        entryCount: 0, // Not relevant for completion
        action: 'completed'
      };

      await NotificationService.createDataEntryNotification(notificationData);
      
      console.log(`[ApprovalNotificationService] Notified completion for ${schoolInfo.name} - ${categoryInfo.name}`);
    } catch (error) {
      console.error('Error notifying category completion:', error);
    }
  }

  /**
   * Bulk approve notifications
   */
  static async notifyBulkApproval(
    approvals: Array<{
      schoolId: string;
      categoryId: string;
      isApproved: boolean;
      rejectionReason?: string;
    }>
  ): Promise<void> {
    try {
      const promises = approvals.map(approval => 
        this.notifyApproval(
          approval.schoolId,
          approval.categoryId,
          approval.isApproved,
          approval.rejectionReason
        )
      );

      await Promise.all(promises);
      
      console.log(`[ApprovalNotificationService] Processed ${approvals.length} bulk approval notifications`);
    } catch (error) {
      console.error('Error processing bulk approval notifications:', error);
    }
  }

  // Helper methods

  private static async getSchoolAdmin(schoolId: string) {
    try {
      const { data, error } = await import('@/integrations/supabase/client').then(module => 
        module.supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'schooladmin')
          .eq('school_id', schoolId)
          .single()
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting school admin:', error);
      return null;
    }
  }

  private static async getSchoolInfo(schoolId: string) {
    try {
      const { data, error } = await import('@/integrations/supabase/client').then(module => 
        module.supabase
          .from('schools')
          .select('id, name, sector_id, region_id')
          .eq('id', schoolId)
          .single()
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting school info:', error);
      return null;
    }
  }

  private static async getCategoryInfo(categoryId: string) {
    try {
      const { data, error } = await import('@/integrations/supabase/client').then(module => 
        module.supabase
          .from('categories')
          .select('id, name, assignment')
          .eq('id', categoryId)
          .single()
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting category info:', error);
      return null;
    }
  }
}

export default ApprovalNotificationService;
