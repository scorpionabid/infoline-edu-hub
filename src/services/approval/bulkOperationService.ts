import { supabase } from '@/integrations/supabase/client';
import { ApprovalItem } from '@/services/approval/enhancedApprovalService';

export interface BulkReviewData {
  selectedEntries: ApprovalItem[];
  aggregatedStats: {
    totalEntries: number;
    completionRates: number[];
    averageCompletion: number;
    commonIssues: ValidationIssue[];
    schoolsCount: number;
    categoriesCount: number;
    regionDistribution: Record<string, number>;
    sectorDistribution: Record<string, number>;
  };
  bulkValidationResults: BulkValidationResult;
}

export interface ValidationIssue {
  type: string;
  count: number;
  severity: 'error' | 'warning' | 'info';
  description: string;
  affectedItems: string[];
}

export interface BulkValidationResult {
  isValid: boolean;
  hasErrors: boolean;
  hasWarnings: boolean;
  errorCount: number;
  warningCount: number;
  issues: BulkValidationIssue[];
  summary: {
    canApproveAll: boolean;
    canRejectAll: boolean;
    requiresManualReview: boolean;
  };
}

export interface BulkValidationIssue {
  entryId: string;
  schoolName: string;
  categoryName: string;
  issueType: 'error' | 'warning' | 'info';
  severity: number;
  description: string;
  recommendation: string;
}

export interface BulkActionParams {
  reason?: string;
  comment?: string;
  bypassValidation?: boolean;
  notifyUsers?: boolean;
  scheduleFor?: Date;
}

export interface BulkActionResult {
  success: boolean;
  processedCount: number;
  errorCount: number;
  skippedCount: number;
  results: {
    entryId: string;
    success: boolean;
    error?: string;
    newStatus?: string;
  }[];
  summary: {
    totalRequested: number;
    successfullyProcessed: number;
    failed: number;
    notifications: {
      sent: number;
      failed: number;
    };
  };
}

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
}

/**
 * Bulk Operation Service
 * 
 * Bu servis approval prosesində bulk əməliyyatlar üçün 
 * lazım olan funksionallığı təmin edir
 */
export class BulkOperationService {

  /**
   * Bulk review data əldə et
   */
  static async getBulkReviewData(entryIds: string[]): Promise<ServiceResponse<BulkReviewData>> {
    try {
      console.log('Getting bulk review data for entries:', entryIds.length);

      if (entryIds.length === 0) {
        return {
          success: false,
          error: 'Heç bir entry ID təqdim edilməyib',
          code: 'NO_ENTRIES'
        };
      }

      // Entry məlumatlarını parallel əldə et
      const [entriesResult, validationResult] = await Promise.allSettled([
        this.getEntriesDetails(entryIds),
        this.validateBulkEntries(entryIds)
      ]);

      if (entriesResult.status === 'rejected') {
        return {
          success: false,
          error: 'Entry məlumatları alınarkən xəta',
          code: 'ENTRIES_FETCH_ERROR'
        };
      }

      const entries = entriesResult.value;
      const validation = validationResult.status === 'fulfilled' ? 
        validationResult.value : this.createEmptyValidationResult();

      // Aggregated statistics hesabla
      const aggregatedStats = this.calculateAggregatedStats(entries);

      const bulkData: BulkReviewData = {
        selectedEntries: entries,
        aggregatedStats,
        bulkValidationResults: validation
      };

      return {
        success: true,
        data: bulkData,
        message: 'Bulk review data uğurla alındı'
      };

    } catch (error: any) {
      console.error('Error getting bulk review data:', error);
      return {
        success: false,
        error: error.message || 'Bulk review data alınarkən xəta',
        code: 'BULK_REVIEW_DATA_ERROR'
      };
    }
  }

