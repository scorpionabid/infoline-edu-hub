
export interface Category {
  id: string;
  name: string;
  description?: string;
  assignment: 'all' | 'sectors';
  deadline?: string;
  status: 'active' | 'inactive' | 'draft';
  priority: number;
  created_at: string;
  updated_at: string;
  archived?: boolean;
  column_count?: number;
}
