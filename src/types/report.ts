
export interface Report {
  id: string;
  title: string;
  description?: string;
  type: ReportTypeValues;
  status: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  content?: any;
  filters?: any;
  shared_with?: string[];
  is_template?: boolean;
  insights?: string[];
  recommendations?: string[];
}

export enum REPORT_TYPE_VALUES {
  BAR = 'bar',
  LINE = 'line',
  PIE = 'pie',
  TABLE = 'table',
  METRICS = 'metrics',
  CUSTOM = 'custom'
}

export enum ReportStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export type ReportTypeValues = 'bar' | 'line' | 'pie' | 'table' | 'metrics' | 'custom';

export interface ReportChartProps {
  type?: ReportTypeValues;
  data?: any[];
  config?: any;
  title?: string;
  description?: string;
  report?: Report;
  height?: number;
  width?: number;
}

export interface ReportFilter {
  status?: string[];
  type?: string[];
  created_by?: string[];
  date_from?: string;
  date_to?: string;
  shared_with?: string[];
  is_template?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: { title: string; description: string; type: string }) => Promise<void>;
}

export interface ReportEmptyStateProps {
  onCreateReport: () => void;
}

export interface ReportHeaderProps {
  onCreateReport?: () => void;
  title?: string;
  description?: string;
}

export interface ReportPreviewDialogProps {
  report: Report | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose?: () => void;
}
