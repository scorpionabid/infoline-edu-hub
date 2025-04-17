
import { Category, Column } from './column';
import { FormStatus } from './form';

export enum DataEntrySaveStatus {
  IDLE = 'idle',
  SAVING = 'saving',
  SAVED = 'saved',
  ERROR = 'error'
}

export type DataEntry = {
  id?: string;
  school_id: string;
  category_id: string;
  column_id: string;
  value: string | null;
  status?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  approved_at?: string;
  approved_by?: string;
  rejected_by?: string;
  rejection_reason?: string;
};

export interface ColumnValidationError {
  message: string;
  type: string;
  column_id: string;
  column_name: string;
}

export interface EntriesMap {
  [columnId: string]: DataEntry;
}

export interface CategoryEntries {
  [categoryId: string]: EntriesMap;
}

export interface CategoryFormState {
  status: FormStatus;
  isModified: boolean;
  completionPercentage: number;
  entries: EntriesMap;
}

export interface CategoryFormData {
  [categoryId: string]: CategoryFormState;
}

export type CategoryWithProgress = Category & {
  completionPercentage: number;
  status: FormStatus;
};
