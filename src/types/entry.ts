
import { Column } from './column';

export interface EntryValidation {
  isValid: boolean;
  errors: Record<string, string[]>;
}

export interface DataEntry {
  column_id: string;
  school_id: string;
  category_id: string;
  value: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface EntryFormData {
  entries: DataEntry[];
  isValid?: boolean;
  errors?: Record<string, string[]>;
}
