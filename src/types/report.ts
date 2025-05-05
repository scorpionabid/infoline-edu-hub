
import { ReportType } from "./form";

export type ReportStatus = 'draft' | 'published' | 'archived';

export interface Report {
  id: string;
  title: string;
  description?: string;
  type: ReportType;
  content?: any;
  filters?: any;
  created_by?: string;
  created_at: string;
  updated_at?: string;
  status?: ReportStatus;
  is_template?: boolean;
  shared_with?: string[];
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  author?: string;
  last_updated?: string;
}

export interface ReportChartProps {
  report: Report;
}

export enum ReportTypeEnum {
  STATISTICS = 'statistics',
  COMPLETION = 'completion',
  COMPARISON = 'comparison',
  COLUMN = 'column'
}

export interface ReportPreviewDialogProps {
  isOpen: boolean;
  open?: boolean;
  onClose: () => void;
  reportId: string;
  reportTitle: string;
  reportDescription: string;
}
