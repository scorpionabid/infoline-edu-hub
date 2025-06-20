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
  entries?: any[];
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

/**
 * Enhanced Approval Service
 * 
 * Bu servis real data ilə approval workflow-u idarə edir:
 * - Real məlumatların əldə edilməsi
 * - Bulk approval/rejection
 * - Permission validation
 * - Advanced filtering
 */
export class EnhancedApprovalService {
  
  /**
   * Get approval items with real data from database
   */
  static async getApprovalItems(filter: ApprovalFilter = {}): Promise<ServiceResponse<ApprovalItem[]>> {
    try {
      console.log('Getting approval items with filter:', filter);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          error: 'İstifadəçi təsdiqlənmədi',
          code: 'USER_NOT_AUTHENTICATED'
        };
      }

      // Get user role
      const { data: userRole, error: roleError } = await supabase.rpc('get_user_role_safe');
      if (roleError) {
        return {
          success: false,
          error: `İstifadəçi rolu alınarkən xəta: ${roleError.message}`,
          code: 'ROLE_FETCH_ERROR'
        };
      }

      // Build the main query
      let query = supabase
        .from('schools')
        .select(`
          id,
          name,
          region_id,
          sector_id,
          completion_rate,
          regions!inner(id, name),
          sectors!inner(id, name)
        `)
        .eq('status', 'active');

      // Apply permission-based filtering
      if (userRole === 'sectoradmin') {
        // Get user's sector ID
        const { data: userSectorId } = await supabase.rpc('get_user_sector_id');
        if (userSectorId) {
          query = query.eq('sector_id', userSectorId);
        }
      } else if (userRole === 'regionadmin') {
        // Get user's region ID
        const { data: userRegionId } = await supabase.rpc('get_user_region_id');
        if (userRegionId) {
          query = query.eq('region_id', userRegionId);
        }
      }
      // superadmin can see all schools

      // Apply additional filters
      if (filter.regionId) {
        query = query.eq('region_id', filter.regionId);
      }

      if (filter.sectorId) {
        query = query.eq('sector_id', filter.sectorId);
      }

      if (filter.searchTerm) {
        query = query.ilike('name', `%${filter.searchTerm}%`);
      }

      const { data: schools, error: schoolsError } = await query;

      if (schoolsError) {
        console.error('Schools query error:', schoolsError);
        return {
          success: false,
          error: `Məktəblər alınarkən xəta: ${schoolsError.message}`,
          code: 'SCHOOLS_FETCH_ERROR'
        };
      }

      if (!schools || schools.length === 0) {
        return {
          success: true,
          data: [],
          message: 'Heç bir məktəb tapılmadı'
        };
      }

      // Get active categories
      let categoriesQuery = supabase
        .from('categories')
        .select('id, name, assignment')
        .eq('status', 'active');

      if (filter.categoryId) {
        categoriesQuery = categoriesQuery.eq('id', filter.categoryId);
      }

      const { data: categories, error: categoriesError } = await categoriesQuery;

      if (categoriesError) {
        console.error('Categories query error:', categoriesError);
        return {
          success: false,
          error: `Kateqoriyalar alınarkən xəta: ${categoriesError.message}`,
          code: 'CATEGORIES_FETCH_ERROR'
        };
      }

      if (!categories || categories.length === 0) {
        return {
          success: true,
          data: [],
          message: 'Heç bir kateqoriya tapılmadı'
        };
      }

      // Create school-category combinations
      const approvalItems: ApprovalItem[] = [];

