import { supabase } from '@/integrations/supabase/client';
import { DataEntryStatus } from '@/types/core/dataEntry';
import { StatusHistoryService } from './statusHistoryService';

/**
 * Status Transition Engine for InfoLine Data Entry System
 * 
 * Bu servis data entry-lərin status keçidlərini idarə edir və
 * PRD-yə uyğun iş axını qaydalarını tətbiq edir.
 * 
 * Updated: Status history integration ilə yeniləndi
 */

export interface StatusTransition {
  from: DataEntryStatus;
  to: DataEntryStatus;
  requiredRoles: string[];
  conditions: string[];
  description: string;
  validateCondition?: (data: any) => Promise<boolean>;
}

export interface TransitionContext {
  schoolId: string;
  categoryId: string;
  userId: string;
  userRole: string;
  entryData?: any;
  comment?: string;
}

export interface TransitionResult {
  allowed: boolean;
  reason?: string;
  code?: string;
}

export interface ServiceResponse {
  success: boolean;
  message?: string;
  error?: string;
  status?: DataEntryStatus;
  data?: any;
}

/**
 * PRD-yə uyğun status transition qaydaları
 * 
 * Status workflow:
 * DRAFT ──────► PENDING ──────► APPROVED
 *   │              │              │
 *   │              ▼              │
 *   │          REJECTED ──────────┘
 *   │              │
 *   └──────────────┘
 */
