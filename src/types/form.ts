export type FormStatus = 'pending' | 'approved' | 'rejected' | 'draft' | 'completed' | 'dueSoon' | 'overdue';

export interface FormData {
  id: string;
  categoryId: string;
  schoolId: string;
  status: FormStatus;
  createdAt: string;
  updatedAt: string;
  entries?: Record<string, any>;
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  status: FormStatus;
  deadline?: string;
  created_at: string;
  updated_at: string;
  category_id: string;
  school_id: string;
  category?: string; // Kateqoriya adı
  completionPercentage?: number; // Tamamlanma faizi
}
