export type ColumnType =
  | "text"
  | "number"
  | "date"
  | "email"
  | "url"
  | "tel"
  | "select"
  | "radio"
  | "checkbox"
  | "textarea"
  | "file"
  | "location"
  | "phone";

export interface ColumnOption {
  id?: string;
  label: string;
  value: string;
}

export type ValidationType = "required" | "minLength" | "maxLength" | "pattern";

export interface ColumnFormValues {
  name: string;
  type: string;
  category_id: string;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  default_value?: string;
  description?: string;
  section?: string;
  validation?: any;
  options?: ColumnOption[];
  order_index?: number;
}

export interface Column {
  id: string;
  category_id: string;
  name: string;
  type: ColumnType;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  order_index: number;
  status: string;
  validation?: any;
  default_value?: string;
  options?: ColumnOption[];
  created_at: string;
  updated_at: string;
  description?: string;
  section?: string;
  color?: string;
}
