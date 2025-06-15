import { supabase } from '@/integrations/supabase/client';
import { DataEntryService, SaveDataEntryOptions, SaveResult } from './dataEntryService';
import { StatusTransitionService } from '@/services/statusTransitionService';
import { DataEntryStatus } from '@/types/core/dataEntry';

export interface ProxyDataEntryOptions extends SaveDataEntryOptions {
  proxyUserId: string;
  proxyUserRole: string;
  originalSchoolId: string;
  proxyReason?: string;
}

export interface ProxySubmitOptions {
  categoryId: string;
  schoolId: string;
  proxyUserId: string;
  proxyUserRole: string;
  proxyReason?: string;
  autoApprove?: boolean;
}

/**
 * Proxy Data Entry Service
 * 
 * SectorAdmin və digər yüksək səlahiyyətli istifadəçilərin
 * məktəb məlumatlarını proxy olaraq daxil etməsini idarə edir.
 * 
 * Əsas xüsusiyyətlər:
 * - Proxy məlumat daxil etmə (SectorAdmin → SchoolAdmin əvəzinə)
 * - Avtomatik təsdiq (əgər proxy istifadəçisinin icazəsi varsa)
 * - Audit trail (kim, kimin əvəzinə, niyə)
 * - Notification sistemi
 */
export class ProxyDataEntryService {
  
