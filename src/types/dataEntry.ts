
import { Column, Category } from './column';

export interface DataEntryForm {
  id?: string;
  schoolId: string;
  categoryId: string;
  title?: string;
  status?: 'draft' | 'pending' | 'approved' | 'rejected' | 'submitted';
  entries: EntryValue[];
  submittedAt?: string;
  updatedAt?: string;
  lastSaved?: string;
}

export interface EntryValue {
  id?: string;
  categoryId: string;
  columnId: string;
  value: string | number | boolean | null;
  status?: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  values?: Array<{columnId: string; value: any}>;
  completionPercentage?: number;
  isCompleted?: boolean;
}

export enum DataEntrySaveStatus {
  IDLE = 'idle',
  SAVING = 'saving',
  SAVED = 'saved',
  ERROR = 'error'
}

export interface UseDataEntryProps {
  schoolId?: string;
  categoryId?: string;
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
  entries?: EntryValue[];
  values?: any[]; 
  isCompleted?: boolean;
  isSubmitted?: boolean;
  completionPercentage?: number;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
}

export interface ColumnValidationError {
  columnId: string;
  message: string;
}

// CategoryWithColumns tipi həm burada, həm də column.ts-də olduğundan onu yenidən ixrac edirik
export { CategoryWithColumns } from './column';
