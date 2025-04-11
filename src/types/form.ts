
export type FormStatus = 'pending' | 'approved' | 'rejected' | 'draft' | 'overdue' | 'due' | 'empty' | 'dueSoon';

export interface Form {
  id: string;
  title: string;
  category?: string;
  status: FormStatus;
  completionPercentage: number;
  date?: string;
  deadline?: string;
}

export interface FormData {
  id?: string;
  values: Record<string, any>;
  category?: string;
  status: FormStatus;
  errors?: Record<string, string>;
  lastSaved?: Date;
}

export interface FormField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'textarea';
  isRequired: boolean;
  placeholder?: string;
  helpText?: string;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  defaultValue?: any;
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
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'draft' | 'archived';
}
