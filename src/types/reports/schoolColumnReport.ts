// types/reports/schoolColumnReport.ts
export interface ColumnDefinition {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox';
  category_id: string;
  category_name: string;
  is_required: boolean;
  order_index: number;
}

export interface SchoolBasicInfo {
  id: string;
  name: string;
  principal_name?: string;
  region_id: string;
  region_name: string;
  sector_id: string;
  sector_name: string;
  status: 'active' | 'inactive';
}

export interface SchoolColumnEntry {
  id: string;
  school_id: string;
  column_id: string;
  value: string | number | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  approved_by?: string;
  approved_at?: string;
}

export interface EnhancedSchoolData extends SchoolBasicInfo {
  columns: {
    [columnId: string]: SchoolColumnEntry | null;
  };
  completion_stats: {
    total_required: number;
    filled_count: number;
    approved_count: number;
    completion_rate: number;
  };
}

export interface ReportFilters {
  schools: {
    search: string;
    region_id?: string;
    sector_id?: string;
    status?: string;
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
