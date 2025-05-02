
export interface Report {
  id: string;
  title: string;
  description?: string;
  type: ReportType;
  content: any;
  filters?: any;
  created_by?: string;
  created_at: string;
  updated_at?: string;
  status: ReportStatus;
  is_template?: boolean;
  shared_with?: string[];
}

export type ReportType = 'basic' | 'advanced' | 'custom' | 'chart' | 'table';

export type ReportStatus = 'draft' | 'published' | 'archived';

export interface ReportChartProps {
  report: Report;
}
