
import { supabase } from '@/integrations/supabase/client';
import { DataEntryStatus } from '@/types/core/dataEntry';

export interface ApprovalFilter {
  status?: 'pending' | 'approved' | 'rejected' | 'draft';
  regionId?: string;
  sectorId?: string;
  categoryId?: string;
  searchTerm?: string;
  dateRange?: { start: Date; end: Date };
}

export interface ApprovalItem {
  id: string; // schoolId-categoryId format
  schoolId: string;
  schoolName: string;
  categoryId: string;
  categoryName: string;
  status: DataEntryStatus;
  submittedBy?: string;
  submittedAt?: string;
  completionRate: number;
  canApprove: boolean;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  entryCount?: number;
}

export interface ApprovalStats {
  pending: number;
  approved: number;
  rejected: number;
  draft: number;
  total: number;
}

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
}

class EnhancedApprovalService {
  
  /**
   * UUID formatını yoxlayır və təmizləyir
   */
  private static validateAndCleanUUID(uuid: string): string {
    if (!uuid) {
      throw new Error('UUID boş ola bilməz');
    }
    
    const cleanUuid = uuid.trim().toLowerCase();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
    
    if (!uuidRegex.test(cleanUuid)) {
      throw new Error(`Yanlış UUID formatı: ${uuid}`);
    }
    
    return cleanUuid;
  }

  /**
   * Entry ID-ni parse edir (schoolId-categoryId)
   */
  private static parseEntryId(entryId: string): { schoolId: string; categoryId: string } {
    if (!entryId || typeof entryId !== 'string') {
      throw new Error('Entry ID yanlışdır');
    }

    const parts = entryId.split('-');
    if (parts.length < 8) { // UUID-də 8 hissə olmalıdır (4+4)
      throw new Error(`Entry ID formatı yanlışdır: ${entryId}`);
    }

    // UUID-ləri yenidən birləşdiririk (hər UUID 5 hissəyə bölünür)
    const schoolId = parts.slice(0, 5).join('-');
    const categoryId = parts.slice(5).join('-');

    try {
      const cleanSchoolId = this.validateAndCleanUUID(schoolId);
      const cleanCategoryId = this.validateAndCleanUUID(categoryId);
      
      return { schoolId: cleanSchoolId, categoryId: cleanCategoryId };
    } catch (error) {
      throw new Error(`Entry ID parse xətası: ${error.message}`);
    }
  }

