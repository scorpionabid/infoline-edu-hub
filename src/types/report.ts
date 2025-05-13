
export type ReportType = 'standard' | 'custom' | 'comparative';
export type ReportScope = 'school' | 'sector' | 'region' | 'all';
export type ReportStatus = 'draft' | 'published' | 'archived';
export type ReportFormat = 'table' | 'chart' | 'summary';
export type ReportVisibility = 'private' | 'public' | 'admin';

export interface ReportFilter {
  field: string;
  operator: string;
  value: string | number | boolean | Date;
}

export interface Report {
  id: string;
  name: string;
  description: string;
  type: ReportType;
  scope: ReportScope;
  status: ReportStatus;
  format: ReportFormat;
  visibility: ReportVisibility;
  creator_id: string;
  created_at: string;
  updated_at: string;
  filters?: ReportFilter[];
  insights?: string;
  recommendations?: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  category_id?: string;
  chart_config?: any;
  table_config?: any;
}
