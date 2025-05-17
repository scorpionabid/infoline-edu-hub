
export interface Report {
  id: string;
  title: string;
  description?: string;
  type: ReportTypeValues;
  status?: ReportStatus | string;
  content?: any;
  filters?: any;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  insights?: string[];
  recommendations?: string[];
  shared_with?: any[];
  is_template?: boolean;
}

export type ReportTypeValues = 'BAR' | 'LINE' | 'PIE' | 'TABLE' | 'METRICS' | 'CUSTOM';

export enum ReportStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export interface ReportChartProps {
  report: Report;
  height?: number;
  width?: number;
}

export interface ReportHeaderProps {
  title?: string;
  description?: string;
  onCreateReport?: () => Promise<void>;
  filters?: any;
  onFilterChange?: (filters: any) => void;
}

export interface CreateReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: { title: string; description: string; type: string }) => Promise<void>;
  onClose?: () => void;
}

export interface ReportEmptyStateProps {
  message?: string;
  onCreateReport?: () => void;
}

export interface ReportPreviewDialogProps {
  report: Report;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId?: string;
  onClose?: () => void;
}

// Add constant for use in ReportFilter and ReportItem
export const REPORT_TYPE_VALUES = {
  BAR: 'BAR',
  LINE: 'LINE', 
  PIE: 'PIE',
  TABLE: 'TABLE',
  METRICS: 'METRICS',
  CUSTOM: 'CUSTOM'
} as const;
