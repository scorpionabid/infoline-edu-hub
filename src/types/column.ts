
export type ColumnType = 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'file' | 'image' | 'textarea';

export interface Column {
  id: string;
  categoryId: string;
  name: string;
  type: ColumnType | string;
  isRequired?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[];
  order?: number;
  status?: 'active' | 'inactive';
  parentColumnId?: string;
  defaultValue?: any;
  validation?: {
    minLength?: number;
    maxLength?: number;
    minValue?: number;
    maxValue?: number;
    pattern?: string;
    regex?: string;
  };
}

export interface CategoryWithColumns extends Category {
  columns: Column[];
}
