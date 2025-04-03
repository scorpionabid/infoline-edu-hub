
import { Category } from './category';

export type ColumnType = 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'file' | 'image';

export interface Column {
  id: string;
  name: string;
  categoryId: string;
  type: string;
  isRequired: boolean;
  orderIndex: number;
  order: number;
  status: string;
  options?: string[];
  helpText?: string;
  placeholder?: string;
  validationRules?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
  defaultValue?: string;
}

export interface CategoryWithColumns extends Category {
  columns: Column[];
}
