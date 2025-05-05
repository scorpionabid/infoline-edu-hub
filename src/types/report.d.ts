
// Bu faylı src/types/report.ts ilə ardıcıllığı təmin etmək üçün yeniləyirik

import { ReportType } from "./report";

export type ReportStatus = 'draft' | 'published' | 'archived';

export interface Report {
  id: string;
  title: string;
  description?: string;
  type: ReportType;
  status?: ReportStatus;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  category?: string;
  sharedWith?: string[];
  created_at?: string;
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

export interface ReportPreviewDialogProps {
  isOpen?: boolean;
  open?: boolean;
  onClose: () => void;
  reportId: string;
  reportTitle: string;
  reportDescription: string;
}
