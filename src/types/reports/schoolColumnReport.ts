
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
  region_name: string;
  sector_name: string;
  completion_rate: number;
  columns: Record<string, {
    value: any;
    status?: string;
  }>;
}

export interface SchoolPerformanceData {
  id: string;
  name: string;
  region_name: string;
  sector_name: string;
  completion_rate: number;
  [key: string]: any;
}
