
import { LucideIcon, Type, Hash, Mail, Phone, Calendar, ChevronDown, CheckSquare, Circle, FileText } from 'lucide-react';

// Core column types
export type ColumnType = 
  | 'text' 
  | 'textarea' 
  | 'number' 
  | 'email' 
  | 'phone' 
  | 'url'
  | 'password'
  | 'select' 
  | 'checkbox' 
  | 'radio' 
  | 'date' 
  | 'file'
  | 'time'
  | 'datetime'
  | 'multiselect';

export interface ColumnOption {
  id?: string;
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
}

export interface ColumnValidation {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  patternMessage?: string;
  minLength?: number;
  maxLength?: number;
  email?: boolean;
  url?: boolean;
  numeric?: boolean;
  integer?: boolean;
  date?: boolean;
  custom?: string;
}

export interface BaseColumn {
  id: string;
  category_id: string;
  name: string;
  type: ColumnType;
  is_required?: boolean;
  placeholder?: string;
  help_text?: string;
  default_value?: string;
  order_index?: number;
  status?: string;
  created_at: string;
  updated_at: string;
}

export interface Column extends BaseColumn {
  options?: ColumnOption[];
  validation?: ColumnValidation;
  description?: string;
  section?: string;
  color?: string;
  key?: string;
}

export interface ColumnFormValues {
  name: string;
  type: ColumnType;
  category_id: string;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  default_value?: string;
  description?: string;
  section?: string;
  options?: ColumnOption[];
  validation?: ColumnValidation;
  order_index?: number;
}

export interface ColumnFormData extends ColumnFormValues {}

// Column type definitions for UI
export interface ColumnTypeDefinition {
  value: ColumnType;
  label: string;
  description: string;
  icon: React.ReactNode;
  hasOptions?: boolean;
}

export const columnTypeDefinitions: ColumnTypeDefinition[] = [
  {
    value: 'text',
    label: 'Text',
    description: 'Single line text input',
    icon: <Type className="h-4 w-4" />
  },
  {
    value: 'textarea',
    label: 'Textarea',
    description: 'Multi-line text input',
    icon: <FileText className="h-4 w-4" />
  },
  {
    value: 'number',
    label: 'Number',
    description: 'Numeric input',
    icon: <Hash className="h-4 w-4" />
  },
  {
    value: 'email',
    label: 'Email',
    description: 'Email address input',
    icon: <Mail className="h-4 w-4" />
  },
  {
    value: 'phone',
    label: 'Phone',
    description: 'Phone number input',
    icon: <Phone className="h-4 w-4" />
  },
  {
    value: 'date',
    label: 'Date',
    description: 'Date picker input',
    icon: <Calendar className="h-4 w-4" />
  },
  {
    value: 'select',
    label: 'Select',
    description: 'Dropdown selection',
    icon: <ChevronDown className="h-4 w-4" />,
    hasOptions: true
  },
  {
    value: 'radio',
    label: 'Radio',
    description: 'Radio button selection',
    icon: <Circle className="h-4 w-4" />,
    hasOptions: true
  },
  {
    value: 'checkbox',
    label: 'Checkbox',
    description: 'Checkbox input',
    icon: <CheckSquare className="h-4 w-4" />
  }
];

// Legacy validation interface for backward compatibility
export interface ValidationRules extends ColumnValidation {}

// Column type selector component props
export interface ColumnTypeSelectorProps {
  value: ColumnType;
  onChange: (value: ColumnType) => void;
}

// Column form props
export interface ColumnFormProps {
  initialValues?: Partial<Column>;
  onSubmit: (values: ColumnFormValues) => void;
  onCancel: () => void;
  categoryId: string;
  isSubmitting?: boolean;
}

// Column dialog props
export interface ColumnDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  categoryId: string;
  column?: Column;
  onColumnCreated?: () => void;
  onColumnUpdated?: () => void;
}

// Column list props
export interface ColumnListProps {
  columns: Column[];
  categoryId?: string;
  onEdit?: (column: Column) => void;
  onDelete?: (columnId: string) => void;
  isLoading?: boolean;
}

// Additional column-specific types
export interface ColumnHeaderProps {
  categoryId?: string;
  onAddColumn?: () => void;
  onImportColumns?: () => void;
  columnsCount?: number;
  isLoading?: boolean;
}
