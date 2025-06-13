
/**
 * Mərkəzi Report modulu - bütün reportlarla bağlı tip tərifləri
 */

export enum ReportType {
  BAR = 'bar',
  PIE = 'pie',
  LINE = 'line',
  TABLE = 'table',
  METRICS = 'metrics',
  CUSTOM = 'custom'
}

export type ReportTypeValues = `${ReportType}`;

export const REPORT_TYPE_VALUES: Record<Uppercase<ReportTypeValues>, ReportTypeValues> = {
  BAR: 'bar',
  PIE: 'pie',
  LINE: 'line',
  TABLE: 'table',
  METRICS: 'metrics',
  CUSTOM: 'custom'
} as const;

export enum ReportStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export interface Report {
  id: string;
  title: string;
  description?: string;
  type: ReportTypeValues;
  status: ReportStatus | string;
  content?: any;
  created_at: string;
  updated_at: string;
  created_by?: string;
  shared_with?: string[];
  insights?: string[];
  recommendations?: string[];
  is_template?: boolean;
  filters?: Record<string, any>;
  feedback?: string[];
  school_id?: string;
  data?: Record<string, any>;
  metadata?: Record<string, any>;
  version?: number;
}

export interface SchoolColumnData {
  id: string;
  name: string;
  code?: string;
  region_id?: string;
  sector_id?: string;
  address?: string;
  phone?: string;
  email?: string;
  principal_name?: string;
  student_count?: number;
  teacher_count?: number;
  established_year?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any; // For dynamic column data
}

export interface CategoryColumn {
  id: string;
  name: string;
  description?: string;
  data_type: string;
  is_required?: boolean;
  default_value?: any;
  validation_rules?: Record<string, any>;
  display_order?: number;
  category_id?: string;
  created_at?: string;
  updated_at?: string;
  options?: Array<{ label: string; value: any }>;
  [key: string]: any; // For dynamic column data
}

export interface StatusFilterOptions {
  label: string;
  value: string;
  count: number;
  color?: string;
}

export interface ReportChartProps {
  report: Report;
  data?: any[];
  height?: number;
  width?: number;
  className?: string;
  type?: ReportTypeValues;
  config?: any;
  title?: string;
  description?: string;
}

export interface ReportFilter {
  // Əsas axtarış
  search?: string;
  
  // Filter parametrləri
  status?: string[] | string;
  type?: ReportTypeValues[] | ReportTypeValues | string[] | string;
  created_by?: string[] | string;
  shared_with?: string[] | string;
  is_template?: boolean;
  
  // Tarix filterləri
  date_from?: string;
  date_to?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  
  // Çeşidləmə
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ReportHeaderProps {
  report?: Report;
  title?: string;
  description?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onCreateReport?: () => void;
  onCategorySelect?: (categoryId: string) => void;
}

export interface ReportPreviewDialogProps {
  open?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  report: Report;
}

export interface ReportEmptyStateProps {
  onCreateReport: () => void;
}

export interface CreateReportDialogProps {
  open?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  onSubmit?: (data: any) => void;
  onCreate?: (data: any) => void;
}
