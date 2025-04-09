
export type FormStatus = 'pending' | 'approved' | 'rejected';

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
  status: string;
  deadline?: string;
  created_at: string;
  updated_at: string;
  category_id: string;
  school_id: string;
}
