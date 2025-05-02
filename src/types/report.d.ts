
export type ReportType = 'basic' | 'detailed' | 'summary' | 'comparison' | 'trend';

export interface Report {
  id: string;
  title: string;
  description?: string;
  type: ReportType;
  status?: string;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  content?: any;
  shared_with?: string[];
  filters?: any;
  is_template?: boolean;
}

export interface ReportChartProps {
  report: Report;
}

export interface ReportPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
  reportTitle: string;
  reportDescription: string;
}
