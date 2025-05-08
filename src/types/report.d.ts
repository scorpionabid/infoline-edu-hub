
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
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  parameters?: ReportParameters;
  data?: any;
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

export interface ReportChartProps {
  report: Report;
}

export interface CreateReportDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: { title: string; description: string; type: string; }) => Promise<void>;
}

export interface ReportPreviewDialogProps {
  isOpen?: boolean;
  open?: boolean;
  onClose: () => void;
  reportId: string;
  reportTitle?: string;
  reportDescription?: string;
}