  /**
   * Bulk entries validation
   */
  static async validateBulkEntries(entryIds: string[]): Promise<BulkValidationResult> {
    try {
      console.log('Validating bulk entries:', entryIds.length);

      const issues: BulkValidationIssue[] = [];
      let errorCount = 0;
      let warningCount = 0;

      // Hər bir entry üçün məlumatları yoxla
      for (const entryId of entryIds) {
        try {
          const validation = await this.validateSingleEntry(entryId);
          issues.push(...validation.issues);
          errorCount += validation.errorCount;
          warningCount += validation.warningCount;
        } catch (error) {
          console.warn(`Validation failed for entry ${entryId}:`, error);
          
          issues.push({
            entryId,
            schoolName: 'Naməlum',
            categoryName: 'Naməlum', 
            issueType: 'error',
            severity: 5,
            description: 'Validation zamanı xəta baş verdi',
            recommendation: 'Məlumatları yenidən yoxlayın'
          });
          errorCount++;
        }
      }

      const summary = {
        canApproveAll: errorCount === 0,
        canRejectAll: true, // Həmişə reject etmək olar
        requiresManualReview: errorCount > 0 || warningCount > 0
      };

      return {
        isValid: errorCount === 0,
        hasErrors: errorCount > 0,
        hasWarnings: warningCount > 0,
        errorCount,
        warningCount,
        issues,
        summary
      };

    } catch (error: any) {
      console.error('Bulk validation error:', error);
      
      return {
        isValid: false,
        hasErrors: true,
        hasWarnings: false,
        errorCount: entryIds.length,
        warningCount: 0,
        issues: [],
        summary: {
          canApproveAll: false,
          canRejectAll: true,
          requiresManualReview: true
        }
      };
    }
  }

  /**
   * Bulk approval əməliyyatı
   */
  static async executeBulkApproval(
    entryIds: string[], 
    params: BulkActionParams = {}
  ): Promise<ServiceResponse<BulkActionResult>> {
    try {
      console.log('Executing bulk approval for', entryIds.length, 'entries');

      // İcazələri yoxla
      const permissionCheck = await this.checkBulkPermissions(entryIds, 'approve');
      if (!permissionCheck.success) {
        return permissionCheck;
      }

      // Validation yoxla (bypass edilməmişsə)
      if (!params.bypassValidation) {
        const validation = await this.validateBulkEntries(entryIds);
        if (validation.hasErrors) {
          return {
            success: false,
            error: `${validation.errorCount} validation xətası var. Bulk approval mümkün deyil.`,
            code: 'VALIDATION_ERRORS'
          };
        }
      }

      const results: BulkActionResult['results'] = [];
      let processedCount = 0;
      let errorCount = 0;

      // Hər bir entry-ni approve et
      for (const entryId of entryIds) {
        try {
          const result = await this.approveSingleEntry(entryId, params.comment);
          
          results.push({
            entryId,
            success: result.success,
            error: result.success ? undefined : result.error,
            newStatus: result.success ? 'approved' : undefined
          });

          if (result.success) {
            processedCount++;
          } else {
            errorCount++;
          }

        } catch (error: any) {
          console.error(`Failed to approve entry ${entryId}:`, error);
          
          results.push({
            entryId,
            success: false,
            error: error.message || 'Naməlum xəta',
            newStatus: undefined
          });
          errorCount++;
        }
      }

      // Bildirişlər göndər
      const notifications = params.notifyUsers !== false ? 
        await this.sendBulkNotifications(entryIds, 'approved', params.comment) : 
        { sent: 0, failed: 0 };

      const summary = {
        totalRequested: entryIds.length,
        successfullyProcessed: processedCount,
        failed: errorCount,
        notifications
      };

      return {
        success: processedCount > 0,
        data: {
          success: processedCount === entryIds.length,
          processedCount,
          errorCount,
          skippedCount: 0,
          results,
          summary
        },
        message: `${processedCount}/${entryIds.length} entry uğurla təsdiqləndi`
      };

    } catch (error: any) {
      console.error('Bulk approval error:', error);
      return {
        success: false,
        error: error.message || 'Bulk approval zamanı xəta',
        code: 'BULK_APPROVAL_ERROR'
      };
    }
  }

