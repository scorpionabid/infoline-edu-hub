
export type FormStatus = 
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'draft'
  | 'dueSoon'
  | 'overdue'
  | 'empty';

export interface Form {
  id: string;
  title: string;
  category?: string;
  status: FormStatus;
  completionPercentage?: number;
  date?: string;
  deadline?: string;
  description?: string;
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date' | 'checkbox' | 'textarea';
  required: boolean;
  options?: string[];
  value: any;
  placeholder?: string;
  helpText?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface FormSection {
  id: string;
  title: string;
  fields: FormField[];
}

export interface FormTemplate {
  id: string;
  title: string;
  description?: string;
  sections: FormSection[];
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'draft' | 'archived';
}
