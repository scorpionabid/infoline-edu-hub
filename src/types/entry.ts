
import { DataEntry } from './dataEntry';
import { Category } from './category';
import { Column } from './column';

export interface EntryFormData {
  schoolId: string;
  categoryId: string;
  entries: DataEntry[];
  isModified: boolean;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  lastSaved?: string;
}

export interface EntryValidation {
  isValid: boolean;
  errors: Record<string, string[]>;
}

export interface EntryContextType {
  formData: EntryFormData;
  validation: EntryValidation;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  updateEntry: (columnId: string, value: string) => void;
  saveEntries: () => Promise<boolean>;
  submitEntries: () => Promise<boolean>;
}