export const STATUS_TRANSITIONS: StatusTransition[] = [
  {
    from: DataEntryStatus.DRAFT,
    to: DataEntryStatus.PENDING,
    requiredRoles: ['schooladmin'],
    conditions: ['all_required_fields_filled', 'is_entry_owner'],
    description: 'Məlumatları təsdiq üçün göndərmək',
    validateCondition: async (data: TransitionContext) => {
      // Bütün məcburi sahələrin doldurulduğunu yoxla
      const { schoolId, categoryId } = data;
      
      try {
        // Get category columns
        const { data: category } = await supabase
          .from('categories')
          .select(`
            id,
            columns:columns(id, name, is_required)
          `)
          .eq('id', categoryId)
          .single();

        if (!category?.columns) return false;

        // Get existing data entries
        const { data: entries } = await supabase
          .from('data_entries')
          .select('column_id, value')
          .eq('school_id', schoolId)
          .eq('category_id', categoryId);

        // Check if all required fields are filled
        const requiredColumns = category.columns.filter(col => col.is_required);
        const filledColumns = new Set(entries?.map(e => e.column_id) || []);
        
        const missingRequired = requiredColumns.filter(col => 
          !filledColumns.has(col.id) || 
          !entries?.find(e => e.column_id === col.id && e.value !== null && e.value !== '')
        );
        
        return missingRequired.length === 0;
      } catch (error) {
        console.error('Error validating required fields:', error);
        return false;
      }
    }
  },
  {
    from: DataEntryStatus.REJECTED,
    to: DataEntryStatus.APPROVED,
    requiredRoles: ['sectoradmin', 'regionadmin', 'superadmin'],
    conditions: ['valid_approval_permission'],
    description: 'Rədd edilmiş məlumatları təsdiqləmək',
    validateCondition: async (data: TransitionContext) => {
      // Use same permission check as approval
      const approvalTransition = STATUS_TRANSITIONS.find(t => 
        t.from === DataEntryStatus.DRAFT && t.to === DataEntryStatus.APPROVED
      );
      
      if (approvalTransition?.validateCondition) {
        return await approvalTransition.validateCondition(data);
      }
      
      return false;
    }
  },
  {
    from: DataEntryStatus.DRAFT,
    to: DataEntryStatus.REJECTED,
    requiredRoles: ['sectoradmin', 'regionadmin', 'superadmin'],
    conditions: ['valid_approval_permission', 'rejection_reason_provided'],
    description: 'Məlumatları birbaşa rədd etmək (admin)',
    validateCondition: async (data: TransitionContext) => {
      // Rədd səbəbinin mövcudluğunu və icazəni yoxla
      const { comment } = data;
      
      if (!comment || comment.trim().length === 0) {
        return false; // Rejection reason is required
      }
      
      // Use same permission check as approval
      const approvalTransition = STATUS_TRANSITIONS.find(t => 
        t.from === DataEntryStatus.DRAFT && t.to === DataEntryStatus.APPROVED
      );
      
      if (approvalTransition?.validateCondition) {
        return await approvalTransition.validateCondition(data);
      }
      
      return false;
    }
  },
  {
    from: DataEntryStatus.DRAFT,
    to: DataEntryStatus.APPROVED,
    requiredRoles: ['sectoradmin', 'regionadmin', 'superadmin'],
    conditions: ['valid_approval_permission'],
    description: 'Məlumatları birbaşa təsdiqləmək (admin)',
    validateCondition: async (data: TransitionContext) => {
      // Təsdiq icazəsini yoxla
      const { schoolId, userId, userRole } = data;
      
      try {
        // Get school information
        const { data: school } = await supabase
          .from('schools')
          .select('region_id, sector_id')
          .eq('id', schoolId)
          .single();

        if (!school) return false;

        // Get user roles and permissions
        const { data: userRoles } = await supabase
          .from('user_roles')
          .select('role, region_id, sector_id, school_id')
          .eq('user_id', userId);

        if (!userRoles || userRoles.length === 0) return false;

        // Check if user has permission to approve for this school
        const hasPermission = userRoles.some(userRole => {
          if (userRole.role === 'superadmin') return true;
          if (userRole.role === 'regionadmin' && userRole.region_id === school.region_id) return true;
          if (userRole.role === 'sectoradmin' && userRole.sector_id === school.sector_id) return true;
          return false;
        });

        return hasPermission;
      } catch (error) {
        console.error('Error validating approval permission:', error);
        return false;
      }
    }
  },
  {
    from: DataEntryStatus.PENDING,
    to: DataEntryStatus.APPROVED,
    requiredRoles: ['sectoradmin', 'regionadmin', 'superadmin'],
    conditions: ['valid_approval_permission'],
    description: 'Məlumatları təsdiqləmək',
    validateCondition: async (data: TransitionContext) => {
      // Təsdiq icazəsini yoxla
      const { schoolId, userId, userRole } = data;
      
      try {
        // Get school information
        const { data: school } = await supabase
          .from('schools')
          .select('region_id, sector_id')
          .eq('id', schoolId)
          .single();

        if (!school) return false;

        // Get user roles and permissions
        const { data: userRoles } = await supabase
          .from('user_roles')
          .select('role, region_id, sector_id, school_id')
          .eq('user_id', userId);

        if (!userRoles || userRoles.length === 0) return false;

        // Check if user has permission to approve for this school
        const hasPermission = userRoles.some(userRole => {
          if (userRole.role === 'superadmin') return true;
          if (userRole.role === 'regionadmin' && userRole.region_id === school.region_id) return true;
          if (userRole.role === 'sectoradmin' && userRole.sector_id === school.sector_id) return true;
          return false;
        });

        return hasPermission;
      } catch (error) {
        console.error('Error validating approval permission:', error);
        return false;
      }
    }
  },
  {
    from: DataEntryStatus.PENDING,
    to: DataEntryStatus.REJECTED,
    requiredRoles: ['sectoradmin', 'regionadmin', 'superadmin'],
    conditions: ['valid_approval_permission', 'rejection_reason_provided'],
    description: 'Məlumatları rədd etmək',
    validateCondition: async (data: TransitionContext) => {
      // Rədd səbəbinin mövcudluğunu və icazəni yoxla
      const { comment } = data;
      
      if (!comment || comment.trim().length === 0) {
        return false; // Rejection reason is required
      }
      
      // Use same permission check as approval
      const approvalTransition = STATUS_TRANSITIONS.find(t => 
        t.from === DataEntryStatus.PENDING && t.to === DataEntryStatus.APPROVED
      );
      
      if (approvalTransition?.validateCondition) {
        return await approvalTransition.validateCondition(data);
      }
      
      return false;
    }
  },
  {
    from: DataEntryStatus.REJECTED,
    to: DataEntryStatus.DRAFT,
    requiredRoles: ['schooladmin'],
    conditions: ['is_entry_owner'],
    description: 'Rədd edilmiş məlumatları yenidən hazırlamaq',
    validateCondition: async (data: TransitionContext) => {
      // Yalnız məktəb admininin öz məlumatını yenidən draft-a çevirə bilməsini yoxla
      const { schoolId, userId, userRole } = data;
      
      if (userRole !== 'schooladmin') return false;
      
      try {
        // Check if user is admin of this school
        const { data: userRoles } = await supabase
          .from('user_roles')
          .select('school_id')
          .eq('user_id', userId)
          .eq('role', 'schooladmin');

        if (!userRoles || userRoles.length === 0) return false;
        
        return userRoles.some(role => role.school_id === schoolId);
      } catch (error) {
        console.error('Error validating school ownership:', error);
        return false;
      }
    }
  }
];

