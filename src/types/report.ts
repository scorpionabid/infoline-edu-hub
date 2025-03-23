
import { ColumnType } from './column';

export interface SchoolColumnData {
  schoolId: string;
  schoolName: string;
  region?: string; // Əlavə edildi
  sector?: string; // Əlavə edildi
  columnData: {
    columnId: string;
    value: string | number | boolean | null;
  }[];
}

export interface CategoryColumn {
  id: string;
  categoryId: string;
  name: string;
  type: ColumnType;
  order: number;
  status: "active" | "inactive";
  isRequired: boolean;
}

export interface ExportOptions {
  customFileName?: string;
  includeHeaders?: boolean;
  sheetName?: string;
  excludeColumns?: string[];
  includeTimestamp?: boolean;
  includeSchoolInfo?: boolean;
  format?: string;
  filterColumns?: string[];
}

// Hesabat tipini genişləndirək
export type ReportType = 'standard' | 'custom' | 'statistics' | 'completion' | 'comparison';

// ReportData tipini əlavə edək
export interface ReportData {
  name: string;
  value: number;
  category: string;
  comparisonValue?: number;
}

export interface Report {
  id: string;
  name: string;
  title?: string; // Əlavə edildi
  description?: string;
  createdAt: string;
  created?: string; // Əlavə edildi, geriyə uyğunluq üçün
  updatedAt?: string;
  createdBy: string;
  type: ReportType; // Tipi yeniləyək
  categoryId?: string;
  columns?: CategoryColumn[];
  filters?: any;
  exportOptions?: ExportOptions;
  data?: ReportData[]; // Əlavə edildi
  summary?: string; // Əlavə edildi
  insights?: string[]; // Əlavə edildi
  recommendations?: string[]; // Əlavə edildi
}
