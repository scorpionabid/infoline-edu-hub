
export type ReportType = 'bar' | 'line' | 'pie' | 'table';
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
  created_at?: string;
  created_by?: string;
  updated_at?: string;
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
