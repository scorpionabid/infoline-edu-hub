
export interface ColumnDefinition {
  id: string;
  name: string;
  type: string;
  is_required?: boolean;
  placeholder?: string;
  help_text?: string;
  order_index?: number;
  status?: string;
  validation?: any;
  default_value?: string;
  options?: any;
}

export interface EnhancedSchoolData {
  id: string;
  name: string;
  region_id: string;
  sector_id: string;
  region_name: string;
  sector_name: string;
  completion_rate: number;
  status: string;
  principal_name?: string;
  columns: Record<string, {
    value: any;
    status?: string;
  }>;
  completion_stats?: {
    total_required: number;
    filled_count: number;
    approved_count: number;
    completion_rate: number;
  };
}

export interface SchoolPerformanceData {
  id: string;
  name: string;
  region_name: string;
  sector_name: string;
  completion_rate: number;
  [key: string]: any;
}

export interface ReportFilters {
  schools: {
    search: string;
    region_id?: string;
    sector_id?: string;
    status: string;
  };
  columns: {
    category_id?: string;
    selected_column_ids: string[];
  };
}

export interface SchoolColumnReportData {
  schools: EnhancedSchoolData[];
  columns: ColumnDefinition[];
  total_schools: number;
  filters_applied: ReportFilters;
}
