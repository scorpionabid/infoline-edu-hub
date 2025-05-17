
export type CategoryStatus = 'active' | 'inactive' | 'draft' | 'archived';

export interface Category {
  id: string;
  name: string;
  description?: string;
  status?: CategoryStatus;
  priority?: number;
  deadline?: string | Date;
  column_count?: number;
  created_at?: string;
  updated_at?: string;
  archived?: boolean;
  assignment?: string;
}

export interface CategoryWithColumns extends Category {
  columns?: any[];
}

// Function to normalize category status
export function normalizeCategoryStatus(status: string | string[] | undefined): CategoryStatus[] {
  if (!status) return ['active'];
  
  if (typeof status === 'string') {
    return [status as CategoryStatus];
  }
  
  return status as CategoryStatus[];
}