/**
 * StatusTransitionService - Status keçidlərini idarə edən əsas sinif
 */
export class StatusTransitionService {
  /**
   * Status keçidini yeni status history service ilə qeydə alır
   */
  private static async logStatusTransitionNew(
    schoolId: string,
    categoryId: string,
    oldStatus: DataEntryStatus,
    newStatus: DataEntryStatus,
    userId: string,
    comment?: string
  ): Promise<void> {
    try {
      // Create data entry identifier
      const dataEntryId = `${schoolId}-${categoryId}`;
      
      // Use new StatusHistoryService
      const result = await StatusHistoryService.logStatusChange(
        dataEntryId,
        oldStatus,
        newStatus,
        comment
      );
      
      if (result.success) {
        console.log('Status transition logged successfully:', {
          schoolId,
          categoryId,
          oldStatus,
          newStatus,
          userId,
          comment
        });
      } else {
        console.error('Failed to log status transition:', result.error);
        // Fallback to old method
        await this.logStatusTransition(
          schoolId,
          categoryId,
          oldStatus,
          newStatus,
          userId,
          comment
        );
      }
    } catch (error) {
      console.error('Error in new status transition logging:', error);
      // Fallback to old method
      await this.logStatusTransition(
        schoolId,
        categoryId,
        oldStatus,
        newStatus,
        userId,
        comment
      );
    }
  }

  /**
   * Status keçidinin mümkün olub-olmadığını yoxlayır
   */
  static async canTransition(
    currentStatus: DataEntryStatus,
    newStatus: DataEntryStatus,
    context: TransitionContext
  ): Promise<TransitionResult> {
    try {
      // Same status check
      if (currentStatus === newStatus) {
        return {
          allowed: true,
          reason: 'Status is already set to the target value'
        };
      }

      // Find transition rule
      const transition = STATUS_TRANSITIONS.find(t => 
        t.from === currentStatus && t.to === newStatus
      );

      if (!transition) {
        return {
          allowed: false,
          reason: `Status transition from ${currentStatus} to ${newStatus} is not allowed`,
          code: 'INVALID_TRANSITION'
        };
      }

      // Check user role
      if (!transition.requiredRoles.includes(context.userRole)) {
        return {
          allowed: false,
          reason: `Role ${context.userRole} cannot perform this transition`,
          code: 'INSUFFICIENT_ROLE'
        };
      }

      // Validate custom conditions
      if (transition.validateCondition) {
        const conditionMet = await transition.validateCondition(context);
        if (!conditionMet) {
          return {
            allowed: false,
            reason: `Transition conditions not met: ${transition.conditions.join(', ')}`,
            code: 'CONDITIONS_NOT_MET'
          };
        }
      }

      return {
        allowed: true,
        reason: transition.description
      };
    } catch (error: any) {
      console.error('Error checking transition permission:', error);
      return {
        allowed: false,
        reason: `Error validating transition: ${error.message}`,
        code: 'VALIDATION_ERROR'
      };
    }
  }

  /**
   * Status keçidini həyata keçirir
   */
  static async executeTransition(
    currentStatus: DataEntryStatus,
    newStatus: DataEntryStatus,
    context: TransitionContext
  ): Promise<ServiceResponse> {
    try {
      // Validate transition
      const canTransition = await this.canTransition(currentStatus, newStatus, context);
      
      if (!canTransition.allowed) {
        return {
          success: false,
          error: canTransition.reason,
          message: 'Status transition not allowed'
        };
      }

      // Execute status update in database
      const { error } = await supabase
        .from('data_entries')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('school_id', context.schoolId)
        .eq('category_id', context.categoryId);

      if (error) {
        throw error;
      }

      // Log the transition using new StatusHistoryService
      await this.logStatusTransitionNew(
        context.schoolId,
        context.categoryId,
        currentStatus,
        newStatus,
        context.userId,
        context.comment
      );

      // Send notification (if needed)
      await this.sendStatusChangeNotification(
        context.schoolId,
        context.categoryId,
        currentStatus,
        newStatus,
        context.userId
      );

      return {
        success: true,
        status: newStatus,
        message: `Status successfully changed from ${currentStatus} to ${newStatus}`
      };
    } catch (error: any) {
      console.error('Error executing status transition:', error);
      return {
        success: false,
        error: error.message || 'Unknown error during status transition',
        message: 'Failed to change status'
      };
    }
  }

