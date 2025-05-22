
// Core report type definitions
export type ReportTypeValues = 'bar' | 'pie' | 'line' | 'table' | 'metrics' | 'custom';

export const REPORT_TYPE_VALUES = {
  BAR: 'bar' as ReportTypeValues,
  PIE: 'pie' as ReportTypeValues,
  LINE: 'line' as ReportTypeValues,
  TABLE: 'table' as ReportTypeValues,
  METRICS: 'metrics' as ReportTypeValues,
  CUSTOM: 'custom' as ReportTypeValues
};

// Adding ReportStatus enum 
export enum ReportStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export interface Report {
  id: string;
  title: string;
  description?: string;
  type: ReportTypeValues;
  status?: string;
  content?: any;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  shared_with?: string[];
  insights?: string[];
  recommendations?: string[];
  is_template?: boolean;
  filters?: any;
}

export interface ReportChartProps {
  report: Report;
  data?: any[];
  height?: number;
  width?: number;
  className?: string;
}

export interface ReportFilter {
  search?: string;
  type?: ReportTypeValues | string;
  status?: string;
}
