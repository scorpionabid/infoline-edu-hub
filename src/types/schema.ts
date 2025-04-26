
// Genişləndirin mövcud tip definisiyalarını
export type CategoryStatus = 'active' | 'inactive' | 'draft';
export type AssignmentType = 'all' | 'sectors' | 'schools';
export type FormStatus = 'completed' | 'pending' | 'dueSoon' | 'overdue';

export interface CategoryFilter {
  status?: CategoryStatus[];
  assignment?: AssignmentType[];
  priority?: number[];
  name?: string;
  // Deadline əlavə et
  deadline?: Date;
}

export interface CategoryWithColumns {
  id: string;
  name: string;
  status: CategoryStatus;
  columns?: Column[];
  completionPercentage?: number; // Əlavə edildi
}
