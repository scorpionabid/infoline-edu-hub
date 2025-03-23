
export type ColumnType = 
  | "text"
  | "number"
  | "date"
  | "select"
  | "checkbox"
  | "radio"
  | "file"
  | "image"
  | "email"  
  | "phone"  
  | "boolean"
  | "textarea";  // Əlavə olundu

export type ColumnOption = {
  label: string;
  value: string;
};

export type Column = {
  id: string;
  categoryId: string;
  name: string;
  type: ColumnType;
  isRequired: boolean;
  validationRules?: {
    minValue?: number;
    maxValue?: number;
    format?: string;
    regex?: string;
    // Yeni validasiya xüsusiyyətləri
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    patternError?: string;
    minDate?: string; // Tipi string kimi müəyyən edilir
    maxDate?: string; // Tipi string kimi müəyyən edilir
    warningThreshold?: {
      min?: number;
      max?: number;
    };
  };
  defaultValue?: string;
  options?: ColumnOption[] | string[]; // for select, checkbox, radio types
  placeholder?: string;
  helpText?: string;
  description?: string; // Əlavə edildi
  deadline?: string;
  order: number;
  parentColumnId?: string;
  conditionalDisplay?: {
    columnId: string;
    value: string;
  };
  // Asılılıq xüsusiyyəti
  dependsOn?: {
    columnId: string;
    condition?: {
      type: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan';
      value: string | number;
    }
  };
  status: "active" | "inactive";
  multiline?: boolean; // Əlavə edildi: çoxsətirli mətn sahələri üçün
};

export type CategoryWithColumns = {
  id: string;
  name: string;
  description?: string; // Əlavə edildi: kateqoriya təsviri
  deadline?: string; // Əlavə edildi: kateqoriya son tarixi
  assignment?: "all" | "sectors"; // Əlavə edildi: təyinat tipi
  columns: Column[];
  status?: "active" | "inactive"; // Əlavə edildi: status
  createdAt?: string; // Əlavə edildi: yaradılma tarixi
  priority?: number; // Əlavə edildi: prioritet xüsusiyyəti
};
