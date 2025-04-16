
export enum DataEntrySaveStatus {
  IDLE = 'idle',
  SAVING = 'saving',
  SAVED = 'saved',
  ERROR = 'error',
  SUBMITTED = 'submitted'
}

export interface EntryValue {
  id?: string;
  column_id: string;
  category_id: string;
  school_id: string;
  value: any;
  status?: 'pending' | 'approved' | 'rejected';
  columnId?: string; // Əlavə edildi (uyğunluq üçün)
}

export interface ColumnValidationError {
  field: string;
  message: string;
  type: string;
  severity?: 'warning' | 'error' | 'info';
}

// Kateqoriya və sütunlar üçün tiplər
export interface CategoryWithColumns {
  id: string;
  name: string;
  description?: string;
  status?: string;
  deadline?: string;
  columns: Column[];
  columnCount?: number;
}

export interface Column {
  id: string;
  name: string;
  type: string;
  category_id: string;
  is_required?: boolean;
  help_text?: string;
  placeholder?: string;
  validation?: any;
  options?: any;
  order_index?: number;
  default_value?: any;
  parent_column_id?: string;
}

export interface DataEntryState {
  status: DataEntrySaveStatus;
  error: string | null;
  isModified: boolean;
  entries: EntryValue[];
  categories: CategoryWithColumns[];
  selectedCategory: CategoryWithColumns | null;
}
