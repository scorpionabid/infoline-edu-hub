import { Column } from '@/types/column';
import { Category } from '@/types/category';

export type DataEntryStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'pending';

export interface ColumnEntry {
  id: string;
  columnId: string; 
  value: string;
  status: DataEntryStatus;
  errorMessage?: string;
}

export interface CategoryEntryData {
  id: string;
  categoryId: string;
  categoryName: string;
  order: number;
  status: DataEntryStatus;
  progress: number;
  isSubmitted: boolean;
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  values: ColumnEntry[];
  // Geri uyğunluq üçün əlavə sahələr
  entries?: { columnId: string; value: string; status: DataEntryStatus; id: string }[];
  isCompleted?: boolean;
  completionPercentage?: number;
}

export interface DataEntryFormState {
  status: DataEntryStatus;
  entries: CategoryEntryData[];
  lastSaved: string;
  overallProgress: number;
  schoolId?: string;
}

export interface CategoryWithColumns {
  category: Category;
  columns: Column[];
}

export interface ColumnValidationError {
  id: string; 
  columnId: string;
  categoryId: string;
  message: string;
  value: string;
}

export interface DataEntry {
  id: string; // id daima məcburidir, optional deyil
  category_id: string;
  column_id: string;
  school_id: string;
  value?: string;
  status?: DataEntryStatus | string;
  created_by?: string;
  updated_at?: string;
  created_at?: string;
  approved_at?: string;
  approved_by?: string;
  rejected_by?: string;
  rejection_reason?: string;
  errorMessage?: string;
  columnId?: string;
}

export interface ActionType {
  type: string;
  payload: any;
}

export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  options?: string[];
  // Əlavə validasiya xassələri
  minValue?: number;
  maxValue?: number;
  warningThreshold?: {
    min?: number;
    max?: number;
  };
  patternMessage?: string;
  minDate?: string | Date;
  maxDate?: string | Date;
}

export interface EntryValue {
  id: string;
  value: string;
  columnId: string;
  status: DataEntryStatus;
}

export interface CategoryFilter {
  search: string;
  status: string;
  assignment: string;
  withDeadline: boolean;
  showArchived: boolean; // Əlavə edildi
}

export interface DataEntryForm {
  status: DataEntryStatus;
  entries: CategoryEntryData[];
  lastSaved: string;
  overallProgress: number;
  schoolId?: string;
}
