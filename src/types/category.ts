
// Kategoriya status tipi
export type CategoryStatus = 'active' | 'inactive' | 'draft';

// Kategoriya modeli
export interface Category {
  id: string;
  name: string;
  description?: string;
  assignment?: 'all' | 'sectors';
  status: CategoryStatus;
  deadline?: string;
  priority?: number;
  columnCount?: number;
  createdAt: string;
  updatedAt: string;
  archived?: boolean;
}

// Kategoriya filtirləməsi üçün model
export interface CategoryFilter {
  search?: string;
  status?: CategoryStatus | 'all';
  assignment?: 'all' | 'sectors' | '';
  deadline?: 'upcoming' | 'past' | 'all' | '';
}

// Form status tipi
export type FormStatus = 'completed' | 'pending' | 'rejected' | 'dueSoon' | 'overdue' | 'draft' | 'approved';

// Form elementləri üçün model
export interface FormItem {
  id: string;
  title: string;
  description?: string;
  status: FormStatus;
  deadline?: string;
  completedAt?: string;
  rejectionReason?: string;
}
