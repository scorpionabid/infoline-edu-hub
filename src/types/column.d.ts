
import { 
  ColumnType, 
  Column as CoreColumn, 
  ColumnOption, 
  ColumnValidation, 
  ColumnFormValues,
  BaseColumn
} from './core/column';

// Re-export core types
export type { 
  ColumnType, 
  ColumnOption, 
  ColumnValidation, 
  ColumnFormValues,
  BaseColumn
};

// We need to re-export Column with the is_required field as optional to maintain compatibility with existing code
export interface Column extends Omit<CoreColumn, 'is_required'> {
  is_required?: boolean;
}

// Additional UI-specific types for columns
export interface ColumnTypeDefinition {
  value: ColumnType;
  label: string;
  icon?: string;
  description: string;
  supportsOptions?: boolean;
  supportsValidation?: boolean;
}

export interface ColumnTypeSelectorProps {
  value?: ColumnType;
  onChange: (value: ColumnType) => void;
  disabled?: boolean;
}

export interface BasicColumnFieldsProps {
  form: any;
  control: any;
  categories: { id: string; name: string }[];
  columns?: Column[];
  editColumn?: Column | null;
  selectedType: string;
  onTypeChange: (type: ColumnType) => void;
  isEditMode: boolean;
}

export interface ColumnFormData {
  id?: string;
  category_id: string;
  name: string;
  type: ColumnType;
  status?: string;
  is_required: boolean;
  default_value?: string;
  help_text?: string;
  placeholder?: string;
  order_index?: number;
  options?: ColumnOption[];
  validation?: ColumnValidation;
  section?: string;
  description?: string;
  color?: string;
}
