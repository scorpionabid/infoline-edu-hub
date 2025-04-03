
export interface DataEntry {
  id: string;
  category_id: string;
  column_id: string;
  school_id: string;
  categoryId?: string;
  columnId?: string;
  schoolId?: string;
  value: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedBy?: string;
  rejectionReason?: string;
}
