
export type CategoryStatus = 'active' | 'inactive' | 'pending' | 'approved' | 'rejected' | 'dueSoon' | 'overdue';

export interface Category {
  id: string;
  name: string;
  description?: string;
  deadline?: string;
  status: CategoryStatus | string;
  priority?: number;
  assignment?: 'all' | 'sectors';
  createdAt?: string;
  updatedAt?: string;
  columnCount?: number; // Əlavə edildi
  archived?: boolean;    // Əlavə edildi
}

export interface CategoryWithProgress extends Category {
  completionPercentage?: number;
  entryCount?: number;
  completedEntryCount?: number;
  rejectedEntryCount?: number;
}

export interface CategoryFilter {
  status?: string;
  assignment?: 'all' | 'sectors';
  search?: string;
  showArchived?: boolean;
}