      for (const school of schools) {
        for (const category of categories) {
          // Skip sector-only categories for school admins
          if (category.assignment === 'sectors' && userRole === 'schooladmin') {
            continue;
          }

          const entryId = `${school.id}-${category.id}`;

          // Get data entries for this school-category combination
          let entriesQuery = supabase
            .from('data_entries')
            .select(`
              status,
              created_at,
              updated_at,
              approved_by,
              approved_at,
              rejected_by,
              rejected_at,
              rejection_reason,
              created_by
            `)
            .eq('school_id', school.id)
            .eq('category_id', category.id);

          if (filter.status) {
            entriesQuery = entriesQuery.eq('status', filter.status);
          }

          const { data: entries } = await entriesQuery;

          // Determine status and metadata
          let status = DataEntryStatus.DRAFT;
          let submittedBy: string | undefined;
          let submittedAt: string | undefined;
          let approvedBy: string | undefined;
          let approvedAt: string | undefined;
          let rejectedBy: string | undefined;
          let rejectedAt: string | undefined;
          let rejectionReason: string | undefined;

          if (entries && entries.length > 0) {
            // Use the first entry's status (all entries for a school-category should have same status)
            const entry = entries[0];
            status = entry.status as DataEntryStatus;
            submittedBy = entry.created_by;
            submittedAt = entry.created_at;
            approvedBy = entry.approved_by;
            approvedAt = entry.approved_at;
            rejectedBy = entry.rejected_by;
            rejectedAt = entry.rejected_at;
            rejectionReason = entry.rejection_reason;
          }

          // Apply status filter if no database entries match
          if (filter.status && filter.status !== status) {
            continue;
          }

          // Check if user can approve this item
          const canApprove = await this.canUserApprove(user.id, userRole, school.id);

          const approvalItem: ApprovalItem = {
            id: entryId,
            schoolId: school.id,
            schoolName: school.name,
            categoryId: category.id,
            categoryName: category.name,
            status,
            submittedBy,
            submittedAt,
            completionRate: school.completion_rate || 0,
            canApprove,
            approvedBy,
            approvedAt,
            rejectedBy,
            rejectedAt,
            rejectionReason,
            entries: entries || []
          };

          approvalItems.push(approvalItem);
        }
      }

      // Apply date range filter if specified
      let filteredItems = approvalItems;
      if (filter.dateRange) {
        filteredItems = approvalItems.filter(item => {
          if (!item.submittedAt) return false;
          const itemDate = new Date(item.submittedAt);
          return itemDate >= filter.dateRange!.start && itemDate <= filter.dateRange!.end;
        });
      }

      // Sort by submission date (newest first)
      filteredItems.sort((a, b) => {
        if (!a.submittedAt && !b.submittedAt) return 0;
        if (!a.submittedAt) return 1;
        if (!b.submittedAt) return -1;
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      });

      console.log(`Found ${filteredItems.length} approval items`);

