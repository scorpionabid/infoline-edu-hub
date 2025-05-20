
// Define the ReportTypeValues to include 'bar'
export type ReportTypeValues = 
  | 'bar' 
  | 'pie' 
  | 'line' 
  | 'area' 
  | 'table' 
  | 'summary' 
  | 'comparison';

// Create a constant for easy reference in components
export const REPORT_TYPE_VALUES = {
  BAR: 'bar' as ReportTypeValues,
  PIE: 'pie' as ReportTypeValues,
  LINE: 'line' as ReportTypeValues,
  AREA: 'area' as ReportTypeValues,
  TABLE: 'table' as ReportTypeValues,
  SUMMARY: 'summary' as ReportTypeValues,
  COMPARISON: 'comparison' as ReportTypeValues,
};

export type ReportType = 'bar' | 'line' | 'pie' | 'table';
export type ReportStatus = 'draft' | 'published' | 'archived';

export interface Report {
  id: string;
  title: string;
  description?: string;
  type: ReportTypeValues;
  content: any;
  filters?: any;
  shared_with?: string[] | any;
  status?: ReportStatus | string;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  insights?: string[] | any;
  recommendations?: string[] | any;
  is_template?: boolean;
}

export interface ReportChartProps {
  type: ReportTypeValues;
  data: any[];
  config?: any;
  title?: string;
  description?: string;
  report?: Report;
  height?: number;
  width?: number;
}

export interface ReportFilter {
  search?: string;
  type?: string[];
  status?: string[];
  date_from?: string;
  date_to?: string;
  shared_with?: string[];
  created_by?: string;
  is_template?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ReportEmptyStateProps {
  message?: string;
  action?: () => void;
  actionLabel?: string;
}

export interface ReportHeaderProps {
  onCategorySelect?: (id: string) => void;
  onCreateReport?: () => void;
  showFilters?: boolean;
}

export interface ReportPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  report?: Report;
}

export interface CreateReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (report: Report) => void;
}
