
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

export type ReportTypeValues = 'bar' | 'line' | 'pie' | 'table' | 'metrics' | 'custom';

export const ReportStatus = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
} as const;

export type ReportStatusType = typeof ReportStatus[keyof typeof ReportStatus];

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
  open?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  onSubmit?: (data: any) => void;
  onCreate?: (data: any) => void;
}

export interface ReportEmptyStateProps {
  onCreateReport: () => void;
}

export interface ReportHeaderProps {
  report?: Report;
  title?: string;
  description?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onCreateReport?: () => void;
}

export interface ReportPreviewDialogProps {
  open?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  report: Report;
}
