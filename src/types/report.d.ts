
export type ReportType = 'basic' | 'school' | 'comparison' | 'statistics' | 'completion' | 'custom' | 'category';

export interface Report {
  id: string;
  title: string;
  description?: string;
  type: ReportType;
  status?: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  category?: string;
  filters?: any;
  content?: any;
  insights?: string[];
  recommendations?: string[];
  shared_with?: string[];
  parameters?: {
    includeCharts?: boolean;
    schoolId?: string;
    categoryId?: string;
    [key: string]: any;
  };
}

export interface SchoolColumnData {
  schoolId: string;
  schoolName: string;
  columns: {
    columnId: string;
    columnName: string;
    value: any;
  }[];
}

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  includeEmpty?: boolean;
  onlySelected?: boolean;
  columns?: string[];
}
