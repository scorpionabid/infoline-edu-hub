
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
  name: string;
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
  // ... əvvəlki xassələr
  approvalRate: number;
}

// DashboardNotification interfeysi üçün createdAt əlavə edək
export interface DashboardNotification {
  // ... əvvəlki xassələr
  createdAt: string;
}

// Report interfeysi əlavə edək
export interface Report {
  // ... əvvəlki xassələr
  name: string;
  summary: string;
}

// ReportPreviewDialogProps interfeysi əlavə edək
export interface ReportPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  reportId: string;
  reportTitle: string;
  reportDescription: string;
}

// PageHeaderProps interfeysi əlavə edək
export interface PageHeaderProps {
  heading: string;
  subheading: string;
}

// RegionStats interfeysi əlavə edək
export interface RegionStats {
  // ... əvvəlki xassələr
}
