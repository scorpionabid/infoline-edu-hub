
export type ReportType = 'bar' | 'pie' | 'line' | 'table';

export const ReportTypeValues = {
  BAR: 'bar',
  PIE: 'pie',
  LINE: 'line',
  TABLE: 'table'
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
