
import { supabase } from '@/integrations/supabase/client';
import type { UnifiedNotification } from '@/notifications/core/types';

export class ApprovalNotificationService {
  /**
   * Send notifications when data entries are submitted for approval
   */
  static async notifyDataSubmitted(entries: any[]): Promise<void> {
    try {
      if (!entries || entries.length === 0) return;

      const notifications: Omit<UnifiedNotification, 'id' | 'created_at' | 'updated_at'>[] = [];

      // Group entries by school and category for better notification organization
      const grouped = entries.reduce((acc, entry) => {
        const key = `${entry.school_id}-${entry.category_id}`;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(entry);
        return acc;
      }, {});

      for (const [key, groupEntries] of Object.entries(grouped)) {
        const sampleEntry = (groupEntries as any[])[0];
        
        // Get school and category names
        const { data: schoolData } = await supabase
          .from('schools')
          .select('name, sector_id, sectors(name, region_id, regions(name))')
          .eq('id', sampleEntry.school_id)
          .single();

        const { data: categoryData } = await supabase
          .from('categories')
          .select('name')
          .eq('id', sampleEntry.category_id)
          .single();

        if (!schoolData || !categoryData) continue;

        // Determine who should receive notifications based on hierarchy
        const recipientRoles = ['sectoradmin', 'regionadmin', 'superadmin'];
        
        // Get users who should be notified
        const { data: recipients } = await supabase
          .from('user_roles')
          .select('user_id, role, sector_id, region_id')
          .in('role', recipientRoles);

        if (!recipients) continue;

        // Filter recipients based on access rights
        const validRecipients = recipients.filter(recipient => {
          if (recipient.role === 'superadmin') return true;
          if (recipient.role === 'regionadmin') {
            return recipient.region_id === schoolData.sectors?.region_id;
          }
          if (recipient.role === 'sectoradmin') {
            return recipient.sector_id === schoolData.sector_id;
          }
          return false;
        });

        // Create notifications for valid recipients
        for (const recipient of validRecipients) {
          notifications.push({
            user_id: recipient.user_id,
            type: 'data_entry',
            title: 'Yeni məlumat təsdiqə göndərildi',
            message: `${schoolData.name} məktəbindən ${categoryData.name} kateqoriyası üzrə ${(groupEntries as any[]).length} məlumat sahəsi təsdiq üçün göndərildi.`,
            is_read: false,
            priority: 'normal',
            channel: 'inApp',
            related_entity_type: 'data_entry',
            related_entity_id: sampleEntry.id,
            metadata: {
              category_id: sampleEntry.category_id,
              category_name: categoryData.name,
              school_id: sampleEntry.school_id,
              school_name: schoolData.name,
              entry_count: (groupEntries as any[]).length
            }
          });
        }
      }

      // Insert notifications in batches
      if (notifications.length > 0) {
        const { error } = await supabase
          .from('notifications')
          .insert(notifications);

        if (error) {
          console.error('Error creating approval notifications:', error);
          throw error;
        }

        console.log(`Created ${notifications.length} approval notifications`);
      }
    } catch (error) {
      console.error('Error in notifyDataSubmitted:', error);
      throw error;
    }
  }

  /**
   * Send notifications when data entries are approved
   */
  static async notifyDataApproved(entryIds: string[], approvedBy: string): Promise<void> {
    try {
      await this.sendStatusChangeNotifications(entryIds, 'approved', approvedBy);
    } catch (error) {
      console.error('Error in notifyDataApproved:', error);
      throw error;
    }
  }

  /**
   * Send notifications when data entries are rejected
   */
  static async notifyDataRejected(entryIds: string[], rejectedBy: string, reason?: string): Promise<void> {
    try {
      await this.sendStatusChangeNotifications(entryIds, 'rejected', rejectedBy, reason);
    } catch (error) {
      console.error('Error in notifyDataRejected:', error);
      throw error;
    }
  }

  /**
   * Helper method to send status change notifications
   */
  private static async sendStatusChangeNotifications(
    entryIds: string[], 
    status: 'approved' | 'rejected', 
    changedBy: string,
    reason?: string
  ): Promise<void> {
    if (!entryIds || entryIds.length === 0) return;

    // Get entry details with school and category information
    const { data: entries } = await supabase
      .from('data_entries')
      .select(`
        id,
        school_id,
        category_id,
        created_by,
        schools(name),
        categories(name)
      `)
      .in('id', entryIds);

    if (!entries) return;

    const notifications: Omit<UnifiedNotification, 'id' | 'created_at' | 'updated_at'>[] = [];

    // Group entries by creator for better notification organization
    const grouped = entries.reduce((acc, entry) => {
      if (!acc[entry.created_by]) {
        acc[entry.created_by] = [];
      }
      acc[entry.created_by].push(entry);
      return acc;
    }, {} as Record<string, any[]>);

    for (const [createdBy, userEntries] of Object.entries(grouped)) {
      const title = status === 'approved' 
        ? 'Məlumatlarınız təsdiqləndi'
        : 'Məlumatlarınız rədd edildi';

      const message = status === 'approved'
        ? `${userEntries.length} məlumat sahəsi təsdiqləndi.`
        : `${userEntries.length} məlumat sahəsi rədd edildi.${reason ? ` Səbəb: ${reason}` : ''}`;

      notifications.push({
        user_id: createdBy,
        type: status === 'approved' ? 'approval' : 'rejection',
        title,
        message,
        is_read: false,
        priority: status === 'rejected' ? 'high' : 'normal',
        channel: 'inApp',
        related_entity_type: 'data_entry',
        related_entity_id: userEntries[0].id,
        metadata: {
          status,
          changed_by: changedBy,
          entry_count: userEntries.length,
          rejection_reason: reason
        }
      });
    }

    // Insert notifications
    if (notifications.length > 0) {
      const { error } = await supabase
        .from('notifications')
        .insert(notifications);

      if (error) {
        console.error('Error creating status change notifications:', error);
        throw error;
      }

      console.log(`Created ${notifications.length} status change notifications`);
    }
  }

  /**
   * Send deadline reminder notifications
   */
  static async sendDeadlineReminders(): Promise<void> {
    try {
      // This would be implemented to check for approaching deadlines
      // and send reminder notifications to relevant users
      console.log('Deadline reminders functionality to be implemented');
    } catch (error) {
      console.error('Error sending deadline reminders:', error);
      throw error;
    }
  }
}

export default ApprovalNotificationService;
