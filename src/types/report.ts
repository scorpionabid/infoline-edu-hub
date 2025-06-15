
export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  type: string;
  config: any;
  status: string;
  is_public?: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ReportData {
  id: string;
  title: string;
  description?: string;
  type: string;
  content: any;
  filters: any;
  status: string;
  is_template?: boolean;
  is_public?: boolean;
  shared_with?: any[];
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ReportConfig {
  columns?: string[];
  filters?: Record<string, any>;
  groupBy?: string;
  sortBy?: string;
  chartType?: string;
}
