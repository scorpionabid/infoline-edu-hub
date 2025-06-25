
export interface DataEntry {
  id: string;
  school_id: string;
  category_id: string;
  column_id: string;
  value: any;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface DataEntryTableData {
  columns: Array<{
    id: string;
    name: string;
    type: string;
  }>;
  values: Record<string, any>;
}
