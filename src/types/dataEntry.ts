
export interface DataValueType {
  id: string;
  value: string;
  status?: string;
  validationErrors?: ColumnValidationError[];
}

export interface DataEntryFormData {
  [columnId: string]: DataValueType;
}

export interface ColumnValidationError {
  errorType: string;
  message: string;
  details?: any;
}

export interface CategoryWithColumns {
  id: string;
  name: string;
  description?: string;
  columns: ColumnType[];
  status?: string;
  deadline?: string;
  assignment?: string;
}

export interface ColumnType {
  id: string;
  name: string;
  type: string;
  category_id: string;
  is_required: boolean;
  order_index?: number;
  help_text?: string;
  placeholder?: string;
  options?: ColumnOptions;
  validation?: ColumnValidation;
  default_value?: string;
  status?: string;
}

export interface ColumnOptions {
  choices?: { label: string; value: string }[];
  min?: number;
  max?: number;
  step?: number;
  multiple?: boolean;
  allowCustom?: boolean;
}

export interface ColumnValidation {
  pattern?: string;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  required?: boolean;
  customMessage?: string;
}

export interface DataEntrySubmitResponse {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  data?: any;
}

export interface SchoolData {
  id: string;
  name: string;
  region_id: string;
  region_name?: string;
  sector_id: string;
  sector_name?: string;
  admin_id?: string;
  admin_email?: string;
}

export interface EntryValue {
  categoryId: string;
  columnId: string;
  value: any;
  status?: 'pending' | 'approved' | 'rejected';
}

export enum DataEntrySaveStatus {
  IDLE = 'idle',
  SAVING = 'saving',
  SAVED = 'saved',
  ERROR = 'error'
}

export enum FormStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DRAFT = 'draft',
  INCOMPLETE = 'incomplete',
  COMPLETE = 'complete'
}

export interface DataEntryContextType {
  categories: CategoryWithColumns[];
  selectedCategoryId: string | null;
  setSelectedCategoryId: (id: string | null) => void;
  formData: DataEntryFormData;
  updateFormValue: (columnId: string, value: string) => void;
  resetForm: () => void;
  submitForm: () => Promise<DataEntrySubmitResponse>;
  loading: boolean;
  submitting: boolean;
  error: Error | null;
  saveAsDraft: () => Promise<DataEntrySubmitResponse>;
  formStatus: 'draft' | 'submitted' | 'approved' | 'rejected' | null;
  completionPercentage: number;
  getColumnValidationErrors: (columnId: string) => ColumnValidationError[];
  schoolData: SchoolData | null;
}

export interface DataEntryState {
  categories: CategoryWithColumns[];
  selectedCategoryId: string | null;
  formData: DataEntryFormData;
  loading: boolean;
  submitting: boolean;
  error: Error | null;
  formStatus: 'draft' | 'submitted' | 'approved' | 'rejected' | null;
  completionPercentage: number;
  schoolData: SchoolData | null;
}

export interface PendingItem {
  id: string;
  title?: string;
  school?: string;
  schoolName?: string;
  category?: string;
  categoryName?: string;
  date?: string;
  dueDate?: string;
  submittedAt?: string;
  status?: string;
}

export interface ActivityLogItem {
  id: string;
  action: string;
  timestamp: string;
  user?: string;
  entityType?: string;
  entityId?: string;
  details?: string;
}

export interface SchoolStat {
  id: string;
  name: string;
  completionPercentage: number;
  pendingItems?: number;
  status?: string;
}

export interface CategoryStat {
  id: string;
  name: string;
  schoolCount: number;
  completionPercentage: number;
  status?: string;
  deadline?: string;
  columnCount?: number;
}

export interface SectorCompletionItem {
  id: string;
  name: string;
  schoolCount: number;
  completionPercentage: number;
  completion?: {
    percentage: number;
    total: number;
    completed: number;
  };
  completionRate?: number;
}
