
// Core report type definitions
export type ReportTypeValues = 'bar' | 'pie' | 'line';

export const REPORT_TYPE_VALUES = {
  BAR: 'bar' as ReportTypeValues,
  PIE: 'pie' as ReportTypeValues,
  LINE: 'line' as ReportTypeValues
};

export interface Report {
  id: string;
  title: string;
  description?: string;
  type: ReportTypeValues;
  status?: string;
  content?: any;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  shared_with?: string[];
}

export interface ReportChartProps {
  report: Report;
  data?: any[];
  height?: number;
  width?: number;
  className?: string;
}

export interface ReportFilter {
  search?: string;
  type?: ReportTypeValues | string;
  status?: string;
}
