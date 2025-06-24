import { supabase } from '@/integrations/supabase/client';
import { 
  ColumnInfo, 
  SchoolDataEntry, 
  ColumnBasedFilter, 
  ColumnBasedStats, 
  CategoryWithColumnCount,
  ColumnBasedServiceResponse,
  BulkApprovalResult 
} from '@/types/columnBasedApproval';
import { DataEntryStatus } from '@/types/dataEntry';

/**
 * Column-Based Approval Service (Refactored)
 * 
 * Bu service mövcud SQL funksiyalarını istifadə edərək sütun-əsaslı approval sistemi təmin edir.
 * Yeni SQL funksiyalar yazmaq əvəzinə mövcud infrastrukturu istifadə edir.
 */
class ColumnBasedApprovalService {
  
  /**
   * Kateqoriyaları sütun sayı ilə birlikdə əldə et
   * Mövcud cədvəllərdən birbaşa JOIN query
   */
  static async getCategories(): Promise<ColumnBasedServiceResponse<CategoryWithColumnCount[]>> {
    try {
      console.log('[ColumnBasedApprovalService] Loading categories with column counts');
      
      // İlk olaraq kateqoriyaları əldə et
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name, description, assignment, status')
        .eq('status', 'active')
        .order('name');

      if (categoriesError) {
        console.error('[ColumnBasedApprovalService] Error loading categories:', categoriesError);
        return {
          success: false,
          error: categoriesError.message
        };
      }

      // Hər kateqoriya üçün sütun sayını hesabla
      const categoriesWithCounts: CategoryWithColumnCount[] = [];
      
      for (const category of categoriesData || []) {
        // Sütun sayını əldə et
        const { count: columnCount, error: countError } = await supabase
          .from('columns')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', category.id)
          .eq('status', 'active');

        if (countError) {
          console.warn(`[ColumnBasedApprovalService] Error counting columns for category ${category.id}:`, countError);
        }

        // Pending entries sayını əldə et (əvvəlcə bu kateqoriyaya aid sütunları tap)
        const { data: categoryColumns, error: columnsError } = await supabase
          .from('columns')
          .select('id')
          .eq('category_id', category.id)
          .eq('status', 'active');

        let pendingCount = 0;
        if (!columnsError && categoryColumns && categoryColumns.length > 0) {
          const columnIds = categoryColumns.map(col => col.id);
          const { count, error: pendingError } = await supabase
            .from('data_entries')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending')
            .in('column_id', columnIds);
          
          if (!pendingError) {
            pendingCount = count || 0;
          }
        }

        // pendingError artıq yoxlanıldı yuxarıda

        categoriesWithCounts.push({
          id: category.id,
          name: category.name,
          description: category.description,
          assignment: category.assignment,
          columnCount: columnCount || 0,
          pendingCount: pendingCount || 0,
          status: category.status
        });
      }
      
      console.log(`[ColumnBasedApprovalService] Loaded ${categoriesWithCounts.length} categories`);
      
      return {
        success: true,
        data: categoriesWithCounts
      };
    } catch (error: any) {
      console.error('[ColumnBasedApprovalService] Unexpected error loading categories:', error);
      return {
        success: false,
        error: error.message || 'Naməlum xəta'
      };
    }
  }
  
  /**
   * Kateqoriyaya aid sütunları əldə et
   * Mövcud columns cədvəlindən birbaşa
   */
  static async getColumnsByCategory(categoryId: string): Promise<ColumnBasedServiceResponse<ColumnInfo[]>> {
    try {
      console.log('[ColumnBasedApprovalService] Loading columns for category:', categoryId);
      
      const { data, error } = await supabase
        .from('columns')
        .select(`
          id,
          name,
          type,
          category_id,
          is_required,
          help_text,
          placeholder,
          validation,
          options,
          order_index,
          categories!inner(id, name)
        `)
        .eq('category_id', categoryId)
        .eq('status', 'active')
        .order('order_index', { ascending: true });
      
      if (error) {
        console.error('[ColumnBasedApprovalService] Error loading columns:', error);
        return {
          success: false,
          error: error.message
        };
      }
      
      const columns: ColumnInfo[] = data.map((col: any) => ({
        id: col.id,
        name: col.name,
        type: col.type,
        categoryId: col.category_id,
        categoryName: col.categories.name,
        isRequired: col.is_required || false,
        helpText: col.help_text,
        placeholder: col.placeholder,
        validation: col.validation,
        options: col.options,
        orderIndex: col.order_index
      }));
      
      console.log(`[ColumnBasedApprovalService] Loaded ${columns.length} columns`);
      
      return {
        success: true,
        data: columns
      };
    } catch (error: any) {
      console.error('[ColumnBasedApprovalService] Unexpected error loading columns:', error);
      return {
        success: false,
        error: error.message || 'Naməlum xəta'
      };
    }
  }
  
