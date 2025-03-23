
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
  dependsOn?: string;    // Köhnə kodla uyğunluq üçün
}

export interface CategoryWithColumns {
  id?: string;          // CategoryWithColumns üçün id əlavə edildi
  name?: string;        // CategoryWithColumns üçün name əlavə edildi
  description?: string;
  deadline?: string;    // CategoryWithColumns üçün deadline əlavə edildi
  status?: string;
  columns: Column[];
}

export type CategoryColumn = Omit<Column, 'type'> & {
  type: ColumnType;
};
