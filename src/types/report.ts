
// Report type definitions

export enum ReportTypeValues {
  TABLE = 'table',
  CHART = 'chart',
  DASHBOARD = 'dashboard',
  SUMMARY = 'summary'
}

export interface Report {
  id: string;
  title: string;
  description?: string;
  type: string;
  status?: string;
  content?: any;
  filters?: any;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  shared_with?: string[];
  is_template?: boolean;
  recommendations?: string[];
  insights?: string[];
}

export interface ReportFilter {
  search: string;
  type: string;
  dateRange?: {
    from: Date | null;
    to: Date | null;
  };
  status?: string;
}

export interface ReportChartProps {
  data: any[];
  type: string;
  title?: string;
  description?: string;
  config?: any;
}

export interface ReportHeaderProps {
  title: string;
  description?: string;
  onCreateReport?: () => void;
  onFilterChange?: (filters: ReportFilter) => void;
}
