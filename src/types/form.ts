
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
