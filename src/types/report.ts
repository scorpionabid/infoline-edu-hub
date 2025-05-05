
export interface Report {
  id: string;
  title: string;
  description?: string;
  type: ReportType;
  content: any;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  category?: string;
  filters?: Record<string, any>;
  status?: string;
}

export type ReportType = 'bar' | 'pie' | 'line' | 'table' | 'summary';

// ReportType dəyər obyekti kimi istifadə edilə bilməsi üçün
export const ReportTypeValues = {
  BAR: 'bar' as ReportType,
  PIE: 'pie' as ReportType,
  LINE: 'line' as ReportType,
  TABLE: 'table' as ReportType,
  SUMMARY: 'summary' as ReportType
};
