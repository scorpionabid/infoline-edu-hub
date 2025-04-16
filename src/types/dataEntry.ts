
import { Column } from './column';

export interface DataEntryForm {
  id?: string;
  schoolId: string;
  categoryId: string;
  title?: string;
  status?: 'draft' | 'pending' | 'approved' | 'rejected';
  entries: EntryValue[];
  submittedAt?: string;
  updatedAt?: string;
}

export interface EntryValue {
  id?: string;
  categoryId: string;
  columnId: string;
  value: string | number | boolean | null;
  status?: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

export interface CategoryWithColumns {
  id: string;
  name: string;
  description?: string;
  priority?: number;
  status?: string;
  assignment?: string;
  deadline?: string;
  columns: Column[];
}

export enum DataEntrySaveStatus {
  IDLE = 'idle',
  SAVING = 'saving',
  SAVED = 'saved',
  ERROR = 'error'
}

export interface UseDataEntryProps {
  schoolId?: string;
  categoryId?: string; // Əlavə edildi
  categories?: CategoryWithColumns[];
  onComplete?: () => void;
}

export interface UseDataEntryResult {
  formData: DataEntryForm;
  updateFormData: (newData: Partial<DataEntryForm>) => void;
  categories: CategoryWithColumns[];
  loading: boolean;
  error?: string | null;
  selectedCategory?: CategoryWithColumns;
  saveStatus: DataEntrySaveStatus;
  isDataModified: boolean;
  handleSave: () => Promise<void>;
  handleSubmitForApproval: () => Promise<void>;
  handleEntriesChange: (columnId: string, value: string | number | boolean | null) => void;
  loadDataForSchool: (schoolId: string) => Promise<void>;
  entries: EntryValue[];
  submitting?: boolean;
  submitForApproval: () => void;
}

export interface CategoryEntryData {
  categoryId: string;
  entries: EntryValue[];
}

export interface ColumnValidationError {
  columnId: string;
  message: string;
}