  /**
   * Status keçidini audit log-da qeydə alır
   */
  private static async logStatusTransition(
    schoolId: string,
    categoryId: string,
    oldStatus: DataEntryStatus,
    newStatus: DataEntryStatus,
    userId: string,
    comment?: string
  ): Promise<void> {
    try {
      // For now, we'll use audit_logs table
      // Later we can create a dedicated status_transition_log table
      await supabase
        .from('audit_logs')
        .insert({
          user_id: userId,
          action: 'status_transition',
          entity_type: 'data_entry',
          entity_id: `${schoolId}-${categoryId}`,
          old_value: { status: oldStatus },
          new_value: { status: newStatus },
          ip_address: null, // Will be populated by RLS/triggers if needed
          user_agent: null,
          created_at: new Date().toISOString()
        });

      console.log('Status transition logged:', {
        schoolId,
        categoryId,
        oldStatus,
        newStatus,
        userId,
        comment
      });
    } catch (error) {
      console.error('Error logging status transition:', error);
      // Don't throw - logging failure shouldn't break the transition
    }
  }

  /**
   * Status dəyişikliyi haqqında bildiriş göndərir
   */
  private static async sendStatusChangeNotification(
    schoolId: string,
    categoryId: string,
    oldStatus: DataEntryStatus,
    newStatus: DataEntryStatus,
    userId: string
  ): Promise<void> {
    try {
      // Get relevant users to notify
      const notificationTargets = await this.getNotificationTargets(
        schoolId,
        categoryId,
        newStatus,
        userId
      );

      // Create notifications
      for (const target of notificationTargets) {
        await supabase
          .from('notifications')
          .insert({
            user_id: target.userId,
            type: 'status_change',
            title: this.getNotificationTitle(oldStatus, newStatus),
            message: this.getNotificationMessage(schoolId, categoryId, oldStatus, newStatus),
            related_entity_id: `${schoolId}-${categoryId}`,
            related_entity_type: 'data_entry',
            is_read: false,
            priority: this.getNotificationPriority(newStatus),
            created_at: new Date().toISOString()
          });
      }

      console.log('Status change notifications sent:', {
        targets: notificationTargets.length,
        oldStatus,
        newStatus
      });
    } catch (error) {
      console.error('Error sending status change notification:', error);
      // Don't throw - notification failure shouldn't break the transition
    }
  }

  /**
   * Status dəyişikliyi üçün bildiriş alacaq istifadəçiləri tapır
   */
  private static async getNotificationTargets(
    schoolId: string,
    categoryId: string,
    newStatus: DataEntryStatus,
    actorUserId: string
  ): Promise<Array<{ userId: string; role: string }>> {
    try {
      const targets: Array<{ userId: string; role: string }> = [];

      // Get school information
      const { data: school } = await supabase
        .from('schools')
        .select('region_id, sector_id')
        .eq('id', schoolId)
        .single();

      if (!school) return targets;

      // Based on new status, determine who should be notified
      if (newStatus === DataEntryStatus.PENDING) {
        // Notify sector and region admins when submitted for approval
        const { data: admins } = await supabase
          .from('user_roles')
          .select('user_id, role')
          .or(`
            and(role.eq.sectoradmin,sector_id.eq.${school.sector_id}),
            and(role.eq.regionadmin,region_id.eq.${school.region_id}),
            role.eq.superadmin
          `)
          .neq('user_id', actorUserId); // Don't notify the actor

        if (admins) {
          targets.push(...admins.map(admin => ({ 
            userId: admin.user_id, 
            role: admin.role 
          })));
        }
      } else if (newStatus === DataEntryStatus.APPROVED || newStatus === DataEntryStatus.REJECTED) {
        // Notify school admin when approved/rejected
        const { data: schoolAdmins } = await supabase
          .from('user_roles')
          .select('user_id, role')
          .eq('role', 'schooladmin')
          .eq('school_id', schoolId)
          .neq('user_id', actorUserId);

        if (schoolAdmins) {
          targets.push(...schoolAdmins.map(admin => ({ 
            userId: admin.user_id, 
            role: admin.role 
          })));
        }
      }

      return targets;
    } catch (error) {
      console.error('Error getting notification targets:', error);
      return [];
    }
  }

