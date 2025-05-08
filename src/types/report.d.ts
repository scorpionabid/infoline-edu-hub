
export interface Report {
  id: string;
  title: string;
  description?: string;
  type: ReportType;
  status?: ReportStatus;
  content?: any;
  parameters?: any;
  filters?: any;
  insights?: string[];
  recommendations?: string[];
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  isTemplate?: boolean;
  sharedWith?: string[];
}

export type ReportType = 'school' | 'sector' | 'region' | 'system' | 'custom';
export type ReportStatus = 'draft' | 'published' | 'archived';

export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  type: ReportType;
  config?: any;
  status?: 'active' | 'inactive';
}

export interface SchoolColumnData {
  schoolId: string;
  schoolName: string;
  regionId?: string;
  regionName?: string;
  sectorId?: string;
  sectorName?: string;
  columns: ColumnData[];
}

export interface ColumnData {
  columnId: string;
  columnName: string;
  categoryId: string;
  categoryName: string;
  value: any;
  status: string;
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  includeCharts?: boolean;
  includeMetadata?: boolean;
  includeRecommendations?: boolean;
}
