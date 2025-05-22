
import { 
  Report, 
  ReportStatus, 
  ReportTypeValues, 
  REPORT_TYPE_VALUES, 
  ReportChartProps, 
  ReportFilter 
} from './core/report';

// Re-export core types
export { REPORT_TYPE_VALUES, ReportStatus };
export type { Report, ReportTypeValues, ReportChartProps, ReportFilter };

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
  report?: Report;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

// Create dialog props - supports both controlled and uncontrolled
export interface CreateReportDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSave?: (report: Report) => void;
  onCreate?: (report: any) => Promise<void>;
  isOpen?: boolean;
  onClose?: () => void;
}
