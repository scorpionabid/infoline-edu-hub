
import { CategoryWithColumns } from './column';

export interface DataEntry {
  id?: string;
  column_id: string;
  category_id: string;
  school_id: string;
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

export interface DataEntryForm {
  id?: string;
  title: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected' | 'dueSoon' | 'overdue';
  completionPercentage: number;
  date: string;
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
  onComplete?: () => void;
}

export interface UseDataEntryResult {
  categories: CategoryWithColumns[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
  formData: Record<string, any>;
  entries: DataEntry[];
  handleEntriesChange: (entries: DataEntry[]) => void;
  handleSave: () => Promise<void>;
  handleSubmitForApproval: () => Promise<void>;
  loadDataForSchool: (schoolId: string) => Promise<void>;
  submitForApproval: () => Promise<void>;
  saveStatus: DataEntrySaveStatus;
  isDataModified: boolean;
}
