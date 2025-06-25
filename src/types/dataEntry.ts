
// Enhanced data entry types with proper status enums
export enum DataEntryStatus {
  DRAFT = 'draft',
  PENDING = 'pending', 
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface ProxyDataEntryOptions {
  schoolId: string;
  categoryId: string;
  reason?: string;
  autoApprove?: boolean;
  notifySchoolAdmin?: boolean;
}

export interface DataEntryFormData {
  [columnId: string]: any;
}

export interface BulkDataEntry {
  schoolId: string;
  data: DataEntryFormData;
  status?: DataEntryStatus;
}

export interface ProxyDataEntryResult {
  success: boolean;
  entryId?: string;
  message?: string;
  error?: string; // Add error field
  errors?: Record<string, string>;
  autoApproved?: boolean;
}

export interface DataEntryValidation {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface DataEntryTableData {
  id: string;
  school_name: string;
  category_name: string;
  status: DataEntryStatus;
  created_at: string;
  updated_at: string;
  submitted_by: string;
}

// Additional interfaces needed for proxy data entry
export interface SaveProxyFormDataOptions {
  categoryId: string;
  schoolId: string;
  userId: string;
  proxyUserId: string;
  proxyUserRole: string;
  originalSchoolId: string;
  proxyReason: string;
  status: string;
}

export interface SubmitProxyDataOptions {
  categoryId: string;
  schoolId: string;
  proxyUserId: string;
  proxyUserRole: string;
  proxyReason: string;
  autoApprove: boolean;
}