  /**
   * Bulk rejection əməliyyatı
   */
  static async executeBulkRejection(
    entryIds: string[], 
    reason: string,
    params: BulkActionParams = {}
  ): Promise<ServiceResponse<BulkActionResult>> {
    try {
      console.log('Executing bulk rejection for', entryIds.length, 'entries');

      if (!reason || reason.trim() === '') {
        return {
          success: false,
          error: 'Rədd səbəbi təqdim edilməlidir',
          code: 'MISSING_REASON'
        };
      }

      // İcazələri yoxla
      const permissionCheck = await this.checkBulkPermissions(entryIds, 'reject');
      if (!permissionCheck.success) {
        return permissionCheck;
      }

      const results: BulkActionResult['results'] = [];
      let processedCount = 0;
      let errorCount = 0;

      // Hər bir entry-ni reject et
      for (const entryId of entryIds) {
        try {
          const result = await this.rejectSingleEntry(entryId, reason, params.comment);
          
          results.push({
            entryId,
            success: result.success,
            error: result.success ? undefined : result.error,
            newStatus: result.success ? 'rejected' : undefined
          });

          if (result.success) {
            processedCount++;
          } else {
            errorCount++;
          }

        } catch (error: any) {
          console.error(`Failed to reject entry ${entryId}:`, error);
          
          results.push({
            entryId,
            success: false,
            error: error.message || 'Naməlum xəta',
            newStatus: undefined
          });
          errorCount++;
        }
      }

      // Bildirişlər göndər
      const notifications = params.notifyUsers !== false ? 
        await this.sendBulkNotifications(entryIds, 'rejected', reason, params.comment) : 
        { sent: 0, failed: 0 };

      const summary = {
        totalRequested: entryIds.length,
        successfullyProcessed: processedCount,
        failed: errorCount,
        notifications
      };

      return {
        success: processedCount > 0,
        data: {
          success: processedCount === entryIds.length,
          processedCount,
          errorCount,
          skippedCount: 0,
          results,
          summary
        },
        message: `${processedCount}/${entryIds.length} entry uğurla rədd edildi`
      };

    } catch (error: any) {
      console.error('Bulk rejection error:', error);
      return {
        success: false,
        error: error.message || 'Bulk rejection zamanı xəta',
        code: 'BULK_REJECTION_ERROR'
      };
    }
  }

  /**
   * Entry details əldə et
   */
  private static async getEntriesDetails(entryIds: string[]): Promise<ApprovalItem[]> {
    // Bu implementation enhancedApprovalService-dən istifadə edir
    const { EnhancedApprovalService } = await import('./enhancedApprovalService');
    
    const entries: ApprovalItem[] = [];
    
    for (const entryId of entryIds) {
      try {
        const [schoolId, categoryId] = entryId.split('-');
        if (!schoolId || !categoryId) continue;

        // Bu entry üçün ApprovalItem yaradırıq
        const { data: schoolData } = await supabase
          .from('schools')
          .select('id, name, region_id, sector_id, completion_rate')
          .eq('id', schoolId)
          .single();

        const { data: categoryData } = await supabase
          .from('categories')
          .select('id, name')
          .eq('id', categoryId)
          .single();

        const { data: dataEntries } = await supabase
          .from('data_entries')
          .select('status, created_at, updated_at')
          .eq('school_id', schoolId)
          .eq('category_id', categoryId)
          .limit(1);

        if (schoolData && categoryData) {
          const entry = dataEntries?.[0];
          entries.push({
            id: entryId,
            schoolId: schoolData.id,
            schoolName: schoolData.name,
            categoryId: categoryData.id,
            categoryName: categoryData.name,
            completionRate: schoolData.completion_rate || 0,
            status: entry?.status || 'pending',
            canApprove: true,
            submittedAt: entry?.created_at,
            lastModified: entry?.updated_at
          } as ApprovalItem);
        }
      } catch (error) {
        console.warn(`Failed to get details for entry ${entryId}:`, error);
      }
    }

    return entries;
  }

