
export type ColumnType = 
  | "text"
  | "number"
  | "date"
  | "select"
  | "checkbox"
  | "radio"
  | "file"
  | "image";

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
  };
  defaultValue?: string;
  options?: string[]; // for select, checkbox, radio types
  placeholder?: string;
  helpText?: string;
  deadline?: string;
  order: number;
  parentColumnId?: string;
  conditionalDisplay?: {
    columnId: string;
    value: string;
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
};
