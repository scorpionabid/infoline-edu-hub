
export type ReportType = 'bar' | 'line' | 'pie' | 'table' | 'summary';
export type ReportStatus = 'draft' | 'published' | 'archived';

export interface Report {
  id: string;
  title: string;
  description?: string;
  type: ReportType;
  content: any;
  filters?: any;
  shared_with?: string[] | any;
  status?: ReportStatus | string;
  created_at: string;
  created_by?: string;
  updated_at: string;
  insights?: string[] | any;
  recommendations?: string[] | any;
  is_template?: boolean;
}

export interface ReportChartProps {
  report: Report;
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

export interface CreateReportFormValues {
  title: string;
  description?: string;
  type: ReportType;
  content?: any;
  filters?: any;
}

export interface CreateReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReportCreated?: (report: Report) => void;
  onClose?: () => void;
  onCreate?: (data: any) => Promise<void>;
}

export interface ReportPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report?: Report;
  onClose?: () => void;
  reportId?: string;
}

export interface ReportEmptyStateProps {
  message?: string;
  onCreateReport?: () => void;
}

// Updated to handle both uppercase and lowercase values in match statements
export const ReportTypeValues = {
  BAR: 'bar',
  PIE: 'pie',
  LINE: 'line',
  TABLE: 'table',
  SUMMARY: 'summary',
  bar: 'BAR',
  pie: 'PIE', 
  line: 'LINE',
  table: 'TABLE',
  summary: 'SUMMARY'
} as const;

export interface ReportHeaderProps {
  title?: string;
  description?: string;
  onCreateReport?: () => void;
  onCategorySelect?: (categoryId: string) => void;
  isLoading?: boolean;
}
