
import { ColumnType } from "./column";

export interface EntryValue {
  columnId: string;
  value: string | number | Date | boolean | string[];
  status: 'pending' | 'approved' | 'rejected';
  errorMessage?: string;
  warningMessage?: string;
  history?: ValueHistoryEntry[];
  lastModified?: Date;
  modifiedBy?: string;
}

// Dəyər dəyişikliyi tarixçəsi
export interface ValueHistoryEntry {
  timestamp: Date;
  userId: string;
  userName: string;
  previousValue: string | number | Date | boolean | string[] | null;
  newValue: string | number | Date | boolean | string[] | null;
  action: 'create' | 'update' | 'delete' | 'approve' | 'reject';
  comment?: string;
}

export interface CategoryEntryData {
  categoryId: string;
  values: EntryValue[];
  isCompleted: boolean;
  isSubmitted: boolean;
  completionPercentage: number;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
  lastModified?: Date;
}

export interface DataEntryForm {
  formId: string;
  schoolId: string;
  entries: CategoryEntryData[];
  lastSaved?: string;
  overallProgress: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  version?: number;
  lockedBy?: string;
  lockedUntil?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ColumnValidationError {
  columnId: string;
  message: string;
  categoryId?: string;
  type?: 'required' | 'format' | 'range' | 'dependency' | 'custom';
  severity?: 'error' | 'warning' | 'info';
}

export interface DataEntryFormHistory {
  timestamp: Date;
  userId: string;
  userName: string;
  action: 'create' | 'update' | 'submit' | 'approve' | 'reject';
  details?: string;
  formState?: Partial<DataEntryForm>;
}

export interface ExcelImportResult {
  success: boolean;
  totalRows: number;
  successfulRows: number;
  errorRows: number;
  warningRows: number;
  errors: {
    row: number;
    column: string;
    message: string;
    value?: any;
  }[];
  warnings: {
    row: number;
    column: string;
    message: string;
    value?: any;
  }[];
}

export interface AutoSaveConfig {
  enabled: boolean;
  interval: number;
  maxRetries: number;
  retryDelay: number;
  successMessage: boolean;
}

// Validasiya qaydaları tipi - Column.validationRules tipi ilə uyğunlaşdırılıb
export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  pattern?: string;
  patternError?: string;
  minDate?: string | Date;
  maxDate?: string | Date;
  warningThreshold?: {
    min?: number;
    max?: number;
  };
  format?: string;
  regex?: string;
  customValidator?: (value: any) => { valid: boolean; message?: string };
}

// DataEntry tipi artıq supabase.d.ts faylına köçürdük,
// beləliklə həm o fayldan həm də buradan import edilə bilər
export type { DataEntry } from '@/types/supabase';
