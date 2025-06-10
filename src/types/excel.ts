
export interface ImportResult {
  success: boolean;
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  errors: ImportError[];
  warnings?: string[];
  data?: any[];
  message?: string;
}

export interface ImportError {
  row: number;
  column: string;
  value: any;
  error: string;
  severity: 'error' | 'warning' | 'info';
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

export interface ExportOptions {
  format: 'xlsx' | 'csv';
  includeHeaders: boolean;
  filename?: string;
  sheetName?: string;
  includeMetadata?: boolean;
  filterByStatus?: string[];
  dateRange?: { start: string; end: string };
  customColumns?: string[];
}

export interface ExcelValidationError {
  row: number;
  column: string;
  message: string;
  value?: any;
}

export interface ExcelImportOptions {
  validateData?: boolean;
  skipEmptyRows?: boolean;
  headerRow?: number;
  maxRows?: number;
}

export interface ExcelTemplateOptions {
  includeInstructions?: boolean;
  includeSampleData?: boolean;
  formatCells?: boolean;
  addValidation?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ImportError[];
  warnings?: string[];
}

export const EXCEL_CONSTRAINTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_FORMATS: ['.xlsx', '.xls', '.csv'],
  SUPPORTED_MIME_TYPES: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv'
  ]
} as const;