  /**
   * Sütuna aid məktəb məlumatlarını əldə et
   * Mövcud cədvəllərdən complex JOIN query
   */
  static async getSchoolDataByColumn(
    columnId: string, 
    filter: ColumnBasedFilter = {}
  ): Promise<ColumnBasedServiceResponse<SchoolDataEntry[]>> {
    try {
      console.log('[ColumnBasedApprovalService] Loading school data for column:', columnId, 'with filter:', filter);
      
      // Əvvəlcə bu sütuna aid olan məktəbləri tap
      let query = supabase
        .from('data_entries')
        .select(`
          school_id,
          value,
          status,
          created_at,
          updated_at,
          created_by,
          approved_by,
          approved_at,
          rejected_by,
          rejected_at,
          rejection_reason,
          schools(
            id,
            name,
            sector_id,
            region_id,
            sectors(id, name),
            regions(id, name)
          )
        `)
        .eq('column_id', columnId);

      // Status filteri
      if (filter.status && filter.status !== 'all') {
        query = query.eq('status', filter.status);
      }

      // Search filteri - daha sadə versiya
      if (filter.searchTerm) {
        // Mövcud query-ni al, sonra frontend-də filter edəcəyik
        console.log('Search filter will be applied on frontend:', filter.searchTerm);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('[ColumnBasedApprovalService] Error loading school data:', error);
        return {
          success: false,
          error: error.message
        };
      }

      // Əgər boş dəyərləri də göstərmək lazımdırsa, bütün məktəbləri əldə et
      let allSchoolsData = data || [];
      
      if (filter.showEmptyValues) {
        // Bütün məktəbləri əldə et və mövcud data ilə birləşdir
        const { data: allSchools, error: schoolsError } = await supabase
          .from('schools')
          .select(`
            id,
            name,
            sector_id,
            region_id,
            sectors(id, name),
            regions(id, name)
          `)
          .eq('status', 'active');

        if (!schoolsError && allSchools) {
          // Hər məktəb üçün data var ya yox yoxla
          const existingSchoolIds = new Set(allSchoolsData.map(d => d.school_id));
          
          for (const school of allSchools) {
            if (!existingSchoolIds.has(school.id)) {
              allSchoolsData.push({
                school_id: school.id,
                value: null,
                status: null,
                created_at: null,
                updated_at: null,
                created_by: null,
                approved_by: null,
                approved_at: null,
                rejected_by: null,
                rejected_at: null,
                rejection_reason: null,
                schools: school
              });
            }
          }
        }
      }
      
      const schoolData: SchoolDataEntry[] = allSchoolsData.map((row: any) => {
        // Eğər data_entries-dən gəlibsa
        if (row.school_id) {
          return {
            schoolId: row.school_id,
            schoolName: row.schools?.name || 'Naməlum məktəb',
            sectorId: row.schools?.sector_id || '',
            sectorName: row.schools?.sectors?.name || 'Naməlum sektor',
            regionId: row.schools?.region_id || '',
            regionName: row.schools?.regions?.name || 'Naməlum region',
            columnId: columnId,
            value: row.value,
            formattedValue: this.formatValue(row.value, 'text'),
            status: row.status || ('pending' as DataEntryStatus),
            submittedAt: row.created_at,
            submittedBy: row.created_by,
            approvedAt: row.approved_at,
            approvedBy: row.approved_by,
            rejectedAt: row.rejected_at,
            rejectedBy: row.rejected_by,
            rejectionReason: row.rejection_reason,
            canApprove: (row.status || 'pending') === 'pending',
            canReject: (row.status || 'pending') === 'pending'
          };
        } else {
          // Eğər schools-dan gəlibsa (boş entry üçün)
          return {
            schoolId: row.id,
            schoolName: row.name || 'Naməlum məktəb',
            sectorId: row.sector_id || '',
            sectorName: row.sectors?.name || 'Naməlum sektor',
            regionId: row.region_id || '',
            regionName: row.regions?.name || 'Naməlum region',
            columnId: columnId,
            value: null,
            formattedValue: 'Boş',
            status: 'pending' as DataEntryStatus,
            submittedAt: null,
            submittedBy: null,
            approvedAt: null,
            approvedBy: null,
            rejectedAt: null,
            rejectedBy: null,
            rejectionReason: null,
            canApprove: false, // Boş entry-ləri təsdiq etə bilmərik
            canReject: false
          };
        }
      });
      
      console.log(`[ColumnBasedApprovalService] Loaded ${schoolData.length} school data entries`);
      
      return {
        success: true,
        data: schoolData
      };
    } catch (error: any) {
      console.error('[ColumnBasedApprovalService] Unexpected error loading school data:', error);
      return {
        success: false,
        error: error.message || 'Naməlum xəta'
      };
    }
  }
  
