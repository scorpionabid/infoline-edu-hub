import { DataEntryStatus } from './dataEntry';

/**
 * Column-Based Approval Types
 * 
 * Bu types sütun-əsaslı approval sistemi üçün istifadə olunur.
 * Sektoradmin sütun seçir, məktəblərin həmin sütundakı məlumatlarını görür və təsdiqi/rəddi həyata keçirir.
 */

export interface ColumnInfo {
  id: string;
  name: string;
  type: string;
  categoryId: string;
  categoryName: string;
  isRequired: boolean;
  helpText?: string;
  placeholder?: string;
  validation?: any;
  options?: any[];
  orderIndex?: number;
}

export interface SchoolDataEntry {
  schoolId: string;
  schoolName: string;
  sectorId: string;
  sectorName: string;
  regionId: string;
  regionName: string;
  columnId: string;
  value: string | null;
  formattedValue: string;
  status: DataEntryStatus;
  submittedAt?: string;
  submittedBy?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  canApprove: boolean;
  canReject: boolean;
}

export interface ColumnBasedFilter {
  categoryId?: string;
  sectorId?: string;
  regionId?: string;
  status?: DataEntryStatus | 'all';
  searchTerm?: string;
  showEmptyValues?: boolean;
  showOnlyPending?: boolean;
}

export interface ColumnBasedStats {
  totalSchools: number;
  filledCount: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  emptyCount: number;
  completionRate: number;
}

export interface BulkApprovalOperation {
  schoolIds: string[];
  columnId: string;
  action: 'approve' | 'reject';
  reason?: string;
  comment?: string;
}

export interface BulkApprovalResult {
  processedCount: number;
  successCount: number;
  errorCount: number;
  errors: {
    schoolId: string;
    schoolName: string;
    error: string;
  }[];
}

export interface ColumnBasedApprovalHookProps {
  autoLoadCategories?: boolean;
  autoLoadColumns?: boolean;
  defaultCategoryId?: string;
  defaultColumnId?: string;
  refreshInterval?: number;
}

export interface ColumnBasedApprovalState {
  // Categories and Columns
  categories: Array<{
    id: string;
    name: string;
    columnCount: number;
  }>;
  columns: ColumnInfo[];
  selectedColumnId: string | null;
  selectedColumn: ColumnInfo | null;
  
  // School Data
  schoolData: SchoolDataEntry[];
  filteredData: SchoolDataEntry[];
  
  // Filter and Search
  filter: ColumnBasedFilter;
  
  // Stats
  stats: ColumnBasedStats;
  
  // Loading States
  isLoadingCategories: boolean;
  isLoadingColumns: boolean;
  isLoadingData: boolean;
  isProcessing: boolean;
  
  // Errors
  error: string | null;
  
  // Selection
  selectedSchoolIds: string[];
}

export interface ColumnBasedApprovalActions {
  // Category and Column Management
  loadCategories: () => Promise<void>;
  loadColumns: (categoryId: string) => Promise<void>;
  selectColumn: (columnId: string) => Promise<void>;
  
  // Data Management
  loadSchoolData: (columnId: string) => Promise<void>;
  refreshData: () => Promise<void>;
  
  // Filter Management
  updateFilter: (newFilter: Partial<ColumnBasedFilter>) => void;
  resetFilter: () => void;
  
  // Approval Actions
  approveEntry: (schoolId: string, comment?: string) => Promise<boolean>;
  rejectEntry: (schoolId: string, reason: string, comment?: string) => Promise<boolean>;
  bulkApprove: (schoolIds: string[], comment?: string) => Promise<BulkApprovalResult>;
  bulkReject: (schoolIds: string[], reason: string, comment?: string) => Promise<BulkApprovalResult>;
  
  // Selection Management
  selectSchool: (schoolId: string, selected: boolean) => void;
  selectAll: () => void;
  selectNone: () => void;
  selectPending: () => void;
  
  // Utility
  clearError: () => void;
  resetState: () => void;
}

export type ColumnBasedApprovalReturn = ColumnBasedApprovalState & ColumnBasedApprovalActions;

// Service Response Types
export interface ColumnBasedServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CategoryWithColumnCount {
  id: string;
  name: string;
  description?: string;
  assignment: 'all' | 'sectors';
  columnCount: number;
  pendingCount: number;
  status: string;
}

export interface SchoolDataQueryResult {
  school_id: string;
  school_name: string;
  sector_id: string;
  sector_name: string;
  region_id: string;
  region_name: string;
  column_id: string;
  value: string | null;
  status: DataEntryStatus;
  submitted_at: string | null;
  submitted_by: string | null;
  approved_at: string | null;
  approved_by: string | null;
  rejected_at: string | null;
  rejected_by: string | null;
  rejection_reason: string | null;
}
