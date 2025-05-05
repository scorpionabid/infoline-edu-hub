
export type FormStatus = 'completed' | 'pending' | 'approved' | 'rejected' | 'dueSoon' | 'overdue' | 'draft' | 'incomplete' | 'all';

export interface FormStatusCount {
  completed: number;
  pending: number;
  rejected: number;
  dueSoon: number;
  overdue: number;
  approved: number;
  draft: number;
  incomplete: number;
  total: number;
}

export interface FormItem {
  id: string;
  name?: string;
  title?: string;
  status: FormStatus;
  deadline?: string;
  submittedAt?: string;
  date?: string;
  completionPercentage?: number;
}

export interface DataEntryStatus {
  status: 'pending' | 'approved' | 'rejected' | 'draft' | 'incomplete';
  message?: string;
  updatedAt?: string;
  approvedBy?: string;
  rejectedBy?: string;
  rejectionReason?: string;
}

export interface ColumnValidation {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  errorMessage?: string;
}

export interface ColumnOption {
  label: string;
  value: string;
}

// ReportType enumu əlavə edək
export enum ReportType {
  STATISTICS = 'statistics',
  COMPLETION = 'completion',
  COMPARISON = 'comparison',
  COLUMN = 'column'
}

// PendingApprovalItem interfeysi əlavə edək
export interface PendingApprovalItem {
  id: string;
  categoryName: string;
  schoolName: string;
  submittedAt: string;
  status: string;
}

// DashboardData interfeysi üçün approvalRate əlavə edək
export interface DashboardData {
  approvalRate?: number;
  // ... əvvəlki xassələr
}

// DashboardNotification interfeysi üçün createdAt əlavə edək
export interface DashboardNotification {
  createdAt: string;
  // ... əvvəlki xassələr
}

// Report interfeysi əlavə edək
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
  status?: string;
  is_template?: boolean;
  shared_with?: string[];
  name?: string;
  summary?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  author?: string;
  last_updated?: string;
}

// ReportPreviewDialogProps interfeysi əlavə edək
export interface ReportPreviewDialogProps {
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  reportId: string;
  reportTitle: string;
  reportDescription: string;
}

// PageHeaderProps interfeysi əlavə edək
export interface PageHeaderProps {
  heading?: string;
  subheading?: string;
  title?: string;
  subtitle?: string;
}

// RegionStats interfeysi əlavə edək
export interface RegionStats {
  id: string;
  name: string;
  totalSchools: number;
  completionRate: number;
}

// ReportItemProps interfeysi əlavə edək
export interface ReportItemProps {
  report: Report;
  onPreview: (report: Report) => void;
  onDownload: (report: Report) => Promise<void>;
  onShare: (report: Report) => void;
}
