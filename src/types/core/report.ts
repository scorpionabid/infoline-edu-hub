
import { BaseEntity } from './index';

/**
 * Core Report type definitions
 */

// All supported report types
export type ReportTypeValues = 
  | 'bar' 
  | 'pie' 
  | 'line' 
  | 'area' 
  | 'table' 
  | 'summary' 
  | 'comparison'
  | 'metrics'
  | 'custom';

// Enum for consistent report status values
export enum ReportStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

// Constants for type-safe report type references
export const REPORT_TYPE_VALUES = {
  BAR: 'bar' as ReportTypeValues,
  PIE: 'pie' as ReportTypeValues,
  LINE: 'line' as ReportTypeValues,
  AREA: 'area' as ReportTypeValues,
  TABLE: 'table' as ReportTypeValues,
  SUMMARY: 'summary' as ReportTypeValues,
  COMPARISON: 'comparison' as ReportTypeValues,
  METRICS: 'metrics' as ReportTypeValues,
  CUSTOM: 'custom' as ReportTypeValues,
};

// Core report interface
export interface Report extends BaseEntity {
  title: string;
  description?: string;
  type: ReportTypeValues;
  content: any;
  filters?: any;
  shared_with?: string[] | any;
  status?: ReportStatus | string;
  created_by?: string;
  insights?: string[] | any;
  recommendations?: string[] | any;
  is_template?: boolean;
}

// Report chart component props
export interface ReportChartProps {
  type: ReportTypeValues;
  data: any[];
  config?: any;
  title?: string;
  description?: string;
  report?: Report;
  height?: number;
  width?: number;
}

// Filter properties for reports
export interface ReportFilter {
  search?: string;
  type?: string[];
  status?: string[];
  date_from?: string;
  date_to?: string;
  shared_with?: string[];
  created_by?: string;
  is_template?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
