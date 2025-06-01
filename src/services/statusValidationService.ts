import { supabase } from '@/integrations/supabase/client';
import { STATUS_TRANSITIONS, DataEntryStatus, StatusValidationResult } from '@/types/statusTransition';

export class StatusValidationService {
  /**
   * Status dəyişiklik icazəsini yoxlayır
   */
  static async validateTransition(
    currentStatus: DataEntryStatus,
    newStatus: DataEntryStatus,
    userRole: string,
    schoolId: string,
    categoryId: string,
    additionalData?: Record<string, any>
  ): Promise<StatusValidationResult> {
    
    // Eyni status-a keçid icazə verilir
    if (currentStatus === newStatus) {
      return { isValid: true, errors: [], warnings: [] };
    }
    
    // Müvafiq transition-ı tap
    const transition = STATUS_TRANSITIONS.find(
      t => t.from === currentStatus && t.to === newStatus
    );
    
    if (!transition) {
      return {
        isValid: false,
        errors: [`Status transition from '${currentStatus}' to '${newStatus}' is not allowed`],
        warnings: []
      };
    }
    
    // Rol icazəsini yoxla
    if (!transition.requiredRole.includes(userRole)) {
      return {
        isValid: false,
        errors: [`Role '${userRole}' cannot perform transition from '${currentStatus}' to '${newStatus}'`],
        warnings: []
      };
    }
    
    // Biznes qaydalarını yoxla
    const errors: string[] = [];
    const warnings: string[] = [];
    
    for (const rule of transition.validationRules) {
      const ruleResult = await this.validateRule(rule, { 
        schoolId, 
        categoryId, 
        userRole,
        ...additionalData 
      });
      
      if (!ruleResult.isValid) {
        errors.push(...ruleResult.errors);
      }
      warnings.push(...ruleResult.warnings);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * Fərdi biznes qaydalarını yoxlayır
   */
  private static async validateRule(
    rule: string, 
    context: Record<string, any>
  ): Promise<StatusValidationResult> {
    switch (rule) {
      case 'all_required_fields_completed':
        return await this.validateRequiredFields(context.schoolId, context.categoryId);
        
      case 'has_approval_permission':
        return await this.validateApprovalPermission(context.userRole, context.schoolId);
        
      case 'rejection_reason_provided':
        return {
          isValid: !!context.rejectionReason,
          errors: context.rejectionReason ? [] : ['Rejection reason is required'],
          warnings: []
        };
        
      default:
        console.warn(`Unknown validation rule: ${rule}`);
        return { isValid: true, errors: [], warnings: [] };
    }
  }
  
  /**
   * Məcburi sahələrin doldurulub-doldurulmadığını yoxlayır
   */
  private static async validateRequiredFields(
    schoolId: string, 
    categoryId: string
  ): Promise<StatusValidationResult> {
    try {
      // Kateqoriyanın məcburi sütunlarını əldə et
      const { data: columns, error: columnsError } = await supabase
        .from('columns')
        .select('id, name')
        .eq('category_id', categoryId)
        .eq('is_required', true);
      
      if (columnsError) {
        console.error('Error fetching required columns:', columnsError);
        return {
          isValid: false,
          errors: ['Error checking required fields'],
          warnings: []
        };
      }
      
      if (!columns || columns.length === 0) {
        // Məcburi sahə yoxdur, icazə ver
        return { isValid: true, errors: [], warnings: [] };
      }
      
      // Hazırki məlumat yazılarını əldə et
      const { data: entries, error: entriesError } = await supabase
        .from('data_entries')
        .select('column_id, value')
        .eq('school_id', schoolId)
        .eq('category_id', categoryId);
      
      if (entriesError) {
        console.error('Error fetching data entries:', entriesError);
        return {
          isValid: false,
          errors: ['Error checking existing data'],
          warnings: []
        };
      }
      
      // Doldurulmamış məcburi sahələri tap
      const missingFields = columns.filter(col => {
        const entry = entries?.find(e => e.column_id === col.id);
        return !entry || !entry.value || entry.value === '' || entry.value === null;
      });
      
      if (missingFields.length > 0) {
        return {
          isValid: false,
          errors: [`Missing required fields: ${missingFields.map(f => f.name).join(', ')}`],
          warnings: []
        };
      }
      
      return { isValid: true, errors: [], warnings: [] };
      
    } catch (error: any) {
      console.error('Validation error in validateRequiredFields:', error);
      return {
        isValid: false,
        errors: [`Validation error: ${error.message}`],
        warnings: []
      };
    }
  }
  
  /**
   * İstifadəçinin təsdiq icazəsini yoxlayır
   */
  private static async validateApprovalPermission(
    userRole: string,
    schoolId: string
  ): Promise<StatusValidationResult> {
    try {
      // Əsas rol yoxlaması
      const approvalRoles = ['sectoradmin', 'regionadmin', 'superadmin'];
      if (!approvalRoles.includes(userRole)) {
        return {
          isValid: false,
          errors: ['Insufficient permissions for approval operations'],
          warnings: []
        };
      }
      
      // İstifadəçi məlumatlarını əldə et
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { 
          isValid: false, 
          errors: ['User not authenticated'], 
          warnings: [] 
        };
      }
      
      // Əlavə səlahiyyət yoxlamaları (gələcəkdə genişləndiriləcək)
      // Bu hissə RLS funksiyaları ilə də edə bilərik
      
      return { isValid: true, errors: [], warnings: [] };
      
    } catch (error: any) {
      console.error('Error in validateApprovalPermission:', error);
      return {
        isValid: false,
        errors: [`Permission validation error: ${error.message}`],
        warnings: []
      };
    }
  }
  
  /**
   * Müəyyən status-dakı məlumatların redaktə icazəsini yoxlayır
   */
  static canEditWithStatus(
    currentStatus: DataEntryStatus | null,
    userRole: string
  ): { canEdit: boolean; reason?: string } {
    // Approved məlumatları heç kim redaktə edə bilməz
    if (currentStatus === 'approved') {
      return {
        canEdit: false,
        reason: 'Approved data cannot be modified'
      };
    }
    
    // Pending məlumatları yalnız təsdiq icazəsi olan adminlər redaktə edə bilər
    if (currentStatus === 'pending') {
      const canApprove = ['sectoradmin', 'regionadmin', 'superadmin'].includes(userRole);
      if (!canApprove) {
        return {
          canEdit: false,
          reason: 'Pending data can only be modified by sector/region administrators'
        };
      }
    }
    
    // Draft və rejected məlumatları əsas icazəsi olan istifadəçilər redaktə edə bilər
    const canEditRoles = ['schooladmin', 'sectoradmin', 'regionadmin', 'superadmin'];
    if (!canEditRoles.includes(userRole)) {
      return {
        canEdit: false,
        reason: 'Insufficient permissions to edit data'
      };
    }
    
    return { canEdit: true };
  }
}