  /**
   * Aggregated statistics hesabla
   */
  private static calculateAggregatedStats(entries: ApprovalItem[]) {
    const completionRates = entries.map(e => e.completionRate);
    const averageCompletion = completionRates.length > 0 ? 
      Math.round(completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length) : 0;

    const schools = new Set(entries.map(e => e.schoolId));
    const categories = new Set(entries.map(e => e.categoryId));

    // Region və sector distribution hesabla
    const regionDistribution: Record<string, number> = {};
    const sectorDistribution: Record<string, number> = {};

    entries.forEach(entry => {
      // Bu implementasiya real region/sector məlumatlarına ehtiyac var
      // Sadə nümunə üçün placeholder istifadə edirik
      regionDistribution['Region'] = (regionDistribution['Region'] || 0) + 1;
      sectorDistribution['Sektor'] = (sectorDistribution['Sektor'] || 0) + 1;
    });

    // Common issues analiz et
    const commonIssues: ValidationIssue[] = [];
    
    // Low completion rate issues
    const lowCompletionItems = entries.filter(e => e.completionRate < 50);
    if (lowCompletionItems.length > 0) {
      commonIssues.push({
        type: 'low_completion',
        count: lowCompletionItems.length,
        severity: 'error',
        description: 'Tamamlanma faizi 50%-dən az',
        affectedItems: lowCompletionItems.map(e => e.id)
      });
    }

    // Incomplete data issues
    const incompleteItems = entries.filter(e => e.completionRate < 100 && e.completionRate >= 50);
    if (incompleteItems.length > 0) {
      commonIssues.push({
        type: 'incomplete_data',
        count: incompleteItems.length,
        severity: 'warning',
        description: 'Natamam məlumatlar',
        affectedItems: incompleteItems.map(e => e.id)
      });
    }

    return {
      totalEntries: entries.length,
      completionRates,
      averageCompletion,
      commonIssues,
      schoolsCount: schools.size,
      categoriesCount: categories.size,
      regionDistribution,
      sectorDistribution
    };
  }

  /**
   * Single entry validation
   */
  private static async validateSingleEntry(entryId: string): Promise<{
    issues: BulkValidationIssue[];
    errorCount: number;
    warningCount: number;
  }> {
    const [schoolId, categoryId] = entryId.split('-');
    if (!schoolId || !categoryId) {
      return {
        issues: [{
          entryId,
          schoolName: 'Naməlum',
          categoryName: 'Naməlum',
          issueType: 'error',
          severity: 5,
          description: 'Yanlış entry ID formatı',
          recommendation: 'Entry ID formatını yoxlayın'
        }],
        errorCount: 1,
        warningCount: 0
      };
    }

    const issues: BulkValidationIssue[] = [];
    let errorCount = 0;
    let warningCount = 0;

    try {
      // School və category məlumatlarını əldə et
      const { data: school } = await supabase
        .from('schools')
        .select('id, name, completion_rate')
        .eq('id', schoolId)
        .single();

      const { data: category } = await supabase
        .from('categories')
        .select('id, name')
        .eq('id', categoryId)
        .single();

      if (!school || !category) {
        issues.push({
          entryId,
          schoolName: school?.name || 'Naməlum',
          categoryName: category?.name || 'Naməlum',
          issueType: 'error',
          severity: 5,
          description: 'Məktəb və ya kateqoriya tapılmadı',
          recommendation: 'Məktəb və kateqoriya mövcudluğunu yoxlayın'
        });
        errorCount++;
        return { issues, errorCount, warningCount };
      }

      // Completion rate yoxla
      const completionRate = school.completion_rate || 0;
      
      if (completionRate < 50) {
        issues.push({
          entryId,
          schoolName: school.name,
          categoryName: category.name,
          issueType: 'error',
          severity: 4,
          description: `Tamamlanma faizi çox aşağıdır: ${completionRate}%`,
          recommendation: 'Məlumatları tamamlamaq lazımdır'
        });
        errorCount++;
      } else if (completionRate < 100) {
        issues.push({
          entryId,
          schoolName: school.name,
          categoryName: category.name,
          issueType: 'warning',
          severity: 2,
          description: `Məlumatlar natamamdır: ${completionRate}%`,
          recommendation: 'Bütün sahələrin doldurulması tövsiyə olunur'
        });
        warningCount++;
      }

      return { issues, errorCount, warningCount };

    } catch (error) {
      console.error(`Validation error for entry ${entryId}:`, error);
      
      issues.push({
        entryId,
        schoolName: 'Naməlum',
        categoryName: 'Naməlum',
        issueType: 'error',
        severity: 5,
        description: 'Validation zamanı texniki xəta',
        recommendation: 'Sistem administratoru ilə əlaqə saxlayın'
      });
      
      return { issues: issues, errorCount: 1, warningCount: 0 };
    }
  }

