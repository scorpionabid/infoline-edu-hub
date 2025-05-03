
export type ReportType = 'basic' | 'advanced' | 'custom';
export type ReportStatus = 'draft' | 'published' | 'archived';

export interface Report {
  id: string;
  title: string;
  description?: string;
  type: ReportType;
  status?: ReportStatus;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  category?: string;
  sharedWith?: string[];
}

export interface ReportChartProps {
  report: Report;
}

export interface ReportPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
  reportTitle: string;
  reportDescription: string;
}
