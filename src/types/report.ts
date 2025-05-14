
export type ReportType = 'standard' | 'custom' | 'comparative' | 'bar' | 'line' | 'pie' | 'table';
export type ReportScope = 'school' | 'sector' | 'region' | 'all';
export type ReportStatus = 'draft' | 'published' | 'archived';
export type ReportFormat = 'table' | 'chart' | 'summary';
export type ReportVisibility = 'private' | 'public' | 'admin';

/**
 * Constants for report types used in UI components
 */
export const ReportTypeValues = {
  BAR: 'bar',
  LINE: 'line',
  PIE: 'pie',
  TABLE: 'table',
} as const;

export interface ReportFilter {
  field: string;
  operator: string;
  value: string | number | boolean | Date;
}

export interface Report {
  id: string;
  name?: string;
  title?: string;
  description: string;
  type: ReportType;
  scope?: ReportScope;
  status: ReportStatus;
  format?: ReportFormat;
  visibility?: ReportVisibility;
  creator_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  filters?: ReportFilter[] | any;
  insights?: string | string[];
  recommendations?: string | string[];
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  category_id?: string;
  chart_config?: any;
  table_config?: any;
  content?: any;
  shared_with?: string[] | any;
  is_template?: boolean;
}

/**
 * Interface for props used by report chart components
 */
export interface ReportChartProps {
  report: Report;
  height?: number;
  width?: number;
}
