
import { Column } from './column';

// Kateqoriya interfeysi
export interface CategoryData {
  id: string;
  name: string;
  description: string;
  assignment: 'all' | 'sectors';
  deadline: string | null;
  status: 'active' | 'inactive' | 'archived';
  priority: number;
  created_at: string;
  updated_at: string;
  column_count?: number;
  archived?: boolean;
}

// Təkrar bir çox yerdə istifadə edildiyi üçün Category alias əlavə edildi
export type Category = CategoryData;

// Kateqoriya və sütun daxil olan tip
export interface CategoryWithColumns extends CategoryData {
  columns: (Column & { entry?: any })[];
  completionPercentage: number;
}

// Daxil edilmiş dəyərlər üçün tip
export interface EntryValue {
  column_id: string;
  category_id: string;
  school_id: string;
  value: any;
  id?: string;
  status?: EntryStatus;
}

// Daxil edilən məlumatın statusu
export type EntryStatus = 'pending' | 'approved' | 'rejected';

// FormStatus dəyişəni yenidən ixrac edirik
export { FormStatus } from '../types/form';

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
