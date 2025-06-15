
export interface AdvancedReportData {
  id: string;
  title: string;
  description?: string;
  type: string;
  data: any[];
  filters: Record<string, any>;
  metadata: Record<string, any>;
  generatedAt: string;
  generatedBy: string;
  insights?: string[];
  recommendations?: string[];
}

export interface AdvancedReportConfig {
  id?: string;
  name: string;
  type: string;
  filters: Record<string, any>;
  columns: string[];
  groupBy?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AdvancedReportFilter {
  dateRange?: {
    start: string;
    end: string;
  };
  status?: string[];
  regions?: string[];
  sectors?: string[];
  schools?: string[];
}
