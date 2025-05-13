
export interface School {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  region_id?: string;
  sector_id?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  principal_name?: string;
  logo?: string | null;
  region_name?: string;
  sector_name?: string;
}

export interface SchoolFormData {
  id?: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  region_id?: string;
  sector_id?: string;
  status?: string;
  principal_name?: string;
  logo?: string | null;
}

export type DataEntryStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export interface DataEntry {
  id: string;
  category_id: string;
  column_id: string;
  school_id: string;
  value: string;
  status: DataEntryStatus | string;
  created_by: string;
  created_at: string;
  updated_at: string;
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejection_reason?: string;
  deleted_at?: string;
}
