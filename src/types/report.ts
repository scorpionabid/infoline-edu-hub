
// Əvvəlcə report.ts faylını yaradıb tipi təyin edək

export interface Report {
  id: string;
  title: string;
  type: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  content?: any;
  createdBy?: string;
  shared?: boolean;
  filters?: any;
}

export type ReportType = 
  | 'table' 
  | 'chart'
  | 'summary'
  | 'comparison'
  | 'trend'
  | 'custom';

export interface ReportFilter {
  id: string;
  field: string;
  operator: string;
  value: any;
}

export interface ReportChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
    borderWidth?: number;
  }[];
}

export interface ReportTableData {
  headers: string[];
  rows: any[][];
}

export interface ReportMetadata {
  title: string;
  description?: string;
  author?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  category?: string;
}

export interface ReportSummary {
  title: string;
  metrics: {
    label: string;
    value: number | string;
    change?: number;
    trend?: 'up' | 'down' | 'neutral';
  }[];
}

export interface FormReport {
  id: string;
  formId: string;
  type: ReportType;
  title: string;
  data: ReportChartData | ReportTableData;
  createdAt: string;
  updatedAt: string;
}
