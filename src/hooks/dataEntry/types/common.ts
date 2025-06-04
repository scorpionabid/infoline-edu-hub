// Common types for data entry system
export interface BaseDataEntry {
  id: string;
  category_id: string;
  column_id: string;
  value: string;
  status: DataEntryStatus;
  created_at: string;
  updated_at: string;
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejection_reason?: string;
}

export enum DataEntryStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface FormField {
  columnId: string;
  value: any;
  isValid: boolean;
  error?: string;
}

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'min' | 'max';
  value?: any;
  message: string;
}

export interface SaveOptions {
  autoSave?: boolean;
  validateBeforeSave?: boolean;
  showToast?: boolean;
}

export interface SubmitOptions {
  validateBeforeSubmit?: boolean;
  autoApprove?: boolean;
  comment?: string;
}

export type EntityType = 'school' | 'sector';

export interface BaseDataEntryOptions {
  categoryId: string;
  entityId: string;
  entityType: EntityType;
  autoSave?: boolean;
  autoSaveInterval?: number;
}
