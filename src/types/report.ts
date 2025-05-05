
export type ReportStatus = 'draft' | 'published' | 'archived';

export enum ReportType {
  STATISTICS = 'statistics',
  COMPLETION = 'completion',
  COMPARISON = 'comparison',
  COLUMN = 'column'
}

export interface Report {
  id: string;
  title: string;
  description?: string;
  type: ReportType | string;
  status?: ReportStatus;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  category?: string;
  sharedWith?: string[];
  created_at: string;
  updated_at?: string;
  content?: any;
  filters?: any;
  created_by?: string;
  is_template?: boolean;
  shared_with?: string[];
  author?: string;
  last_updated?: string;
}

export interface ReportChartProps {
  report: Report;
}

export interface SchoolColumnData {
  schoolId: string;
  schoolName: string;
  region?: string;
  sector?: string;
  status?: string;
  rejectionReason?: string;
  columnData: {
    columnId: string;
    value: any;
    status?: string;
  }[];
}

export interface ExportOptions {
  fileName?: string;
  includeStatus?: boolean;
  includeRegion?: boolean;
  includeSector?: boolean;
}

export interface StatusFilterOptions {
  status: 'all' | 'pending' | 'approved' | 'rejected';
}

export interface ReportPreviewDialogProps {
  isOpen: boolean;
  open?: boolean;
  onClose: () => void;
  reportId: string;
  reportTitle: string;
  reportDescription: string;
}
