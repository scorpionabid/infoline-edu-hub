
import { Category } from './category';
import { Column } from './column';

export interface EntryValue {
  id?: string;
  column_id: string;
  category_id: string;
  school_id: string;
  value: any;
  status?: string;
  columnId?: string; // Əlavə field column_id ilə eyni dəyəri saxlayır
}

export interface CategoryEntryData {
  id: string;
  name: string;
  entries: EntryValue[];
  status?: string;
  deadline?: string;
  completionPercentage?: number;
}

export type FormStatus = 'idle' | 'loading' | 'success' | 'error' | 
                         'completed' | 'pending' | 'rejected' | 
                         'dueSoon' | 'overdue' | 'approved' | 'draft';

export interface CategoryWithColumns extends Category {
  columns: Column[];
  columnCount?: number;
}