      return {
        success: true,
        data: filteredItems,
        message: `${filteredItems.length} təsdiq elementi tapıldı`
      };

    } catch (error: any) {
      console.error('Error getting approval items:', error);
      return {
        success: false,
        error: error.message || 'Naməlum xəta',
        code: 'UNKNOWN_ERROR'
      };
    }
  }

  /**
   * Get approval statistics
   */
  static async getApprovalStats(filter: ApprovalFilter = {}): Promise<ServiceResponse<ApprovalStats>> {
    try {
      const itemsResult = await this.getApprovalItems(filter);
      
      if (!itemsResult.success || !itemsResult.data) {
        return {
          success: false,
          error: itemsResult.error,
          code: itemsResult.code
        };
      }

      const items = itemsResult.data;
      
      const stats: ApprovalStats = {
        pending: items.filter(item => item.status === DataEntryStatus.PENDING).length,
        approved: items.filter(item => item.status === DataEntryStatus.APPROVED).length,
        rejected: items.filter(item => item.status === DataEntryStatus.REJECTED).length,
        draft: items.filter(item => item.status === DataEntryStatus.DRAFT).length,
        total: items.length
      };

      return {
        success: true,
        data: stats,
        message: 'Statistikalar uğurla alındı'
      };

    } catch (error: any) {
      console.error('Error getting approval stats:', error);
      return {
        success: false,
        error: error.message || 'Statistikalar alınarkən xəta',
        code: 'STATS_ERROR'
      };
    }
  }

  /**
   * Approve a single entry
   */
  static async approveEntry(entryId: string, comment?: string): Promise<ServiceResponse> {
    try {
      console.log('Approving entry:', entryId, comment);

      const [schoolId, categoryId] = entryId.split('-');
      if (!schoolId || !categoryId) {
        return {
          success: false,
          error: 'Yanlış entry ID formatı',
          code: 'INVALID_ENTRY_ID'
        };
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          error: 'İstifadəçi təsdiqlənmədi',
          code: 'USER_NOT_AUTHENTICATED'
        };
      }

      // Use StatusTransitionService for the approval
      const { StatusTransitionService } = await import('@/services/statusTransitionService');
      
      // Get current status
      const currentStatus = await StatusTransitionService.getCurrentStatus(schoolId, categoryId);
      if (!currentStatus) {
        return {
          success: false,
          error: 'Mövcud status tapılmadı',
          code: 'STATUS_NOT_FOUND'
        };
      }

      // Get user role
      const { data: userRole } = await supabase.rpc('get_user_role_safe');
      
      // Execute transition
      const transitionResult = await StatusTransitionService.executeTransition(
        currentStatus,
        DataEntryStatus.APPROVED,
        {
          schoolId,
          categoryId,
          userId: user.id,
          userRole: userRole || 'unknown',
          comment
        }
      );

      if (!transitionResult.success) {
        return {
          success: false,
          error: transitionResult.error,
          code: 'TRANSITION_FAILED'
        };
      }

      return {
        success: true,
        message: 'Məlumat uğurla təsdiqləndi',
        data: { status: DataEntryStatus.APPROVED }
      };

    } catch (error: any) {
      console.error('Error approving entry:', error);
      return {
        success: false,
        error: error.message || 'Təsdiq zamanı xəta',
        code: 'APPROVAL_ERROR'
      };
    }
  }

  /**
   * Reject a single entry
   */
  static async rejectEntry(entryId: string, reason: string, comment?: string): Promise<ServiceResponse> {
    try {
      console.log('Rejecting entry:', entryId, reason, comment);

      if (!reason || reason.trim().length === 0) {
        return {
          success: false,
          error: 'Rədd səbəbi göstərilməlidir',
          code: 'REJECTION_REASON_REQUIRED'
        };
      }

      const [schoolId, categoryId] = entryId.split('-');
      if (!schoolId || !categoryId) {
        return {
          success: false,
          error: 'Yanlış entry ID formatı',
          code: 'INVALID_ENTRY_ID'
        };
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          error: 'İstifadəçi təsdiqlənmədi',
          code: 'USER_NOT_AUTHENTICATED'
        };
      }

      // Use StatusTransitionService for the rejection
      const { StatusTransitionService } = await import('@/services/statusTransitionService');
      
      // Get current status
      const currentStatus = await StatusTransitionService.getCurrentStatus(schoolId, categoryId);
      if (!currentStatus) {
        return {
          success: false,
          error: 'Mövcud status tapılmadı',
          code: 'STATUS_NOT_FOUND'
        };
      }

      // Get user role
      const { data: userRole } = await supabase.rpc('get_user_role_safe');
      
      // Combine reason and comment
      const fullComment = comment ? `${reason}. ${comment}` : reason;
      
      // Execute transition
      const transitionResult = await StatusTransitionService.executeTransition(
        currentStatus,
        DataEntryStatus.REJECTED,
        {
          schoolId,
          categoryId,
          userId: user.id,
          userRole: userRole || 'unknown',
          comment: fullComment
        }
      );

      if (!transitionResult.success) {
        return {
          success: false,
          error: transitionResult.error,
          code: 'TRANSITION_FAILED'
        };
      }

      return {
        success: true,
        message: 'Məlumat uğurla rədd edildi',
        data: { status: DataEntryStatus.REJECTED }
      };

    } catch (error: any) {
      console.error('Error rejecting entry:', error);
      return {
        success: false,
        error: error.message || 'Rədd zamanı xəta',
        code: 'REJECTION_ERROR'
      };
    }
  }

  /**
   * Bulk approval/rejection action
   */
  static async bulkApprovalAction(
    entryIds: string[], 
    action: 'approve' | 'reject', 
    params: { reason?: string; comment?: string }
  ): Promise<ServiceResponse> {
    try {
      console.log('Bulk action:', action, entryIds.length, 'items', params);

      if (!entryIds || entryIds.length === 0) {
        return {
          success: false,
          error: 'Heç bir element seçilməyib',
          code: 'NO_ITEMS_SELECTED'
        };
      }

      if (action === 'reject' && (!params.reason || params.reason.trim().length === 0)) {
        return {
          success: false,
          error: 'Toplu rədd üçün səbəb göstərilməlidir',
          code: 'BULK_REJECTION_REASON_REQUIRED'
        };
      }

      const results = {
        successful: 0,
        failed: 0,
        errors: [] as string[]
      };

      // Process each entry individually
      for (const entryId of entryIds) {
        try {
          let result: ServiceResponse;

          if (action === 'approve') {
            result = await this.approveEntry(entryId, params.comment);
          } else {
            result = await this.rejectEntry(entryId, params.reason!, params.comment);
          }

          if (result.success) {
            results.successful++;
          } else {
            results.failed++;
            results.errors.push(`${entryId}: ${result.error}`);
          }

        } catch (error: any) {
          results.failed++;
          results.errors.push(`${entryId}: ${error.message}`);
        }
      }

      const actionText = action === 'approve' ? 'təsdiqləndi' : 'rədd edildi';

      return {
        success: results.successful > 0,
        message: `${results.successful} məlumat uğurla ${actionText}. ${results.failed} xəta.`,
        data: results
      };

    } catch (error: any) {
      console.error('Error in bulk action:', error);
      return {
        success: false,
        error: error.message || 'Toplu əməliyyat zamanı xəta',
        code: 'BULK_ACTION_ERROR'
      };
    }
  }

  /**
   * Check if user can approve entries for a specific school
   */
  private static async canUserApprove(userId: string, userRole: string, schoolId: string): Promise<boolean> {
    try {
      if (userRole === 'superadmin') {
        return true;
      }

      // Get school info
      const { data: school } = await supabase
        .from('schools')
        .select('region_id, sector_id')
        .eq('id', schoolId)
        .single();

      if (!school) return false;

      // Get user roles and check permissions
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role, region_id, sector_id')
        .eq('user_id', userId);

      if (!userRoles) return false;

      return userRoles.some(role => {
        if (role.role === 'superadmin') return true;
        if (role.role === 'regionadmin' && role.region_id === school.region_id) return true;
        if (role.role === 'sectoradmin' && role.sector_id === school.sector_id) return true;
        return false;
      });

    } catch (error) {
      console.error('Error checking approval permission:', error);
      return false;
    }
  }

  /**
   * Get entry details for detailed review
   */
  static async getEntryDetails(entryId: string): Promise<ServiceResponse> {
    try {
      const [schoolId, categoryId] = entryId.split('-');
      if (!schoolId || !categoryId) {
        return {
          success: false,
          error: 'Yanlış entry ID formatı',
          code: 'INVALID_ENTRY_ID'
        };
      }

      // Get school and category info
      const { data: school } = await supabase
        .from('schools')
        .select(`
          id, name, region_id, sector_id,
          regions(id, name),
          sectors(id, name)
        `)
        .eq('id', schoolId)
        .single();

      const { data: category } = await supabase
        .from('categories')
        .select('id, name, description')
        .eq('id', categoryId)
        .single();

      if (!school || !category) {
        return {
          success: false,
          error: 'Məktəb və ya kateqoriya tapılmadı',
          code: 'ENTITIES_NOT_FOUND'
        };
      }

      // Get data entries with column info
      const { data: entries } = await supabase
        .from('data_entries')
        .select(`
          id, value, status, created_at, updated_at,
          columns(id, name, type, is_required)
        `)
        .eq('school_id', schoolId)
        .eq('category_id', categoryId);

      // Get status history using StatusHistoryService
      const { StatusHistoryService } = await import('@/services/statusHistoryService');
      const historyResult = await StatusHistoryService.getEntryStatusHistory(entryId);

      const details = {
        entryId,
        school: {
          id: school.id,
          name: school.name,
          regionId: school.region_id,
          regionName: school.regions?.name,
          sectorId: school.sector_id,
          sectorName: school.sectors?.name
        },
        category: {
          id: category.id,
          name: category.name,
          description: category.description
        },
        entries: entries || [],
        statusHistory: historyResult.success ? historyResult.data : []
      };

      return {
        success: true,
        data: details,
        message: 'Məlumat təfərrüatları uğurla alındı'
      };

    } catch (error: any) {
      console.error('Error getting entry details:', error);
      return {
        success: false,
        error: error.message || 'Təfərrüatlar alınarkən xəta',
        code: 'DETAILS_ERROR'
      };
    }
  }
}

export default EnhancedApprovalService;