
export interface AdvancedReportData {
  id: string;
  title: string;
  description: string;
  type: 'custom' | 'performance' | 'completion' | 'comparison' | 'trend';
  data: any[];
  filters: Record<string, any>;
  metadata: {
    totalRecords: number;
    dataSource: string;
    lastUpdated: string;
  };
  generatedAt: string;
  generatedBy: string;
  insights: string[];
  recommendations: string[];
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  config: any;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
}

export interface ReportFilters {
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  category_id?: string;
  date_from?: string;
  date_to?: string;
}

export interface ChartConfiguration {
  type: 'bar' | 'line' | 'pie' | 'scatter';
  xAxis: string;
  yAxis: string;
  title: string;
  colors: string[];
}

export interface AdvancedReportFilter {
  status?: string[];
  type?: string[];
  date_from?: string;
  date_to?: string;
  created_by?: string[];
}
