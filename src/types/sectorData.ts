
export interface SectorDataEntry {
  id: string;
  sector_id: string;
  category_id: string;
  column_id: string;
  value: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  created_by: string;
  created_at: string;
  updated_at: string;
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejected_at?: string;
  rejection_reason?: string;
}

export interface SectorApprovalItem {
  id: string;
  sectorId: string;
  sectorName: string;
  categoryId: string;
  categoryName: string;
  submittedAt: string;
  submittedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  entries: SectorDataEntry[];
  completionRate: number;
  regionId?: string;
}

export interface SectorDataFormValues {
  [columnId: string]: string;
}
