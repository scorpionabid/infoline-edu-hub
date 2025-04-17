
import { Column } from './column';
import { Category, CategoryStatus } from './category';

// Kateqoriya və sütun daxil olan tip artıq category.ts-də CategoryWithColumns kimi təyin edilib
export { CategoryWithColumns } from './category';

// Daxil edilmiş dəyərlər üçün tip
export interface EntryValue {
  column_id: string;
  category_id: string;
  school_id: string;
  value: any;
  id?: string;
  status?: EntryStatus;
}

// Kateqoriya daxiletmələri üçün data tipi
export interface CategoryEntryData {
  id: string;
  categoryId: string;
  isSubmitted: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  values: EntryValue[];
}

// Data daxiletmə formu üçün tip
export interface DataEntryForm {
  schoolId: string;
  entries: CategoryEntryData[];
  isSubmitting: boolean;
  isSubmitted: boolean;
  errors: Record<string, string[]>;
}

// Daxil edilən məlumatın statusu
export type EntryStatus = 'pending' | 'approved' | 'rejected';

// FormStatus dəyişəni yenidən ixrac edirik
export { FormStatus } from './form';

// Data daxil etmə statusu
export enum DataEntrySaveStatus {
  IDLE = 'idle',
  SAVING = 'saving',
  SAVED = 'saved',
  ERROR = 'error',
  SUBMITTING = 'submitting',
  SUBMITTED = 'submitted'
}

// Validasiya xətası
export interface ColumnValidationError {
  columnId: string;  // Əvvəlki field
  message: string;
  type: 'required' | 'type' | 'min' | 'max' | 'pattern' | 'custom';
}

// Validasiya xətaları üçün köməkçi alətlər
export const validateEntry = (column: Column, value: any): ColumnValidationError | null => {
  // Validasiya məntiqini burada həyata keçirə bilərsiniz
  return null;
};

// İxrac edilən Category tipi
export { Category, CategoryStatus };
