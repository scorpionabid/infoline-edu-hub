
import { ColumnType } from './column';

export interface SchoolColumnData {
  schoolId: string;
  schoolName: string;
  region?: string;
  sector?: string;
  status?: "Gözləmədə" | "Təsdiqləndi" | "Rədd edildi";
  rejectionReason?: string;
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
export type ReportType = 'standard' | 'custom' | 'statistics' | 'completion' | 'comparison' | 'timeline' | 'performance';

// ReportData tipini əlavə edək
export interface ReportData {
  name: string;
  value: number;
  category: string;
  comparisonValue?: number;
  date?: string; // Vaxt seriyalı analizlər üçün
  segmentKey?: string; // Seqmentasiya üçün (məs. region, yaş qrupu və s.)
  metadata?: Record<string, any>; // Əlavə metadata
}

// Vaxt seriyası məlumatları üçün tip
export interface TimelineData {
  date: string;
  value: number;
  category: string;
  label?: string;
}

// Performans göstəriciləri üçün tip
export interface PerformanceData {
  metricName: string;
  value: number;
  benchmark?: number;
  trend?: 'up' | 'down' | 'stable';
  previousValue?: number;
  percentChange?: number;
}

// Sorğu filtrləri üçün genişləndirilmiş tip
export interface ReportFilters {
  regions?: string[];
  sectors?: string[];
  schools?: string[];
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  categories?: string[];
  columns?: string[];
  statuses?: string[];
  threshold?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  searchTerm?: string;
  pageSize?: number;
  page?: number;
  groupBy?: 'region' | 'sector' | 'school' | 'category' | 'status';
  compareWith?: 'previousPeriod' | 'sameTimePreviousYear' | 'benchmark';
}

export interface Report {
  id: string;
  name: string;
  title?: string;
  description?: string;
  createdAt: string;
  created?: string; // Geriyə uyğunluq üçün
  updatedAt?: string;
  createdBy: string;
  type: ReportType;
  categoryId?: string;
  columns?: CategoryColumn[];
  filters?: ReportFilters;
  exportOptions?: ExportOptions;
  data?: ReportData[]; // Əsas data
  timelineData?: TimelineData[]; // Vaxt seriyası məlumatları
  performanceData?: PerformanceData[]; // Performans göstəriciləri
  summary?: string; // Qısa xülasə
  insights?: string[]; // Təhlillər
  recommendations?: string[]; // Tövsiyələr
  visualization?: 'table' | 'bar' | 'line' | 'pie' | 'radar' | 'heatmap' | 'mixed';
  autoRefresh?: boolean;
  schedule?: {
    isScheduled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
  };
  dashboardDisplay?: {
    isVisible: boolean;
    position?: 'top' | 'middle' | 'bottom';
    size?: 'small' | 'medium' | 'large';
  };
}
