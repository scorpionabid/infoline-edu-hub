
import { Report, ReportStatus, ReportTypeValues, REPORT_TYPE_VALUES, ReportChartProps, ReportFilter } from './core/report';

// Re-export core types
export { ReportStatus, REPORT_TYPE_VALUES, ReportTypeValues };
export type { Report, ReportChartProps, ReportFilter };

// Additional UI-specific types for reports
export type ReportType = 'bar' | 'line' | 'pie' | 'table';

// Empty state component props
export interface ReportEmptyStateProps {
  message?: string;
  action?: () => void;
  actionLabel?: string;
  onCreateReport?: () => void;
}

// Header component props
export interface ReportHeaderProps {
  onCategorySelect?: (id: string) => void;
  onCreateReport?: () => void;
  showFilters?: boolean;
  title?: string;
  description?: string;
}

// Preview dialog props - supports both controlled and uncontrolled
export interface ReportPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  report?: Report;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// Create dialog props - supports both controlled and uncontrolled
export interface CreateReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (report: Report) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCreate?: (report: any) => Promise<void>;
}
