
export type ReportType = 
  | 'statistics' 
  | 'completion' 
  | 'comparison' 
  | 'custom' 
  | 'school' 
  | 'category'
  | 'basic';

export interface Report {
  id: string;
  title: string;
  description: string;
  type: ReportType;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  parameters?: ReportParameters;
  data?: any;
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