  /**
   * Sütun üçün statistika əldə et
   * Mövcud data-dan hesabla
   */
  static async getStatsForColumn(
    columnId: string, 
    filter: ColumnBasedFilter = {}
  ): Promise<ColumnBasedServiceResponse<ColumnBasedStats>> {
    try {
      console.log('[ColumnBasedApprovalService] Loading stats for column:', columnId);
      
      // Ümumi məktəb sayı
      const { count: totalSchools, error: totalError } = await supabase
        .from('schools')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (totalError) {
        console.error('[ColumnBasedApprovalService] Error counting total schools:', totalError);
      }

      // Bu sütun üçün statuslar üzrə say
      const { data: statusCounts, error: statusError } = await supabase
        .from('data_entries')
        .select('status')
        .eq('column_id', columnId);

      if (statusError) {
        console.error('[ColumnBasedApprovalService] Error loading status counts:', statusError);
      }

      // Statusları hesabla
      const filledCount = statusCounts?.length || 0;
      const pendingCount = statusCounts?.filter(s => s.status === 'pending').length || 0;
      const approvedCount = statusCounts?.filter(s => s.status === 'approved').length || 0;
      const rejectedCount = statusCounts?.filter(s => s.status === 'rejected').length || 0;
      const emptyCount = (totalSchools || 0) - filledCount;
      const completionRate = totalSchools ? Math.round((filledCount / totalSchools) * 100) : 0;

      const stats: ColumnBasedStats = {
        totalSchools: totalSchools || 0,
        filledCount,
        pendingCount,
        approvedCount,
        rejectedCount,
        emptyCount,
        completionRate
      };
      
      console.log('[ColumnBasedApprovalService] Loaded stats:', stats);
      
      return {
        success: true,
        data: stats
      };
    } catch (error: any) {
      console.error('[ColumnBasedApprovalService] Unexpected error loading stats:', error);
      return {
        success: false,
        error: error.message || 'Naməlum xəta'
      };
    }
  }
  
  /**
   * Məlumatı təsdiqlə
   * Mövcud update_entries_status funksiyasını istifadə et
   */
  static async approveEntry(
    schoolId: string, 
    columnId: string, 
    comment?: string
  ): Promise<ColumnBasedServiceResponse<boolean>> {
    try {
      console.log('[ColumnBasedApprovalService] Approving entry:', { schoolId, columnId, comment });
      
      // Əvvəlcə bu column hansı category-yə aiddir tap
      const { data: columnData, error: columnError } = await supabase
        .from('columns')
        .select('category_id')
        .eq('id', columnId)
        .single();

      if (columnError || !columnData) {
        return {
          success: false,
          error: 'Sütun tapılmadı'
        };
      }

      // Birbasa data_entries cedvelinde update edirik
      const { data, error } = await supabase  
        .from('data_entries')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('school_id', schoolId)
        .eq('column_id', columnId)
        .select();
      
      if (error) {
        console.error('[ColumnBasedApprovalService] Error approving entry:', error);
        return {
          success: false,
          error: error.message
        };
      }

      // Status change log əlavə et (ixtiyari)
      if (data && data.length > 0) {
        console.log(`[ColumnBasedApprovalService] Entry approved: schoolId=${schoolId}, columnId=${columnId}`);
      }
      
      console.log('[ColumnBasedApprovalService] Entry approved successfully');
      
      return {
        success: true,
        data: true
      };
    } catch (error: any) {
      console.error('[ColumnBasedApprovalService] Unexpected error approving entry:', error);
      return {
        success: false,
        error: error.message || 'Naməlum xəta'
      };
    }
  }
  
  /**
   * Məlumatı rədd et
   * Mövcud update_entries_status funksiyasını istifadə et
   */
  static async rejectEntry(
    schoolId: string, 
    columnId: string, 
    reason: string, 
    comment?: string
  ): Promise<ColumnBasedServiceResponse<boolean>> {
    try {
      console.log('[ColumnBasedApprovalService] Rejecting entry:', { schoolId, columnId, reason, comment });
      
      // Əvvəlcə bu column hansı category-yə aiddir tap
      const { data: columnData, error: columnError } = await supabase
        .from('columns')
        .select('category_id')
        .eq('id', columnId)
        .single();

      if (columnError || !columnData) {
        return {
          success: false,
          error: 'Sütun tapılmadı'
        };
      }

      // Birbasa data_entries cedvelinde update edirik
      const { data, error } = await supabase
        .from('data_entries')
        .update({
          status: 'rejected',
          rejected_at: new Date().toISOString(),
          rejected_by: (await supabase.auth.getUser()).data.user?.id,
          rejection_reason: reason
        })
        .eq('school_id', schoolId)
        .eq('column_id', columnId)
        .select();
      
      if (error) {
        console.error('[ColumnBasedApprovalService] Error rejecting entry:', error);
        return {
          success: false,
          error: error.message
        };
      }

      // Status change log əlavə et (ixtiyari)
      if (data && data.length > 0) {
        console.log(`[ColumnBasedApprovalService] Entry rejected: schoolId=${schoolId}, columnId=${columnId}, reason=${reason}`);
      }
      
      console.log('[ColumnBasedApprovalService] Entry rejected successfully');
      
      return {
        success: true,
        data: true
      };
    } catch (error: any) {
      console.error('[ColumnBasedApprovalService] Unexpected error rejecting entry:', error);
      return {
        success: false,
        error: error.message || 'Naməlum xəta'
      };
    }
  }
  
