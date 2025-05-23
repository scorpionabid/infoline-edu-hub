
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
  TABLE = 'table'
}

export type ReportTypeValues = 'bar' | 'line' | 'pie' | 'table';

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
