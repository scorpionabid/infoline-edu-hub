
export type ReportType = 
  | 'statistics' 
  | 'completion' 
  | 'comparison' 
  | 'custom' 
  | 'school' 
  | 'category'
  | 'basic'
  | 'bar'
  | 'pie'
  | 'line'
  | 'table';

export interface Report {
  id: string;
  title: string;
  description: string;
  type: ReportType;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  parameters?: ReportParameters;
  data?: any;
  status?: 'draft' | 'published' | 'archived';
  category?: string;
  sharedWith?: string[];
  content?: any;
  filters?: any;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  is_template?: boolean;
  shared_with?: string[];
}

export interface ReportParameters {
  startDate?: string;
  endDate?: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  categoryId?: string;
  includeCharts?: boolean;
}

export interface SchoolColumnData {
  schoolId: string;
  schoolName: string;
  region: string;
  sector: string;
  columns: Record<string, any>;
}

export interface ExportOptions {
  format: 'xlsx' | 'csv' | 'pdf';
  includeHeaders?: boolean;
  fileName?: string;
}