  /**
   * Bildiriş başlığını yaradır
   */
  private static getNotificationTitle(oldStatus: DataEntryStatus, newStatus: DataEntryStatus): string {
    const statusTitles = {
      [DataEntryStatus.PENDING]: 'Təsdiq üçün göndərildi',
      [DataEntryStatus.APPROVED]: 'Məlumatlar təsdiqləndi',
      [DataEntryStatus.REJECTED]: 'Məlumatlar rədd edildi',
      [DataEntryStatus.DRAFT]: 'Məlumatlar yenidən hazırlanır'
    };

    return statusTitles[newStatus] || 'Status dəyişikliyi';
  }

  /**
   * Bildiriş mətnini yaradır
   */
  private static getNotificationMessage(
    schoolId: string,
    categoryId: string,
    oldStatus: DataEntryStatus,
    newStatus: DataEntryStatus
  ): string {
    // This would ideally include school and category names
    // For now, using IDs - can be enhanced later
    return `Data entry status changed from ${oldStatus} to ${newStatus} for school ${schoolId}, category ${categoryId}`;
  }

  /**
   * Bildiriş prioritetini təyin edir
   */
  private static getNotificationPriority(status: DataEntryStatus): string {
    switch (status) {
      case DataEntryStatus.APPROVED:
        return 'normal';
      case DataEntryStatus.REJECTED:
        return 'high';
      case DataEntryStatus.PENDING:
        return 'medium';
      default:
        return 'normal';
    }
  }

  /**
   * Mövcud status-u əldə edir
   */
  static async getCurrentStatus(schoolId: string, categoryId: string): Promise<DataEntryStatus | null> {
    try {
      const { data: entries } = await supabase
        .from('data_entries')
        .select('status')
        .eq('school_id', schoolId)
        .eq('category_id', categoryId)
        .limit(1);

      if (!entries || entries.length === 0) {
        return DataEntryStatus.DRAFT; // Default to draft if no entries
      }

      return entries[0].status as DataEntryStatus || DataEntryStatus.DRAFT;
    } catch (error) {
      console.error('Error getting current status:', error);
      return null;
    }
  }

  /**
   * Status üçün icazə verilən əməliyyatları qaytarır
   */
  static getAvailableActions(currentStatus: DataEntryStatus, userRole: string): string[] {
    const actions: string[] = [];

    STATUS_TRANSITIONS.forEach(transition => {
      if (transition.from === currentStatus && transition.requiredRoles.includes(userRole)) {
        actions.push(transition.to);
      }
    });

    return actions;
  }

  /**
   * Status-un rəng kodunu qaytarır (UI üçün)
   */
  static getStatusColor(status: DataEntryStatus): string {
    switch (status) {
      case DataEntryStatus.DRAFT:
        return 'gray';
      case DataEntryStatus.PENDING:
        return 'blue';
      case DataEntryStatus.APPROVED:
        return 'green';
      case DataEntryStatus.REJECTED:
        return 'red';
      default:
        return 'gray';
    }
  }

  /**
   * Status tarixçəsini əldə edir
   */
  static async getStatusHistory(schoolId: string, categoryId: string) {
    try {
      const dataEntryId = `${schoolId}-${categoryId}`;
      return await StatusHistoryService.getEntryStatusHistory(dataEntryId);
    } catch (error) {
      console.error('Error getting status history:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: []
      };
    }
  }

  /**
   * Status-un icon-unu qaytarır (UI üçün)
   */
  static getStatusIcon(status: DataEntryStatus): string {
    switch (status) {
      case DataEntryStatus.DRAFT:
        return 'FileEdit';
      case DataEntryStatus.PENDING:
        return 'Clock';
      case DataEntryStatus.APPROVED:
        return 'CheckCircle';
      case DataEntryStatus.REJECTED:
        return 'XCircle';
      default:
        return 'File';
    }
  }
}

export default StatusTransitionService;
