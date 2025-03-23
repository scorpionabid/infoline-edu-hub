
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
}

export interface CategoryWithProgress extends Category {
  completionPercentage?: number;
  entryCount?: number;
  completedEntryCount?: number;
  rejectedEntryCount?: number;
}
