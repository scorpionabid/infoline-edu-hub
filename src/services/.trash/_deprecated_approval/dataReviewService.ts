import { supabase } from '@/integrations/supabase/client';
import { DataEntryStatus } from '@/types/core/dataEntry';

export interface SchoolInfo {
  id: string;
  name: string;
  regionId: string;
  regionName: string;
  sectorId: string;
  sectorName: string;
  completionRate: number;
}

export interface CategoryInfo {
  id: string;
  name: string;
  description?: string;
  assignment: string;
  status: string;
}

export interface ColumnDataEntry {
  columnId: string;
  columnName: string;
  columnType: string;
  isRequired: boolean;
  value: any;
  formattedValue: string;
  validationStatus: 'valid' | 'invalid' | 'warning' | 'empty';
  validationMessage?: string;
  placeholder?: string;
  helpText?: string;
  options?: any[];
  orderIndex: number;
}

export interface ValidationResult {
  columnId: string;
  columnName: string;
  status: 'valid' | 'invalid' | 'warning' | 'empty';
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface SubmissionInfo {
  submittedBy?: string;
  submittedByName?: string;
  submittedAt?: string;
  lastModifiedBy?: string;
  lastModifiedByName?: string;
  lastModifiedAt?: string;
  version: number;
}

export interface StatusHistoryEntry {
  id: string;
  status: DataEntryStatus;
  changedBy: string;
  changedByName: string;
  changedAt: string;
  comment?: string;
  reason?: string;
}

export interface EntryDetailData {
  entryId: string;
  school: SchoolInfo;
  category: CategoryInfo;
  columns: ColumnDataEntry[];
  validationResults: ValidationResult[];
  statusHistory: StatusHistoryEntry[];
  submissionMetadata: SubmissionInfo;
  currentStatus: DataEntryStatus;
  canApprove: boolean;
  completionStats: {
    totalColumns: number;
    filledColumns: number;
    requiredColumns: number;
    filledRequiredColumns: number;
    completionPercentage: number;
    requiredCompletionPercentage: number;
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
 * Data Review Service
 * 
 * Bu servis approval prosesində detallı məlumat review-u üçün lazım olan
 * bütün məlumatları strukturlu şəkildə təmin edir
 */
export class DataReviewService {
  
  /**
   * Entry üçün detallı məlumatları əldə et - FIXED UUID handling
   */
  static async getEntryDetailedData(entryId: string): Promise<ServiceResponse<EntryDetailData>> {
    try {
      console.log('Getting detailed data for entry (FIXED):', entryId);

      // FIXED: UUID validation və parsing
      const parts = entryId.split('-');
      let schoolId: string, categoryId: string;
      
      if (parts.length >= 8) {
        // Format: uuid-uuid format, split correctly
        // Example: "2c8337a3-1855-44d5-a616-453cdd3935d9-dce49724-49e6-4526-8be8-4f641dfce162"
        const midPoint = Math.floor(parts.length / 2);
        schoolId = parts.slice(0, midPoint).join('-');
        categoryId = parts.slice(midPoint).join('-');
      } else if (parts.length === 2) {
        // Simple format: "schoolId-categoryId"
        [schoolId, categoryId] = parts;
      } else {
        return {
          success: false,
          error: 'Yanlış entry ID formatı. Gözlənilən format: uuid-uuid',
          code: 'INVALID_ENTRY_ID'
        };
      }

      console.log('Parsed UUIDs:', { schoolId, categoryId, originalEntryId: entryId });

      // UUID format validation
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      
      if (!uuidRegex.test(schoolId) || !uuidRegex.test(categoryId)) {
        console.warn('Invalid UUID format detected:', { schoolId, categoryId });
        return {
          success: false,
          error: 'UUID formatı düzgün deyil',
          code: 'INVALID_UUID_FORMAT'
        };
      }

      // Parallel data fetching for better performance
      const [
        schoolResult,
        categoryResult,
        columnsResult,
        dataEntriesResult,
        statusHistoryResult
      ] = await Promise.allSettled([
        this.getSchoolInfo(schoolId),
        this.getCategoryInfo(categoryId),
        this.getCategoryColumns(categoryId),
        this.getDataEntries(schoolId, categoryId),
        this.getStatusHistory(entryId)
      ]);

      // Check for critical failures
      if (schoolResult.status === 'rejected') {
        return {
          success: false,
          error: 'Məktəb məlumatları alınarkən xəta',
          code: 'SCHOOL_FETCH_ERROR'
        };
      }

      if (categoryResult.status === 'rejected') {
        return {
          success: false,
          error: 'Kateqoriya məlumatları alınarkən xəta',
          code: 'CATEGORY_FETCH_ERROR'
        };
      }

      if (columnsResult.status === 'rejected') {
        return {
          success: false,
          error: 'Sütun məlumatları alınarkən xəta',
          code: 'COLUMNS_FETCH_ERROR'
        };
      }

      const school = schoolResult.value;
      const category = categoryResult.value;
      const columns = columnsResult.value;
      const dataEntries = dataEntriesResult.status === 'fulfilled' ? dataEntriesResult.value : [];
      const statusHistory = statusHistoryResult.status === 'fulfilled' ? statusHistoryResult.value : [];

      // Sütunları data entries ilə birləşdir
      const columnsWithData = await this.combineColumnsWithData(columns, dataEntries);

      // Validation nəticələrini hesabla
      const validationResults = this.validateColumnData(columnsWithData);

      // Submission metadata əldə et
      const submissionMetadata = await this.getSubmissionMetadata(schoolId, categoryId);

      // Current status təyin et
      const currentStatus = this.determineCurrentStatus(dataEntries);

      // Permission check
      const canApprove = await this.checkApprovalPermission(schoolId);

      // Completion stats hesabla
      const completionStats = this.calculateCompletionStats(columnsWithData);

      const detailData: EntryDetailData = {
        entryId,
        school,
        category,
        columns: columnsWithData,
        validationResults,
        statusHistory,
        submissionMetadata,
        currentStatus,
        canApprove,
        completionStats
      };

      return {
        success: true,
        data: detailData,
        message: 'Detallı məlumatlar uğurla alındı'
      };

    } catch (error: any) {
      console.error('Error getting detailed entry data:', error);
      return {
        success: false,
        error: error.message || 'Detallı məlumatlar alınarkən xəta',
        code: 'DETAILED_DATA_ERROR'
      };
    }
  }

  /**
   * Məktəb məlumatlarını əldə et
   */
  private static async getSchoolInfo(schoolId: string): Promise<SchoolInfo> {
    const { data: school, error } = await supabase
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
      .eq('id', schoolId)
      .single();

    if (error) {
      throw new Error(`Məktəb məlumatları alınarkən xəta: ${error.message}`);
    }

    if (!school) {
      throw new Error('Məktəb tapılmadı');
    }

    return {
      id: school.id,
      name: school.name,
      regionId: school.region_id,
      regionName: school.regions.name,
      sectorId: school.sector_id,
      sectorName: school.sectors.name,
      completionRate: school.completion_rate || 0
    };
  }

  /**
   * Kateqoriya məlumatlarını əldə et
   */
  private static async getCategoryInfo(categoryId: string): Promise<CategoryInfo> {
    const { data: category, error } = await supabase
      .from('categories')
      .select('id, name, description, assignment, status')
      .eq('id', categoryId)
      .single();

    if (error) {
      throw new Error(`Kateqoriya məlumatları alınarkən xəta: ${error.message}`);
    }

    if (!category) {
      throw new Error('Kateqoriya tapılmadı');
    }

    return category;
  }

  /**
   * Kateqoriyaya aid sütunları əldə et
   */
  private static async getCategoryColumns(categoryId: string): Promise<any[]> {
    const { data: columns, error } = await supabase
      .from('columns')
      .select(`
        id,
        name,
        type,
        is_required,
        placeholder,
        help_text,
        options,
        order_index,
        validation,
        default_value,
        status
      `)
      .eq('category_id', categoryId)
      .eq('status', 'active')
      .order('order_index', { ascending: true });

    if (error) {
      throw new Error(`Sütun məlumatları alınarkən xəta: ${error.message}`);
    }

    return columns || [];
  }

  /**
   * Data entries əldə et - FIXED: Removed problematic RPC calls
   */
  private static async getDataEntries(schoolId: string, categoryId: string): Promise<any[]> {
    try {
      console.log('Getting data entries for school:', schoolId, 'category:', categoryId);
      
      // FIXED: Birbaşa cədvəldən oxu, RPC istifadə etmə
      const { data: entries, error } = await supabase
        .from('data_entries')
        .select(`
          id,
          column_id,
          value,
          status,
          created_at,
          updated_at,
          created_by,
          approved_by,
          approved_at,
          rejected_by,
          rejection_reason
        `)
        .eq('school_id', schoolId)
        .eq('category_id', categoryId)
        .is('deleted_at', null);

      if (error) {
        console.warn('Data entries fetch error:', error?.message || error);
        return [];
      }

      console.log('Data entries fetched successfully:', entries?.length || 0, 'entries');
      return entries || [];
      
    } catch (error: any) {
      console.warn('Error fetching data entries:', error?.message || error);
      return [];
    }
  }

  /**
   * Status history əldə et - FIXED: Removed problematic RPC calls
   */
  private static async getStatusHistory(entryId: string): Promise<StatusHistoryEntry[]> {
    try {
      console.log('Getting status history for entry:', entryId);
      
      // FIXED: Birbaşa StatusHistoryService istifadə et, RPC-dən qaçın
      const { StatusHistoryService } = await import('@/services/statusHistoryService');
      const result = await StatusHistoryService.getEntryStatusHistory(entryId);
      
      if (result.success && result.data) {
        return result.data.map((item: any) => ({
          id: item.id || `temp_${Date.now()}`,
          status: item.new_status || item.status || 'pending',
          changedBy: item.changed_by || item.user_id || 'system',
          changedByName: item.changed_by_name || item.user_name || 'System',
          changedAt: item.changed_at || item.created_at || new Date().toISOString(),
          comment: item.comment || item.reason,
          reason: item.comment || item.reason
        }));
      }
      
      // Heç bir məlumat tapılmadığı halda boş array qaytar
      console.warn('No status history found for entry:', entryId);
      return [];
      
    } catch (error: any) {
      console.warn('Status history fetch error:', error?.message || error);
      // Fallback: mock data əgər məlumat yoxdursa
      return [{
        id: `fallback_${Date.now()}`,
        status: 'pending' as DataEntryStatus,
        changedBy: 'system',
        changedByName: 'System',
        changedAt: new Date().toISOString(),
        comment: 'No history available',
        reason: 'System generated'
      }];
    }
  }

  /**
   * Sütunları data entries ilə birləşdir
   */
  private static async combineColumnsWithData(
    columns: any[], 
    dataEntries: any[]
  ): Promise<ColumnDataEntry[]> {
    
    const columnDataMap = new Map();
    dataEntries.forEach(entry => {
      columnDataMap.set(entry.column_id, entry);
    });

    return columns.map(column => {
      const dataEntry = columnDataMap.get(column.id);
      const value = dataEntry?.value;
      
      // Format value based on column type
      const formattedValue = this.formatColumnValue(value, column.type, column.options);
      
      // Determine validation status
      const validationStatus = this.getColumnValidationStatus(column, value);
      
      return {
        columnId: column.id,
        columnName: column.name,
        columnType: column.type,
        isRequired: column.is_required || false,
        value: value,
        formattedValue,
        validationStatus,
        validationMessage: this.getValidationMessage(column, value, validationStatus),
        placeholder: column.placeholder,
        helpText: column.help_text,
        options: column.options,
        orderIndex: column.order_index || 0
      };
    });
  }

  /**
   * Sütun dəyərini format et
   */
  private static formatColumnValue(value: any, columnType: string, options?: any[]): string {
    if (value === null || value === undefined || value === '') {
      return '—';
    }

    switch (columnType) {
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : String(value);
      
      case 'date':
        try {
          return new Date(value).toLocaleDateString('az-AZ');
        } catch {
          return String(value);
        }
      
      case 'select':
      case 'radio':
        if (options && Array.isArray(options)) {
          const option = options.find(opt => opt.value === value);
          return option ? option.label : String(value);
        }
        return String(value);
      
      case 'checkbox':
        if (Array.isArray(value)) {
          return value.join(', ');
        }
        return String(value);
      
      case 'boolean':
        return value ? 'Bəli' : 'Xeyr';
      
      default:
        return String(value);
    }
  }

  /**
   * Sütun validation statusunu təyin et
   */
  private static getColumnValidationStatus(
    column: any, 
    value: any
  ): 'valid' | 'invalid' | 'warning' | 'empty' {
    
    const isEmpty = value === null || value === undefined || value === '';
    
    if (isEmpty) {
      return column.is_required ? 'invalid' : 'empty';
    }

    // Basic validation based on column type
    switch (column.type) {
      case 'number':
        if (isNaN(Number(value))) {
          return 'invalid';
        }
        break;
      
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'invalid';
        }
        break;
      
      case 'url':
        try {
          new URL(value);
        } catch {
          return 'invalid';
        }
        break;
    }

    // Advanced validation from column.validation JSON
    if (column.validation) {
      try {
        const validation = typeof column.validation === 'string' 
          ? JSON.parse(column.validation) 
          : column.validation;
        
        if (validation.min && Number(value) < validation.min) {
          return 'invalid';
        }
        
        if (validation.max && Number(value) > validation.max) {
          return 'invalid';
        }
        
        if (validation.pattern) {
          const regex = new RegExp(validation.pattern);
          if (!regex.test(value)) {
            return 'invalid';
          }
        }
      } catch (error) {
        console.warn('Validation parse error:', error);
      }
    }

    return 'valid';
  }

  /**
   * Validation mesajını əldə et
   */
  private static getValidationMessage(
    column: any, 
    value: any, 
    status: string
  ): string | undefined {
    
    switch (status) {
      case 'empty':
        return column.is_required ? 'Bu sahə məcburidir' : undefined;
      
      case 'invalid':
        if (value === null || value === undefined || value === '') {
          return 'Bu sahə məcburidir';
        }
        
        switch (column.type) {
          case 'number':
            return 'Düzgün rəqəm daxil edin';
          case 'email':
            return 'Düzgün email ünvanı daxil edin';
          case 'url':
            return 'Düzgün URL daxil edin';
          default:
            return 'Dəyər düzgün deyil';
        }
      
      case 'warning':
        return 'Diqqət tələb edən dəyər';
      
      default:
        return undefined;
    }
  }

  /**
   * Column data validation
   */
  private static validateColumnData(columns: ColumnDataEntry[]): ValidationResult[] {
    const results: ValidationResult[] = [];

    columns.forEach(column => {
      if (column.validationStatus !== 'valid' && column.validationMessage) {
        results.push({
          columnId: column.columnId,
          columnName: column.columnName,
          status: column.validationStatus,
          message: column.validationMessage,
          severity: column.validationStatus === 'invalid' ? 'error' : 
                   column.validationStatus === 'warning' ? 'warning' : 'info'
        });
      }
    });

    return results;
  }

  /**
   * Submission metadata əldə et - FIXED FK reference
   */
  private static async getSubmissionMetadata(
    schoolId: string, 
    categoryId: string
  ): Promise<SubmissionInfo> {
    
    try {
      // En son data entry-ni tap - FIXED: FK reference düzəldildi
      const { data: latestEntry, error } = await supabase
        .from('data_entries')
        .select(`
          created_by,
          created_at,
          updated_at
        `)
        .eq('school_id', schoolId)
        .eq('category_id', categoryId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !latestEntry) {
        console.warn('No data entries found for submission metadata:', error?.message);
        return { version: 1 };
      }

      // Ayrıca profile məlumatını əldə et
      let submittedByName: string | undefined;
      if (latestEntry.created_by) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', latestEntry.created_by)
          .single();
        
        submittedByName = profile?.full_name;
      }

      // Entry sayını version kimi istifadə et
      const { count } = await supabase
        .from('data_entries')
        .select('id', { count: 'exact' })
        .eq('school_id', schoolId)
        .eq('category_id', categoryId);

      return {
        submittedBy: latestEntry.created_by,
        submittedByName,
        submittedAt: latestEntry.created_at,
        lastModifiedBy: latestEntry.created_by,
        lastModifiedByName: submittedByName,
        lastModifiedAt: latestEntry.updated_at,
        version: count || 1
      };
      
    } catch (error) {
      console.error('Error getting submission metadata:', error);
      return { version: 1 };
    }
  }

