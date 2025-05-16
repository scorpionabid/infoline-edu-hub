
export enum ReportTypeValues {
  BAR = 'bar',
  PIE = 'pie',
  LINE = 'line',
  TABLE = 'table'
}

export interface Report {
  id: string;
  title: string;
  name?: string; // Added for backward compatibility
  description?: string;
  type: string;
  content?: Record<string, any>;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at?: string;
  created_by?: string;
  insights?: string[] | string;
  recommendations?: string[] | string;
  filters?: Record<string, any>;
  shared_with?: string[] | Record<string, any>[];
  is_template?: boolean;
}

export interface ReportChartProps {
  report: Report;
  height?: number;
  width?: number;
}

export interface ReportPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  report?: Report;
  reportId?: string;
}

export interface CreateReportDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (reportData: { title: string; description: string; type: string }) => Promise<void>;
}

export interface ReportEmptyStateProps {
  onCreateReport: () => void;
}

export interface ReportHeaderProps {
  onCreateReport: (reportData: { title: string; description: string; type: string }) => Promise<Report>;
}
