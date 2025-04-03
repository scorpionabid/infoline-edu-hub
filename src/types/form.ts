
export type FormStatus = 'pending' | 'approved' | 'rejected' | 'overdue' | 'dueSoon' | 'draft' | 'inProgress';

export interface FormItem {
  id: string;
  title: string;
  status: FormStatus;
  completionPercentage: number;
  deadline: string;
  filledCount: number;
  totalCount: number;
  categoryId: string;
  category?: string;
  dueDate?: string | Date;
  date?: string;
}

export interface FormStats {
  pending: number;
  approved: number;
  rejected: number;
  dueSoon: number;
  overdue: number;
}

export interface Form {
  id: string;
  title: string;
  categoryId: string;
  categoryName: string;
  status: FormStatus;
  dueDate: string | Date;
  deadline?: string;
  completionPercentage?: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  data: Record<string, any>;
  userId: string;
  schoolId: string;
  approvedBy?: string;
  approvedAt?: string | Date;
  rejectedBy?: string;
  rejectedAt?: string | Date;
  rejectionReason?: string;
  filledCount?: number;
  totalCount?: number;
}

export interface FormField {
  id: string;
  columnId: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'textarea' | 'file' | 'image' | 'email' | 'phone' | 'multiselect';
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    maxLength?: number;
  };
  value?: any;
  defaultValue?: any;
  error?: string;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
}

export interface FormTemplate {
  id: string;
  title: string;
  description?: string;
  categoryId: string;
  sections: FormSection[];
  dueDate?: string | Date;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}
