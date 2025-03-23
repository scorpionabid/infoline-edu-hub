
export type ColumnType = 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'file' | 'image' | 'textarea' | 'email' | 'phone' | 'boolean';

export interface ColumnOption {
  label: string;
  value: string;
}

export interface Column {
  id: string;
  categoryId: string;
  name: string;
  type: ColumnType | string;
  isRequired?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: (string | ColumnOption)[];
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
    minDate?: string;
    maxDate?: string;
  };
  validationRules?: any; // Köhnə kodla uyğunluq üçün
  deadline?: string;     // Köhnə kodla uyğunluq üçün
  multiline?: boolean;   // Köhnə kodla uyğunluq üçün
  dependsOn?: {          // Asılılıq üçün əlavə edildi
    columnId: string;
    condition: {
      type: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan';
      value: any;
    }
  };
}

export interface CategoryWithColumns {
  id?: string;
  name?: string;
  description?: string;
  deadline?: string;
  status?: string;
  columns: Column[];
  assignment?: 'all' | 'sectors';
  createdAt?: string;    // createdAt əlavə edildi
}

export type CategoryColumn = {
  id: string;
  categoryId: string;
  name: string;
  type: ColumnType;
  isRequired?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: (string | ColumnOption)[];
  order: number;          // order burada məcburi olduğundan əmin olun
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
    minDate?: string;
    maxDate?: string;
  };
  dependsOn?: {
    columnId: string;
    condition: {
      type: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan';
      value: any;
    }
  };
};
