
import { Column } from './column';

export interface EntryValue {
  id?: string;
  columnId: string;
  value: any;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface CategoryEntryData {
  categoryId: string;
  values: { columnId: string; value: any }[];
  completionPercentage: number;
}

export interface DataEntryForm {
  id?: string;
  schoolId: string;
  categoryId: string;
  title?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'draft' | 'submitted';
  submittedAt?: string;
  updatedAt?: string;
  entries: EntryValue[];
  lastSaved?: string;
}

export interface CategoryWithColumns {
  id: string;
  name: string;
  description?: string;
  assignment?: string;
  deadline?: string;
  status?: string;
  priority?: number;
  created_at?: string;
  updated_at?: string;
  columns: Column[];
  completionPercentage?: number;
}

export interface DataEntryData {
  id: string;
  schoolId: string;
  title: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  entries: EntryValue[];
}

export interface UseDataEntryResult {
  formData: DataEntryForm;
  updateFormData: (data: Partial<DataEntryForm>) => void;
  categories: CategoryWithColumns[];
  loading: boolean;
  submitting: boolean;
  handleEntriesChange: (entries: EntryValue[]) => void;
  handleSave: () => Promise<void>;
  handleSubmitForApproval: () => Promise<void>;
  loadDataForSchool: (schoolId: string) => Promise<void>;
  entries: EntryValue[];
  submitForApproval: () => Promise<void>;
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error';
  isDataModified?: boolean;
  error?: string | null;
  selectedCategory?: CategoryWithColumns;
  isAutoSaving?: boolean;
  isSubmitting?: boolean;
  isLoading?: boolean;
  updateValue?: (columnId: string, value: any) => void;
  saveForm?: () => Promise<void>;
  getErrorForColumn?: (columnId: string) => any[];
  validation?: {
    errors: any[];
    isValid: boolean;
  };
}