  /**
   * Toplu təsdiq
   * Mövcud funksiyaları loop edərək
   */
  static async bulkApprove(
    schoolIds: string[], 
    columnId: string, 
    comment?: string
  ): Promise<ColumnBasedServiceResponse<BulkApprovalResult>> {
    try {
      console.log('[ColumnBasedApprovalService] Bulk approving entries:', { schoolIds, columnId, comment });
      
      const results = {
        processedCount: schoolIds.length,
        successCount: 0,
        errorCount: 0,
        errors: [] as any[]
      };

      // Hər məktəb üçün ayrı ayrı təsdiqləmə
      for (const schoolId of schoolIds) {
        try {
          const result = await this.approveEntry(schoolId, columnId, comment);
          if (result.success) {
            results.successCount++;
          } else {
            results.errorCount++;
            results.errors.push({
              schoolId,
              schoolName: `Məktəb ${schoolId}`,
              error: result.error || 'Naməlum xəta'
            });
          }
        } catch (error: any) {
          results.errorCount++;
          results.errors.push({
            schoolId,
            schoolName: `Məktəb ${schoolId}`,
            error: error.message || 'Naməlum xəta'
          });
        }
      }
      
      console.log('[ColumnBasedApprovalService] Bulk approval completed:', results);
      
      return {
        success: true,
        data: results
      };
    } catch (error: any) {
      console.error('[ColumnBasedApprovalService] Unexpected error in bulk approval:', error);
      return {
        success: false,
        error: error.message || 'Naməlum xəta'
      };
    }
  }
  
  /**
   * Toplu rədd
   * Mövcud funksiyaları loop edərək
   */
  static async bulkReject(
    schoolIds: string[], 
    columnId: string, 
    reason: string, 
    comment?: string
  ): Promise<ColumnBasedServiceResponse<BulkApprovalResult>> {
    try {
      console.log('[ColumnBasedApprovalService] Bulk rejecting entries:', { schoolIds, columnId, reason, comment });
      
      const results = {
        processedCount: schoolIds.length,
        successCount: 0,
        errorCount: 0,
        errors: [] as any[]
      };

      // Hər məktəb üçün ayrı ayrı rədd etmə
      for (const schoolId of schoolIds) {
        try {
          const result = await this.rejectEntry(schoolId, columnId, reason, comment);
          if (result.success) {
            results.successCount++;
          } else {
            results.errorCount++;
            results.errors.push({
              schoolId,
              schoolName: `Məktəb ${schoolId}`,
              error: result.error || 'Naməlum xəta'
            });
          }
        } catch (error: any) {
          results.errorCount++;
          results.errors.push({
            schoolId,
            schoolName: `Məktəb ${schoolId}`,
            error: error.message || 'Naməlum xəta'
          });
        }
      }
      
      console.log('[ColumnBasedApprovalService] Bulk rejection completed:', results);
      
      return {
        success: true,
        data: results
      };
    } catch (error: any) {
      console.error('[ColumnBasedApprovalService] Unexpected error in bulk rejection:', error);
      return {
        success: false,
        error: error.message || 'Naməlum xəta'
      };
    }
  }
  
  /**
   * Dəyəri format et
   */
  private static formatValue(value: string | null, type: string): string {
    if (value === null || value === undefined || value === '') {
      return 'Boş';
    }
    
    switch (type) {
      case 'number':
        const num = parseFloat(value);
        return isNaN(num) ? value : num.toLocaleString('az-AZ');
      case 'date':
        const date = new Date(value);
        return isNaN(date.getTime()) ? value : date.toLocaleDateString('az-AZ');
      case 'email':
        return value.toLowerCase();
      case 'url':
        return value.startsWith('http') ? value : `https://${value}`;
      default:
        return value;
    }
  }
}

export default ColumnBasedApprovalService;
