
export interface Report {
  id: string;
  title: string;
  description?: string;
  type: ReportTypeValues;
  status?: string;
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
}
