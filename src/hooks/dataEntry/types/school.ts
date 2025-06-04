import { BaseDataEntry } from './common';

// School-specific data entry types
export interface SchoolDataEntry extends BaseDataEntry {
  school_id: string;
}

export interface SchoolFormData {
  [columnId: string]: any;
}

export interface SchoolDataEntryOptions {
  schoolId: string;
  categoryId: string;
  autoSave?: boolean;
  validationEnabled?: boolean;
}

export interface SchoolSubmissionResult {
  success: boolean;
  entryId?: string;
  status: 'pending' | 'draft';
  message?: string;
  errors?: Record<string, string>;
}

export interface SchoolValidationContext {
  schoolId: string;
  categoryId: string;
  formData: SchoolFormData;
  isRequired: boolean;
}
