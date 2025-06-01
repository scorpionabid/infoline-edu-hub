// Excel system types for InfoLine application

export interface ExcelTemplateOptions {
  includeInstructions?: boolean;
  includeSampleData?: boolean;
  formatCells?: boolean;
  addValidation?: boolean;
}

export interface ImportResult {
  success: boolean;
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  errors: ImportError[];
  warnings?: ImportError[];
  importId?: string;
  message: string;
  processingTimeMs?: number;
}

export interface ImportError {
  row: number;
  column: string;
  value: any;
  error: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ExportOptions {
  format?: 'xlsx' | 'csv';
  includeMetadata?: boolean;
  filterByStatus?: string[];
  includeHeaders?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  customColumns?: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: ImportError[];
  warnings: ImportError[];
}

export interface BulkImportOptions {
  validateOnly?: boolean;
  skipDuplicates?: boolean;
  updateExisting?: boolean;
  batchSize?: number;
}

export interface ImportProgress {
  phase: 'parsing' | 'validating' | 'processing' | 'completed' | 'failed';
  currentRow: number;
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  percentage: number;
  message: string;
}

export interface ExcelImportHistory {
  id: string;
  school_id: string;
  category_id: string;
  file_name: string;
  file_size: number;
  imported_by: string;
  imported_at: string;
  status: 'processing' | 'completed' | 'failed' | 'partial';
  total_rows: number;
  successful_rows: number;
  failed_rows: number;
  error_log: any;
  processing_time_ms: number;
}

export interface ColumnMapping {
  excelColumn: string;
  dbColumn: string;
  columnType: string;
  isRequired: boolean;
  validationRules?: any;
}

export interface ExcelPreviewData {
  headers: string[];
  rows: any[][];
  totalRows: number;
  hasErrors: boolean;
  mappedColumns: ColumnMapping[];
}

// Excel processing events for real-time updates
export interface ExcelProcessingEvent {
  type: 'progress' | 'error' | 'warning' | 'completed';
  data: any;
  timestamp: string;
}

// Advanced validation rules
export interface ValidationRule {
  type: 'required' | 'dataType' | 'format' | 'range' | 'custom';
  parameters?: any;
  errorMessage?: string;
}

export interface CellValidationResult {
  row: number;
  column: string;
  isValid: boolean;
  value: any;
  errors: string[];
  warnings: string[];
}

// Template generation options
export interface TemplateGenerationOptions extends ExcelTemplateOptions {
  locale?: string;
  theme?: 'light' | 'dark' | 'colorful';
  includeFormulas?: boolean;
  protectSheet?: boolean;
}

// Export formatting options
export interface ExportFormatOptions {
  headerStyle?: {
    backgroundColor?: string;
    fontColor?: string;
    fontSize?: number;
    bold?: boolean;
  };
  dataStyle?: {
    alternateRowColors?: boolean;
    borderStyle?: 'thin' | 'medium' | 'thick';
    fontSize?: number;
  };
  columnWidths?: 'auto' | 'fixed' | number[];
  freezePanes?: {
    row?: number;
    column?: number;
  };
}

// Bulk operation tracking
export interface BulkOperation {
  id: string;
  operation_type: 'import' | 'export' | 'template_generation';
  category_id: string;
  school_id?: string;
  initiated_by: string;
  started_at: string;
  completed_at?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress_percentage: number;
  items_total: number;
  items_processed: number;
  result_summary?: any;
}

// Excel file constraints
export const EXCEL_CONSTRAINTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_ROWS: 10000,
  MAX_COLUMNS: 100,
  SUPPORTED_FORMATS: ['.xlsx', '.xls', '.csv'],
  SUPPORTED_MIME_TYPES: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv'
  ]
} as const;

// Excel error types
export enum ExcelErrorType {
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FORMAT = 'INVALID_FORMAT',
  PARSING_ERROR = 'PARSING_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR'
}

// Excel processing status
export enum ImportStatus {
  PENDING = 'pending',
  PARSING = 'parsing',
  VALIDATING = 'validating',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PARTIAL = 'partial'
}
