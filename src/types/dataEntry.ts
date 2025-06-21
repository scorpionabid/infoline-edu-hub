
export type DataEntryStatus = 'pending' | 'approved' | 'rejected' | 'draft';

export interface DataEntry {
  id: string;
  category_id: string;
  school_id: string;
  column_id: string;
  value: string;
  status: DataEntryStatus;
  created_by?: string;
  created_at: string;
  updated_at: string;
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejected_at?: string;
  rejection_reason?: string;
  approval_comment?: string;
  proxy_created_by?: string;
  proxy_reason?: string;
  proxy_original_entity?: string;
}

export interface DataEntryTableData {
  columns: Array<{
    id: string;
    name: string;
    type: string;
  }>;
  values: Record<string, string>;
}

export interface DataEntryFormData {
  [columnId: string]: string;
}

export interface ApprovalSubmission {
  id: string;
  categoryId: string;
  categoryName: string;
  schoolId: string;
  schoolName: string;
  submittedBy: string;
  submittedAt: string;
  status: DataEntryStatus;
  entries: DataEntry[];
  completionRate: number;
}