  /**
   * İstifadəçinin təsdiq icazəsini yoxlayır
   */
  private static async checkApprovalPermissions(schoolId: string, categoryId: string): Promise<boolean> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('İstifadəçi təsdiqlənmədi:', userError);
        return false;
      }

      // İstifadəçi rolunu əldə et
      const { data: userRoles, error: roleError } = await supabase
        .from('user_roles')
        .select('role, region_id, sector_id, school_id')
        .eq('user_id', user.id)
        .single();

      if (roleError || !userRoles) {
        console.error('İstifadəçi rolu alınmadı:', roleError);
        return false;
      }

      // SuperAdmin hər zaman icazəlidir
      if (userRoles.role === 'superadmin') {
        return true;
      }

      // Məktəb məlumatlarını əldə et
      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .select('id, region_id, sector_id')
        .eq('id', schoolId)
        .single();

      if (schoolError || !school) {
        console.error('Məktəb məlumatları alınmadı:', schoolError);
        return false;
      }

      // Region admin öz regionundakı məktəbləri təsdiq edə bilər
      if (userRoles.role === 'regionadmin' && userRoles.region_id === school.region_id) {
        return true;
      }

      // Sector admin öz sektorundakı məktəbləri təsdiq edə bilər
      if (userRoles.role === 'sectoradmin' && userRoles.sector_id === school.sector_id) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('İcazə yoxlamasında xəta:', error);
      return false;
    }
  }

  /**
   * Təsdiq üçün məlumatları əldə edir
   */
  static async getApprovalItems(filter: ApprovalFilter = {}): Promise<ServiceResponse<ApprovalItem[]>> {
    try {
      console.log('Approval məlumatları yüklənir...', filter);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return {
          success: false,
          error: 'İstifadəçi təsdiqlənmədi'
        };
      }

      // İstifadəçi rolunu əldə et
      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('role, region_id, sector_id')
        .eq('user_id', user.id)
        .single();

      if (roleError || !userRole) {
        return {
          success: false,
          error: 'İstifadəçi rolu alınmadı'
        };
      }

      // Məlumat giriş kombinasiyalarını əldə et
      let query = supabase
        .from('data_entries')
        .select(`
          school_id,
          category_id,
          status,
          created_at,
          schools!inner(id, name, region_id, sector_id),
          categories!inner(id, name)
        `)
        .not('status', 'is', null);

      // Status filter
      if (filter.status) {
        query = query.eq('status', filter.status);
      }

      // İstifadəçi roluna görə məhdudiyyət
      if (userRole.role === 'regionadmin' && userRole.region_id) {
        query = query.eq('schools.region_id', userRole.region_id);
      } else if (userRole.role === 'sectoradmin' && userRole.sector_id) {
        query = query.eq('schools.sector_id', userRole.sector_id);
      } else if (userRole.role !== 'superadmin') {
        return {
          success: false,
          error: 'Bu əməliyyat üçün icazəniz yoxdur'
        };
      }

      // Region filter
      if (filter.regionId) {
        query = query.eq('schools.region_id', filter.regionId);
      }

      // Sector filter  
      if (filter.sectorId) {
        query = query.eq('schools.sector_id', filter.sectorId);
      }

      // Category filter
      if (filter.categoryId) {
        query = query.eq('category_id', filter.categoryId);
      }

      const { data: entries, error } = await query.limit(100);

      if (error) {
        console.error('Məlumatlar alınarkən xəta:', error);
        return {
          success: false,
          error: `Məlumatlar alınarkən xəta: ${error.message}`
        };
      }

      if (!entries || entries.length === 0) {
        return {
          success: true,
          data: []
        };
      }

      // Kombinasiyaları qruplayırıq
      const combinationMap = new Map<string, any>();

      entries.forEach(entry => {
        const key = `${entry.school_id}-${entry.category_id}`;
        
        if (!combinationMap.has(key)) {
          combinationMap.set(key, {
            id: key,
            schoolId: entry.school_id,
            schoolName: entry.schools?.name || 'Naməlum məktəb',
            categoryId: entry.category_id,
            categoryName: entry.categories?.name || 'Naməlum kateqoriya',
            status: entry.status as DataEntryStatus,
            submittedAt: entry.created_at,
            completionRate: 100, // Əsas hesablama lazımdır
            canApprove: userRole.role !== 'schooladmin',
            entryCount: 1
          });
        } else {
          const existing = combinationMap.get(key);
          existing.entryCount++;
        }
      });

      const items = Array.from(combinationMap.values());

      console.log(`${items.length} approval məlumatı yükləndi`);

      return {
        success: true,
        data: items
      };

    } catch (error: any) {
      console.error('getApprovalItems xətası:', error);
      return {
        success: false,
        error: error.message || 'Naməlum xəta'
      };
    }
  }

  /**
   * Statistikalar əldə edir
   */
  static async getApprovalStats(filter: ApprovalFilter = {}): Promise<ServiceResponse<ApprovalStats>> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return {
          success: false,
          error: 'İstifadəçi təsdiqlənmədi'
        };
      }

      // İstifadəçi rolunu əldə et
      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('role, region_id, sector_id')
        .eq('user_id', user.id)
        .single();

      if (roleError || !userRole) {
        return {
          success: false,
          error: 'İstifadəçi rolu alınmadı'
        };
      }

      let query = supabase
        .from('data_entries')
        .select('status, schools!inner(region_id, sector_id)')
        .not('status', 'is', null);

      // İstifadəçi roluna görə məhdudiyyət
      if (userRole.role === 'regionadmin' && userRole.region_id) {
        query = query.eq('schools.region_id', userRole.region_id);
      } else if (userRole.role === 'sectoradmin' && userRole.sector_id) {
        query = query.eq('schools.sector_id', userRole.sector_id);
      }

      const { data: entries, error } = await query;

      if (error) {
        console.error('Statistika alınarkən xəta:', error);
        return {
          success: false,
          error: `Statistika alınarkən xəta: ${error.message}`
        };
      }

      const stats: ApprovalStats = {
        pending: 0,
        approved: 0,
        rejected: 0,
        draft: 0,
        total: 0
      };

      if (entries) {
        entries.forEach(entry => {
          stats.total++;
          switch (entry.status) {
            case 'pending':
              stats.pending++;
              break;
            case 'approved':
              stats.approved++;
              break;
            case 'rejected':
              stats.rejected++;
              break;
            case 'draft':
              stats.draft++;
              break;
          }
        });
      }

      return {
        success: true,
        data: stats
      };

    } catch (error: any) {
      console.error('getApprovalStats xətası:', error);
      return {
        success: false,
        error: error.message || 'Naməlum xəta'
      };
    }
  }

  /**
   * Məlumatı təsdiq edir
   */
  static async approveEntry(entryId: string, comment?: string): Promise<ServiceResponse> {
    try {
      console.log('Məlumat təsdiq edilir:', entryId, comment);

      const { schoolId, categoryId } = this.parseEntryId(entryId);

      // İcazələri yoxla
      const hasPermission = await this.checkApprovalPermissions(schoolId, categoryId);
      if (!hasPermission) {
        return {
          success: false,
          error: 'Bu məlumatı təsdiq etmək üçün icazəniz yoxdur'
        };
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return {
          success: false,
          error: 'İstifadəçi təsdiqlənmədi'
        };
      }

      // Məlumatları təsdiq et
      const { error: updateError } = await supabase
        .from('data_entries')
        .update({
          status: 'approved',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          approval_comment: comment,
          updated_at: new Date().toISOString()
        })
        .eq('school_id', schoolId)
        .eq('category_id', categoryId)
        .eq('status', 'pending');

      if (updateError) {
        console.error('Təsdiq update xətası:', updateError);
        return {
          success: false,
          error: `Təsdiq zamanı xəta: ${updateError.message}`
        };
      }

      console.log('Məlumat uğurla təsdiqləndi:', entryId);

      return {
        success: true,
        message: 'Məlumat uğurla təsdiqləndi'
      };

    } catch (error: any) {
      console.error('approveEntry xətası:', error);
      return {
        success: false,
        error: error.message || 'Təsdiq zamanı xəta'
      };
    }
  }

  /**
   * Məlumatı rədd edir
   */
  static async rejectEntry(entryId: string, reason: string, comment?: string): Promise<ServiceResponse> {
    try {
      console.log('Məlumat rədd edilir:', entryId, reason, comment);

      if (!reason || reason.trim() === '') {
        return {
          success: false,
          error: 'Rədd səbəbi göstərilməlidir'
        };
      }

      const { schoolId, categoryId } = this.parseEntryId(entryId);

      // İcazələri yoxla
      const hasPermission = await this.checkApprovalPermissions(schoolId, categoryId);
      if (!hasPermission) {
        return {
          success: false,
          error: 'Bu məlumatı rədd etmək üçün icazəniz yoxdur'
        };
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return {
          success: false,
          error: 'İstifadəçi təsdiqlənmədi'
        };
      }

      // Məlumatları rədd et
      const { error: updateError } = await supabase
        .from('data_entries')
        .update({
          status: 'rejected',
          rejected_by: user.id,
          rejected_at: new Date().toISOString(),
          rejection_reason: reason,
          approval_comment: comment,
          updated_at: new Date().toISOString()
        })
        .eq('school_id', schoolId)
        .eq('category_id', categoryId)
        .eq('status', 'pending');

      if (updateError) {
        console.error('Rədd update xətası:', updateError);
        return {
          success: false,
          error: `Rədd zamanı xəta: ${updateError.message}`
        };
      }

      console.log('Məlumat uğurla rədd edildi:', entryId);

      return {
        success: true,
        message: 'Məlumat uğurla rədd edildi'
      };

    } catch (error: any) {
      console.error('rejectEntry xətası:', error);
      return {
        success: false,
        error: error.message || 'Rədd zamanı xəta'
      };
    }
  }

  /**
   * Toplu təsdiq/rədd əməliyyatı
   */
  static async bulkApprovalAction(
    ids: string[], 
    action: 'approve' | 'reject', 
    params: { reason?: string; comment?: string }
  ): Promise<ServiceResponse> {
    try {
      console.log('Toplu əməliyyat:', action, ids.length, 'məlumat', params);

      if (!ids || ids.length === 0) {
        return {
          success: false,
          error: 'Heç bir məlumat seçilməyib'
        };
      }

      if (action === 'reject' && (!params.reason || params.reason.trim() === '')) {
        return {
          success: false,
          error: 'Rədd üçün səbəb göstərilməlidir'
        };
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return {
          success: false,
          error: 'İstifadəçi təsdiqlənmədi'
        };
      }

      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      // Hər bir məlumatı fərdi olaraq emal et
      for (const entryId of ids) {
        try {
          const result = action === 'approve' 
            ? await this.approveEntry(entryId, params.comment)
            : await this.rejectEntry(entryId, params.reason!, params.comment);

          if (result.success) {
            successCount++;
          } else {
            errorCount++;
            errors.push(`${entryId}: ${result.error}`);
          }
        } catch (error: any) {
          errorCount++;
          errors.push(`${entryId}: ${error.message}`);
        }
      }

      const actionText = action === 'approve' ? 'təsdiqləndi' : 'rədd edildi';

      return {
        success: successCount > 0,
        data: {
          successCount,
          errorCount,
          errors
        },
        message: `${successCount} məlumat uğurla ${actionText}. ${errorCount} məlumatda xəta.`
      };

    } catch (error: any) {
      console.error('bulkApprovalAction xətası:', error);
      return {
        success: false,
        error: error.message || 'Toplu əməliyyat zamanı xəta'
      };
    }
  }
}

export default EnhancedApprovalService;
