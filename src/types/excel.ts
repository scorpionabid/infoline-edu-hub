
export interface ImportResult {
  success: boolean;
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  errors: string[];
  warnings?: string[];
  data?: any[];
}

export interface ExportOptions {
  format: 'xlsx' | 'csv';
  includeHeaders: boolean;
  filename?: string;
  sheetName?: string;
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