  /**
   * Current status təyin et
   */
  private static determineCurrentStatus(dataEntries: any[]): DataEntryStatus {
    if (!dataEntries || dataEntries.length === 0) {
      return DataEntryStatus.DRAFT;
    }

    // En son status-u al
    const latestEntry = dataEntries.reduce((latest, current) => {
      return new Date(current.updated_at) > new Date(latest.updated_at) ? current : latest;
    });

    return latestEntry.status || DataEntryStatus.DRAFT;
  }

  /**
   * Approval permission yoxla
   */
  private static async checkApprovalPermission(schoolId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role, region_id, sector_id')
        .eq('user_id', user.id);

      if (!userRoles) return false;

      // SuperAdmin həmişə approval edə bilər
      if (userRoles.some(role => role.role === 'superadmin')) {
        return true;
      }

      // Məktəbin region və sector məlumatlarını al
      const { data: school } = await supabase
        .from('schools')
        .select('region_id, sector_id')
        .eq('id', schoolId)
        .single();

      if (!school) return false;

      // RegionAdmin və SectorAdmin yoxla
      return userRoles.some(role => {
        if (role.role === 'regionadmin' && role.region_id === school.region_id) {
          return true;
        }
        if (role.role === 'sectoradmin' && role.sector_id === school.sector_id) {
          return true;
        }
        return false;
      });

    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  }

