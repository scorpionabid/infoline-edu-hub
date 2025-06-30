import { supabase } from '@/integrations/supabase/client';
import type { 
  Notification, 
  CreateNotificationParams, 
  BulkNotificationParams,
  NotificationFilters,
  ApprovalNotificationData,
  DeadlineNotificationData,
  DataEntryNotificationData
} from '@/types/notifications';

/**
 * Unified Notification Service
 * Bütün notification CRUD əməliyyatları və business logic
 */
export class NotificationService {
  /**
   * Create a single notification
   */
  static async createNotification(params: CreateNotificationParams): Promise<Notification | null> {
    try {
      const {
        userId,
        title,
        message,
        type = 'info',
        priority = 'normal',
        relatedEntityId,
        relatedEntityType
      } = params;

      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title,
          message,
          type,
          priority,
          is_read: false,
          related_entity_id: relatedEntityId,
          related_entity_type: relatedEntityType,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      
      console.log(`[NotificationService] Created notification for user ${userId}: ${title}`);
      return data as Notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  /**
   * Create bulk notifications for multiple users
   */
  static async createBulkNotifications(params: BulkNotificationParams): Promise<Notification[]> {
    try {
      const {
        userIds,
        title,
        message,
        type = 'info',
        priority = 'normal',
        relatedEntityId,
        relatedEntityType
      } = params;

      const notifications = userIds.map(userId => ({
        user_id: userId,
        title,
        message,
        type,
        priority,
        is_read: false,
        related_entity_id: relatedEntityId,
        related_entity_type: relatedEntityType,
        created_at: new Date().toISOString()
      }));

      const { data, error } = await supabase
        .from('notifications')
        .insert(notifications)
        .select();

      if (error) throw error;
      
      console.log(`[NotificationService] Created ${data.length} bulk notifications: ${title}`);
      return data as Notification[];
    } catch (error) {
      console.error('Error creating bulk notifications:', error);
      return [];
    }
  }

  /**
   * Get notifications for user with filters
   */
  static async getUserNotifications(
    userId: string,
    filters: NotificationFilters = {}
  ): Promise<Notification[]> {
    try {
      const {
        types,
        priorities,
        isRead,
        startDate,
        endDate,
        limit = 50,
        offset = 0
      } = filters;

      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (types && types.length > 0) {
        query = query.in('type', types);
      }

      if (priorities && priorities.length > 0) {
        query = query.in('priority', priorities);
      }

      if (typeof isRead === 'boolean') {
        query = query.eq('is_read', isRead);
      }

      if (startDate) {
        query = query.gte('created_at', startDate);
      }

      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      query = query.range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) throw error;
      return data as Notification[];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  /**
   * Get unread count for user
   */
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  /**
   * Mark all notifications as read for user
   */
  static async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          updated_at: new Date().toISOString() 
        })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  /**
   * Delete notification
   */
  static async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  /**
   * Clear all notifications for user
   */
  static async clearAllNotifications(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      return false;
    }
  }

  // Business Logic Methods

  /**
   * Create approval workflow notifications
   */
  static async createApprovalNotification(data: ApprovalNotificationData): Promise<Notification | null> {
    const { categoryName, categoryId, schoolName, adminId, isApproved, rejectionReason } = data;
    
    const title = isApproved 
      ? 'Məlumatlarınız təsdiqləndi' 
      : 'Məlumatlarınız rədd edildi';
    
    const message = isApproved
      ? `${categoryName} kateqoriyası üzrə ${schoolName} məktəbindən olan məlumatlarınız təsdiqləndi.`
      : `${categoryName} kateqoriyası üzrə ${schoolName} məktəbindən olan məlumatlarınız rədd edildi. Səbəb: ${rejectionReason || 'Məlum deyil'}`;

    return this.createNotification({
      userId: adminId,
      title,
      message,
      type: isApproved ? 'approval' : 'rejection',
      priority: isApproved ? 'normal' : 'high',
      relatedEntityId: categoryId,
      relatedEntityType: 'category'
    });
  }

  /**
   * Create deadline reminder notifications
   */
  static async createDeadlineNotifications(data: DeadlineNotificationData): Promise<Notification[]> {
    const { categoryName, categoryId, deadline, daysRemaining, schoolIds } = data;
    
    const title = `Son tarix yaxınlaşır: ${categoryName}`;
    const message = `${categoryName} kateqoriyası üçün son tarix ${daysRemaining} gün sonra bitir (${new Date(deadline).toLocaleDateString('az-AZ')})`;

    // Get school admins for the given schools
    const { data: schoolAdmins, error } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'schooladmin')
      .in('school_id', schoolIds);

    if (error || !schoolAdmins) {
      console.error('Error getting school admins for deadline notifications:', error);
      return [];
    }

    const userIds = schoolAdmins.map(admin => admin.user_id);

    return this.createBulkNotifications({
      userIds,
      title,
      message,
      type: 'deadline',
      priority: daysRemaining <= 1 ? 'critical' : daysRemaining <= 3 ? 'high' : 'normal',
      relatedEntityId: categoryId,
      relatedEntityType: 'category'
    });
  }

  /**
   * Create data entry notifications
   */
  static async createDataEntryNotification(data: DataEntryNotificationData): Promise<Notification[]> {
    const { categoryName, schoolName, schoolId, entryCount, action } = data;
    
    let title: string;
    let message: string;
    let type: 'info' | 'success' = 'info';

    switch (action) {
      case 'submitted':
        title = 'Yeni məlumat təsdiqi gözləyir';
        message = `${schoolName} məktəbindən ${categoryName} kateqoriyası üzrə ${entryCount} məlumat sahəsi təsdiq üçün göndərildi.`;
        break;
      case 'updated':
        title = 'Məlumatlar yeniləndi';
        message = `${schoolName} məktəbindən ${categoryName} kateqoriyası üzrə ${entryCount} məlumat sahəsi yeniləndi.`;
        break;
      case 'completed':
        title = 'Məlumat daxiletməsi tamamlandı';
        message = `${schoolName} məktəbi ${categoryName} kateqoriyası üzrə bütün tələb olunan məlumatları doldurdu.`;
        type = 'success';
        break;
    }

    // Get sector and region admins for this school
    const { data: schoolInfo, error } = await supabase
      .from('schools')
      .select(`
        sector_id,
        region_id,
        sectors!inner(region_id)
      `)
      .eq('id', schoolId)
      .single();

    if (error || !schoolInfo) {
      console.error('Error getting school info for data entry notifications:', error);
      return [];
    }

    // Get relevant admins (sector and region)
    const { data: admins, error: adminsError } = await supabase
      .from('user_roles')
      .select('user_id')
      .or(`and(role.eq.sectoradmin,sector_id.eq.${schoolInfo.sector_id}),and(role.eq.regionadmin,region_id.eq.${schoolInfo.region_id})`);

    if (adminsError || !admins) {
      console.error('Error getting admins for data entry notifications:', adminsError);
      return [];
    }

    const userIds = admins.map(admin => admin.user_id);

    return this.createBulkNotifications({
      userIds,
      title,
      message,
      type,
      priority: action === 'completed' ? 'normal' : 'normal',
      relatedEntityId: schoolId,
      relatedEntityType: 'school'
    });
  }
}

export default NotificationService;