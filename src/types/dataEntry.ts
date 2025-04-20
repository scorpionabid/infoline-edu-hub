
import { Category, CategoryStatus } from './category';
import { Column } from './column';

export interface DataEntry {
  id?: string;
  school_id: string;
  category_id: string;
  column_id: string;
  value: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejection_reason?: string;
}

export enum DataEntrySaveStatus {
  IDLE = 'idle',
  SAVING = 'saving',
  SAVED = 'saved',
  ERROR = 'error',
  SUBMITTING = 'submitting',
  SUBMITTED = 'submitted',
}

export interface DataEntryFormProps {
  category: Category;
  entries: DataEntry[];
  onChange: (entries: DataEntry[]) => void;
  disabled?: boolean;
  errors?: Record<string, any>;
}

export interface DataEntryContextType {
  categories: Category[];
  entries: DataEntry[];
  isLoading: boolean;
  error: string | null;
  saveStatus: DataEntrySaveStatus;
  isDataModified: boolean;
  loadDataForSchool: (schoolId: string) => Promise<void>;
  handleEntriesChange: (updatedEntries: DataEntry[]) => void;
  handleSave: () => Promise<void>;
  handleSubmitForApproval: () => Promise<void>;
}

export interface UseDataEntryProps {
  schoolId?: string;
  categoryId?: string;
  onComplete?: () => void;
}

export interface CategoryDataState {
  [categoryId: string]: {
    entries: DataEntry[];
    status: CategoryStatus;
  };
}

export interface EntryValidationResult {
  valid: boolean;
  errors: {
    [columnId: string]: {
      message: string;
      type: string;
    }[];
  };
}

export interface ColumnDataEntryProps {
  column: Column;
  value: string;
  onChange: (value: string) => void;
  errors?: any[];
  disabled?: boolean;
}
