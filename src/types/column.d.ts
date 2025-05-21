
import {
  ColumnType,
  ColumnOption,
  ColumnValidation,
  BaseColumn,
  Column,
  ColumnFormValues
} from './core/column';

// Re-export core types
export type {
  ColumnType,
  ColumnOption,
  ColumnValidation,
  BaseColumn,
  Column,
  ColumnFormValues
};

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

// Column type definition
export interface ColumnTypeDefinition {
  id: ColumnType;
  name: string;
  description: string;
  icon?: React.ReactNode;
  validations?: ColumnValidation[];
  hasOptions?: boolean;
}

// Additional column-specific types
export interface ColumnHeaderProps {
  categoryId?: string;
  onAddColumn?: () => void;
  onImportColumns?: () => void;
  columnsCount?: number;
  isLoading?: boolean;
}