  /**
   * Proxy olaraq məlumat saxlayır
   */
  static async saveProxyFormData(
    formData: Record<string, any>,
    options: ProxyDataEntryOptions
  ): Promise<SaveResult & { proxyInfo?: any }> {
    try {
      const { 
        categoryId, 
        schoolId, 
        proxyUserId, 
        proxyUserRole, 
        originalSchoolId,
        proxyReason = 'SectorAdmin proxy data entry',
        status = 'draft'
      } = options;

      // İcazə yoxlaması
      const hasPermission = await this.checkProxyPermission(
        proxyUserId, 
        proxyUserRole, 
        schoolId
      );

      if (!hasPermission.allowed) {
        return {
          success: false,
          error: `Proxy icazəsi yoxdur: ${hasPermission.reason}`
        };
      }

      // Proxy məlumatları əlavə et
      const proxyEntries = Object.entries(formData)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([columnId, value]) => ({
          school_id: schoolId,
          category_id: categoryId,
          column_id: columnId,
          value: String(value),
          status,
          created_by: proxyUserId, // Proxy user yaratdı
          proxy_created_by: proxyUserId, // Proxy məlumatı
          proxy_reason: proxyReason,
          proxy_original_entity: originalSchoolId,
          updated_at: new Date().toISOString()
        }));

      if (proxyEntries.length === 0) {
        return { success: true, savedCount: 0 };
      }

      // Verilənlər bazasına saxla
      const { error, count } = await supabase
        .from('data_entries')
        .upsert(proxyEntries, {
          onConflict: 'school_id,category_id,column_id',
          count: 'exact'
        });

      if (error) {
        throw new Error(error.message);
      }

      // Audit log yarat
      await this.createProxyAuditLog({
        proxyUserId,
        proxyUserRole,
        targetSchoolId: schoolId,
        categoryId,
        action: 'proxy_data_entry',
        reason: proxyReason,
        entriesCount: count || proxyEntries.length
      });

      // Məktəb adminə bildiriş göndər
      await this.notifySchoolAdmin(schoolId, categoryId, proxyUserId, 'data_entered');

      return {
        success: true,
        savedCount: count || proxyEntries.length,
        proxyInfo: {
          proxyUser: proxyUserId,
          reason: proxyReason,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Proxy məlumat saxlama xətası';
      console.error('ProxyDataEntryService.saveProxyFormData error:', error);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Proxy olaraq məlumatları təsdiq üçün göndərir
   * SectorAdmin üçün avtomatik təsdiq də edə bilər
   */
  static async submitProxyData(options: ProxySubmitOptions): Promise<SaveResult & { autoApproved?: boolean }> {
    try {
      const { 
        categoryId, 
        schoolId, 
        proxyUserId, 
        proxyUserRole,
        proxyReason = 'SectorAdmin proxy submission',
        autoApprove = true // Default: SectorAdmin üçün avtomatik təsdiq
      } = options;

      // İcazə yoxlaması
      const hasPermission = await this.checkProxyPermission(proxyUserId, proxyUserRole, schoolId);
      
      if (!hasPermission.allowed) {
        return {
          success: false,
          error: `Proxy icazəsi yoxdur: ${hasPermission.reason}`
        };
      }

      let finalStatus: DataEntryStatus = 'pending';
      let autoApproved = false;

      // Əgər proxy istifadəçi həm də təsdiq icazəsi varsa, birbaşa təsdiq et
      if (autoApprove && proxyUserRole && ['sectoradmin', 'regionadmin', 'superadmin'].includes(proxyUserRole)) {
        const canAutoApprove = await this.checkAutoApprovalPermission(proxyUserId, proxyUserRole, schoolId);
        
        if (canAutoApprove.allowed) {
          finalStatus = 'approved';
          autoApproved = true;
        }
      }

      // Status yenilə
      const { error, count } = await supabase
        .from('data_entries')
        .update({
          status: finalStatus,
          updated_at: new Date().toISOString(),
          ...(autoApproved && {
            approved_by: proxyUserId,
            approved_at: new Date().toISOString()
          })
        })
        .eq('school_id', schoolId)
        .eq('category_id', categoryId)
        .in('status', ['draft', 'pending'])
        .select('*', { count: 'exact' });

      if (error) {
        throw new Error(error.message);
      }

      // Audit log
      await this.createProxyAuditLog({
        proxyUserId,
        proxyUserRole,
        targetSchoolId: schoolId,
        categoryId,
        action: autoApproved ? 'proxy_submit_and_approve' : 'proxy_submit',
        reason: proxyReason,
        entriesCount: count || 0
      });

      // Bildirişlər
      const notificationType = autoApproved ? 'data_approved_by_proxy' : 'data_submitted_by_proxy';
      await this.notifySchoolAdmin(schoolId, categoryId, proxyUserId, notificationType);

      return {
        success: true,
        savedCount: count || 0,
        autoApproved
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Proxy göndərmə xətası';
      console.error('ProxyDataEntryService.submitProxyData error:', error);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Proxy icazəsini yoxlayır
   */
  private static async checkProxyPermission(
    userId: string, 
    userRole: string, 
    targetSchoolId: string
  ): Promise<{ allowed: boolean; reason: string }> {
    try {
      // SuperAdmin həmişə edə bilər
      if (userRole === 'superadmin') {
        return { allowed: true, reason: 'SuperAdmin privilege' };
      }

      // Məktəb məlumatlarını əldə et
      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .select('id, name, sector_id, region_id')
        .eq('id', targetSchoolId)
        .single();

      if (schoolError || !school) {
        return { allowed: false, reason: 'Məktəb tapılmadı' };
      }

      // İstifadəçi rollarını əldə et
      const { data: userRoles, error: roleError } = await supabase
        .from('user_roles')
        .select('role, region_id, sector_id, school_id')
        .eq('user_id', userId);

      if (roleError || !userRoles || userRoles.length === 0) {
        return { allowed: false, reason: 'İstifadəçi rolları tapılmadı' };
      }

      // İcazə yoxlaması
      const hasValidRole = userRoles.some(role => {
        if (role.role === 'superadmin') return true;
        if (role.role === 'regionadmin' && role.region_id === school.region_id) return true;
        if (role.role === 'sectoradmin' && role.sector_id === school.sector_id) return true;
        return false;
      });

      if (!hasValidRole) {
        return { 
          allowed: false, 
          reason: `${userRole} rolunun bu məktəb üçün proxy icazəsi yoxdur` 
        };
      }

      return { allowed: true, reason: 'İcazə təsdiqləndi' };

    } catch (error) {
      console.error('Proxy permission check error:', error);
      return { 
        allowed: false, 
        reason: 'İcazə yoxlanmasında xəta baş verdi' 
      };
    }
  }

  /**
   * Avtomatik təsdiq icazəsini yoxlayır
   */
  private static async checkAutoApprovalPermission(
    userId: string, 
    userRole: string, 
    targetSchoolId: string
  ): Promise<{ allowed: boolean; reason: string }> {
    // StatusTransitionService-dən istifadə edərək təsdiq icazəsini yoxla
    try {
      const transitionContext = {
        schoolId: targetSchoolId,
        categoryId: '', // Bu konkret kontekstdə lazım deyil
        userId,
        userRole
      };

      // PENDING → APPROVED keçidinin mümkünlüyünü yoxla
      const canApprove = await StatusTransitionService.canTransition(
        'pending' as DataEntryStatus,
        'approved' as DataEntryStatus,
        transitionContext
      );

      return {
        allowed: canApprove.allowed,
        reason: canApprove.reason || 'Təsdiq icazəsi yoxlanıldı'
      };

    } catch (error) {
      console.error('Auto approval permission check error:', error);
      return { 
        allowed: false, 
        reason: 'Avtomatik təsdiq icazəsi yoxlanmasında xəta' 
      };
    }
  }

  /**
   * Proxy əməliyyat audit log-u yaradır
   */
  private static async createProxyAuditLog(options: {
    proxyUserId: string;
    proxyUserRole: string;
    targetSchoolId: string;
    categoryId: string;
    action: string;
    reason: string;
    entriesCount: number;
  }): Promise<void> {
    try {
      await supabase
        .from('audit_logs')
        .insert({
          user_id: options.proxyUserId,
          action: options.action,
          entity_type: 'proxy_data_entry',
          entity_id: `${options.targetSchoolId}-${options.categoryId}`,
          old_value: null,
          new_value: {
            proxy_user_role: options.proxyUserRole,
            target_school_id: options.targetSchoolId,
            category_id: options.categoryId,
            entries_count: options.entriesCount,
            reason: options.reason
          },
          created_at: new Date().toISOString()
        });

      console.log('Proxy audit log created:', options);
    } catch (error) {
      console.error('Error creating proxy audit log:', error);
      // Log xətası əsas əməliyyatı pozmasın
    }
  }

  /**
   * Məktəb adminə proxy əməliyyat barədə bildiriş göndərir
   */
  private static async notifySchoolAdmin(
    schoolId: string,
    categoryId: string,
    proxyUserId: string,
    notificationType: 'data_entered' | 'data_submitted_by_proxy' | 'data_approved_by_proxy'
  ): Promise<void> {
    try {
      // Məktəb adminlərini tap
      const { data: schoolAdmins, error } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'schooladmin')
        .eq('school_id', schoolId);

      if (error || !schoolAdmins || schoolAdmins.length === 0) {
        console.log('No school admins found for notification');
        return;
      }

      // Proxy istifadəçi məlumatlarını əldə et
      const { data: proxyUser } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', proxyUserId)
        .single();

      // Məktəb və kateqoriya adlarını əldə et
      const [schoolData, categoryData] = await Promise.all([
        supabase.from('schools').select('name').eq('id', schoolId).single(),
        supabase.from('categories').select('name').eq('id', categoryId).single()
      ]);

      const notificationMessages = {
        data_entered: 'Sektor admini sizin məktəbiniz üçün məlumat daxil etdi',
        data_submitted_by_proxy: 'Sektor admini sizin məktəbinizin məlumatlarını təsdiq üçün göndərdi',
        data_approved_by_proxy: 'Sektor admini sizin məktəbinizin məlumatlarını təsdiq etdi'
      };

      // Hər bir məktəb adminə bildiriş göndər
      for (const admin of schoolAdmins) {
        await supabase
          .from('notifications')
          .insert({
            user_id: admin.user_id,
            type: 'proxy_operation',
            title: 'Proxy Məlumat Əməliyyatı',
            message: `${notificationMessages[notificationType]}. Proxy: ${proxyUser?.full_name || 'Naməlum'}, Kateqoriya: ${categoryData?.data?.name || 'Naməlum'}`,
            related_entity_id: `${schoolId}-${categoryId}`,
            related_entity_type: 'proxy_data_entry',
            is_read: false,
            priority: 'normal',
            created_at: new Date().toISOString()
          });
      }

      console.log(`Proxy notifications sent to ${schoolAdmins.length} school admins`);
    } catch (error) {
      console.error('Error sending proxy notification:', error);
      // Bildiriş xətası əsas əməliyyatı pozmasın
    }
  }

  /**
   * Proxy məlumatların statusunu yoxlayır
   */
  static async getProxyDataStatus(
    schoolId: string,
    categoryId: string
  ): Promise<{
    success: boolean;
    isProxyData?: boolean;
    proxyInfo?: any;
    status?: DataEntryStatus;
    error?: string;
  }> {
    try {
      const { data: entries, error } = await supabase
        .from('data_entries')
        .select('status, created_by, proxy_created_by, proxy_reason, proxy_original_entity')
        .eq('school_id', schoolId)
        .eq('category_id', categoryId)
        .limit(1);

      if (error) {
        throw new Error(error.message);
      }

      if (!entries || entries.length === 0) {
        return {
          success: true,
          isProxyData: false,
          status: 'draft' as DataEntryStatus
        };
      }

      const entry = entries[0];
      const isProxyData = !!entry.proxy_created_by;

      return {
        success: true,
        isProxyData,
        status: entry.status as DataEntryStatus,
        ...(isProxyData && {
          proxyInfo: {
            proxyUserId: entry.proxy_created_by,
            reason: entry.proxy_reason,
            originalEntity: entry.proxy_original_entity
          }
        })
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Status yoxlama xətası';
      console.error('ProxyDataEntryService.getProxyDataStatus error:', error);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }
}

export default ProxyDataEntryService;
