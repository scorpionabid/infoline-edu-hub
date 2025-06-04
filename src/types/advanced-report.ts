
export interface AdvancedReportFilter {
  dateRange?: {
    start: string;
    end: string;
  };
  regions?: string[];
  sectors?: string[];
  schools?: string[];
  categories?: string[];
  status?: string[];
  priority?: string[];
}

export interface AdvancedReportData {
  id: string;
  title: string;
  description?: string;
  type: 'performance' | 'completion' | 'comparison' | 'trend' | 'custom';
  data: any[];
  filters: AdvancedReportFilter;
  generatedAt: string;
  generatedBy: string;
  insights?: string[];
  recommendations?: string[];
  metadata?: {
    totalRecords: number;
    dataSource: string;
    lastUpdated: string;
  };
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'performance' | 'completion' | 'comparison' | 'trend' | 'custom';
  config: {
    defaultFilters: AdvancedReportFilter;
    chartType: 'bar' | 'line' | 'pie' | 'table' | 'metrics';
    groupBy: string[];
    metrics: string[];
  };
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
}

export interface ReportExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'png' | 'json';
  includeCharts: boolean;
  includeData: boolean;
  includeInsights: boolean;
  customTitle?: string;
  customDescription?: string;
}
