
import { CategoryWithColumns, Column } from "./column";

export interface EntryValue {
  id?: string;
  value: any;
  status?: 'pending' | 'approved' | 'rejected';
  created_at?: string;
  updated_at?: string;
  approved_at?: string;
  approved_by?: string;
  rejection_reason?: string;
}

export interface DataEntryField {
  column: Column;
  value: EntryValue;
}

export interface DataEntryCategory {
  category: CategoryWithColumns;
  fields: DataEntryField[];
  completionPercentage: number;
}

export interface DataEntryForm {
  categories: DataEntryCategory[];
  overallCompletionPercentage: number;
  lastSaved?: string;
}