  /**
   * Completion stats hesabla
   */
  private static calculateCompletionStats(columns: ColumnDataEntry[]): {
    totalColumns: number;
    filledColumns: number;
    requiredColumns: number;
    filledRequiredColumns: number;
    completionPercentage: number;
    requiredCompletionPercentage: number;
  } {
    
    const totalColumns = columns.length;
    const filledColumns = columns.filter(col => 
      col.value !== null && col.value !== undefined && col.value !== ''
    ).length;
    
    const requiredColumns = columns.filter(col => col.isRequired).length;
    const filledRequiredColumns = columns.filter(col => 
      col.isRequired && col.value !== null && col.value !== undefined && col.value !== ''
    ).length;

    const completionPercentage = totalColumns > 0 ? 
      Math.round((filledColumns / totalColumns) * 100) : 0;
    
    const requiredCompletionPercentage = requiredColumns > 0 ? 
      Math.round((filledRequiredColumns / requiredColumns) * 100) : 100;

    return {
      totalColumns,
      filledColumns,
      requiredColumns,
      filledRequiredColumns,
      completionPercentage,
      requiredCompletionPercentage
    };
  }

  /**
   * Entry üçün validation yoxla
   */
  static async validateEntryData(entryId: string): Promise<ServiceResponse<ValidationResult[]>> {
    try {
      const detailResult = await this.getEntryDetailedData(entryId);
      
      if (!detailResult.success || !detailResult.data) {
        return {
          success: false,
          error: detailResult.error,
          code: detailResult.code
        };
      }

      return {
        success: true,
        data: detailResult.data.validationResults,
        message: 'Validation nəticələri alındı'
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Validation xətası',
        code: 'VALIDATION_ERROR'
      };
    }
  }

  /**
   * Məktəb-kateqoriya üçün sütun məlumatlarını əldə et
   */
  static async getColumnDataForEntry(
    schoolId: string, 
    categoryId: string
  ): Promise<ServiceResponse<ColumnDataEntry[]>> {
    try {
      const entryId = `${schoolId}-${categoryId}`;
      const detailResult = await this.getEntryDetailedData(entryId);
      
      if (!detailResult.success || !detailResult.data) {
        return {
          success: false,
          error: detailResult.error,
          code: detailResult.code
        };
      }

      return {
        success: true,
        data: detailResult.data.columns,
        message: 'Sütun məlumatları alındı'
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Sütun məlumatları alınarkən xəta',
        code: 'COLUMN_DATA_ERROR'
      };
    }
  }
}

export default DataReviewService;