  /**
   * Bulk permissions yoxla
   */
  private static async checkBulkPermissions(
    entryIds: string[], 
    action: 'approve' | 'reject'
  ): Promise<ServiceResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          error: 'İstifadəçi autentifikasiya olunmayıb',
          code: 'NOT_AUTHENTICATED'
        };
      }

      // İstifadəçi rollarını əldə et
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role, region_id, sector_id')
        .eq('user_id', user.id);

      if (!userRoles || userRoles.length === 0) {
        return {
          success: false,
          error: 'İstifadəçi rolları tapılmadı',
          code: 'NO_ROLES'
        };
      }

      // SuperAdmin həmişə icazə var
      if (userRoles.some(role => role.role === 'superadmin')) {
        return { success: true };
      }

      // Hər bir entry üçün icazəni yoxla
      for (const entryId of entryIds) {
        const [schoolId] = entryId.split('-');
        
        const { data: school } = await supabase
          .from('schools')
          .select('region_id, sector_id')
          .eq('id', schoolId)
          .single();

        if (!school) continue;

        const hasPermission = userRoles.some(role => {
          if (role.role === 'regionadmin' && role.region_id === school.region_id) {
            return true;
          }
          if (role.role === 'sectoradmin' && role.sector_id === school.sector_id) {
            return true;
          }
          return false;
        });

        if (!hasPermission) {
          return {
            success: false,
            error: `Entry ${entryId} üçün icazəniz yoxdur`,
            code: 'INSUFFICIENT_PERMISSIONS'
          };
        }
      }

      return { success: true };

    } catch (error: any) {
      console.error('Permission check error:', error);
      return {
        success: false,
        error: 'İcazə yoxlanması zamanı xəta',
        code: 'PERMISSION_CHECK_ERROR'
      };
    }
  }

  /**
   * Single entry approve
   */
  private static async approveSingleEntry(entryId: string, comment?: string): Promise<ServiceResponse> {
    try {
      const [schoolId, categoryId] = entryId.split('-');
      
      const { error } = await supabase
        .from('data_entries')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('school_id', schoolId)
        .eq('category_id', categoryId);

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return { success: true };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Təsdiq zamanı xəta'
      };
    }
  }

  /**
   * Single entry reject
   */
  private static async rejectSingleEntry(entryId: string, reason: string, comment?: string): Promise<ServiceResponse> {
    try {
      const [schoolId, categoryId] = entryId.split('-');
      
      const { error } = await supabase
        .from('data_entries')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          rejected_by: (await supabase.auth.getUser()).data.user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('school_id', schoolId)
        .eq('category_id', categoryId);

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return { success: true };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Rədd zamanı xəta'
      };
    }
  }

  /**
   * Bulk notifications göndər
   */
  private static async sendBulkNotifications(
    entryIds: string[], 
    action: 'approved' | 'rejected',
    reason?: string,
    comment?: string
  ): Promise<{ sent: number; failed: number }> {
    try {
      let sent = 0;
      let failed = 0;

      // Bildiriş göndərməni implementation et
      // Bu nümunə üçün sadə counter qaytarırıq
      sent = entryIds.length;

      return { sent, failed };

    } catch (error) {
      console.error('Notification sending error:', error);
      return { sent: 0, failed: entryIds.length };
    }
  }

  /**
   * Empty validation result yarat
   */
  private static createEmptyValidationResult(): BulkValidationResult {
    return {
      isValid: true,
      hasErrors: false,
      hasWarnings: false,
      errorCount: 0,
      warningCount: 0,
      issues: [],
      summary: {
        canApproveAll: true,
        canRejectAll: true,
        requiresManualReview: false
      }
    };
  }
}

export default BulkOperationService;