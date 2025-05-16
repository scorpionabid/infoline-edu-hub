
export interface Report {
  id: string;
  title: string;
  description?: string;
  type: keyof typeof ReportTypeValues;
  content: any;
  filters?: any;
  created_at: string;
  updated_at: string;
  created_by?: string;
  status: ReportStatus;
  is_template?: boolean;
  shared_with?: string[];
  insights?: string[] | string;
  recommendations?: string[] | string;
}

export type ReportStatus = 'draft' | 'published' | 'archived';

export const ReportTypeValues = {
  BAR: 'bar',
  PIE: 'pie',
  LINE: 'line',
  TABLE: 'table',
  SUMMARY: 'summary'
} as const;

export interface ReportFilter {
  search?: string;
  type?: string[];
  status?: ReportStatus[];
  dateRange?: {
    from?: Date;
    to?: Date;
  };
}

export interface CreateReportFormValues {
  title: string;
  description?: string;
  type: keyof typeof ReportTypeValues;
  content: any;
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

export interface ReportChartProps {
  report: Report;
  height?: number;
  width?: number;
}

export interface ReportHeaderProps {
  title?: string;
  description?: string;
  onCreateReport?: (data?: any) => void;
  onCategorySelect?: (categoryId: string) => void;
  isLoading?: boolean;
}
