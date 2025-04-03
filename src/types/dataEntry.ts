
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
  id?: string;
  category_id: string;
  column_id: string;
  school_id: string;
  value?: string;
  status?: string;
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
