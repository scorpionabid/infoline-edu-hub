
// Hesabat növləri
export type ReportType = 
  | 'custom'
  | 'statistics'
  | 'completion'
  | 'comparison'
  | 'column'
  | 'category'
  | 'school'
  | 'region'
  | 'sector';

// Hesabat statusları
export type ReportStatus = 'draft' | 'published' | 'archived';

// Əsas hesabat interfeysi
export interface Report {
  id: string;
  title: string;
  description?: string;
  type: ReportType;
  status: ReportStatus;
  content: any;
  filters?: Record<string, any>;
  is_template?: boolean;
  created_at: string;
  updated_at?: string;
  created_by?: string;
  shared_with?: string[];
  last_run_at?: string;
}

// Hesabatların qrafik görüntülənməsi üçün props
export interface ReportChartProps {
  report: Report;
  height?: string | number;
  width?: string | number;
}

// Hesabat cədvəl strukturu
export interface ReportTableProps {
  report: Report;
  data?: any[];
  loading?: boolean;
  error?: Error | null;
}
