
import { Column, CategoryWithColumns } from './column';

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
  entries: EntryValue[];
  values?: any[]; // Eksik sahəni əlavə etdik
  isCompleted?: boolean; // Eksik sahəni əlavə etdik
  isSubmitted?: boolean; // Eksik sahəni əlavə etdik
  completionPercentage?: number; // Eksik sahəni əlavə etdik
  approvalStatus?: 'pending' | 'approved' | 'rejected'; // Eksik sahəni əlavə etdik
}

export interface ColumnValidationError {
  columnId: string;
  message: string;
}
