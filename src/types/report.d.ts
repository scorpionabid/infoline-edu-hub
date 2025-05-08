
export type ReportType = 'bar' | 'pie' | 'line' | 'table' | 'statistics' | 'completion' | 'comparison' | 'custom' | 'school' | 'category' | 'basic';

export const ReportTypeValues = {
  BAR: 'bar',
  PIE: 'pie',
  LINE: 'line',
  TABLE: 'table',
  STATISTICS: 'statistics',
  COMPLETION: 'completion',
  COMPARISON: 'comparison',
  CUSTOM: 'custom',
  SCHOOL: 'school',
  CATEGORY: 'category',
  BASIC: 'basic'
} as const;

export interface Report {
  id: string;
  title: string;
  description?: string;
  type: ReportType;
  status?: 'draft' | 'published' | 'archived';
  createdAt?: Date | string;
  updatedAt?: Date | string;
  createdBy?: string;
  category?: string;
  sharedWith?: string[];
  created_at?: string; // geriyə uyğunluq üçün
  updated_at?: string; // geriyə uyğunluq üçün
  content?: any;
  filters?: any;
  created_by?: string; // geriyə uyğunluq üçün
  is_template?: boolean;
  shared_with?: string[]; // geriyə uyğunluq üçün
}

export interface ReportChartProps {
  report: Report;
}

export interface ReportPreviewDialogProps {
  isOpen?: boolean;
  open?: boolean;
  onClose: () => void;
  reportId: string;
  reportTitle?: string;
  reportDescription?: string;
}

export interface SchoolColumnData {
  schoolId: string;
  schoolName: string;
  columnData: {
    columnId: string;
    columnName: string;
    value: string;
  }[];
}

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  includeHeaders?: boolean;
  fileName?: string;
}
