
export type ReportType = 'chart' | 'table' | 'summary' | 'comparison' | 'detailed';

export interface Report {
  id: string;
  title: string;
  description?: string;
  type: ReportType;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  status?: string;
  filters?: any;
  content?: any;
  parameters?: any;
  shared_with?: string[];
}

export interface SchoolColumnData {
  school_id: string;
  school_name: string;
  column_data: {
    column_id: string;
    column_name: string;
    value: any;
    status: string;
    submitted_at?: string;
  }[];
}

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf' | 'json';
  includeHeaders?: boolean;
  fileName?: string;
  sheets?: {
    name: string;
    data: any[];
  }[];
}

export interface ReportFilter {
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  category_id?: string;
  column_id?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface ReportData {
  title: string;
  description?: string;
  data: any[];
  meta?: {
    total?: number;
    filtered?: number;
    page?: number;
  };
}

export interface ChartConfig {
  type: 'pie' | 'bar' | 'line' | 'area';
  data: any[];
  xAxis?: string;
  yAxis?: string;
  colors?: string[];
  stacked?: boolean;
  legend?: boolean;
}
