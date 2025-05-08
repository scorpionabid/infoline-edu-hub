
// Əgər bu fayl mövcud deyilsə, onu yaradaq
export interface ValidationRules {
  required?: boolean;
  min?: number; // minimum dəyər
  max?: number; // maksimum dəyər
  minLength?: number; // minimum simvol sayı
  maxLength?: number; // maksimum simvol sayı
  pattern?: string; // regex paterni
  email?: boolean; // email validasiyası
  url?: boolean; // URL validasiyası
  numeric?: boolean; // rəqəm validasiyası
  integer?: boolean; // tam rəqəm validasiyası
  date?: boolean; // tarix validasiyası
  custom?: string; // xüsusi validasiya
  minValue?: number; // minimum dəyər - əlavə edildi (data/mockCategories.ts faylını dəstəkləmək üçün)
}

export interface ColumnOption {
  id: string;
  label: string;
  value: string;
}

export interface Column {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'file' | 'image' | 'textarea' | 'email' | 'url' | 'tel' | 'password' | string;
  category_id: string;
  is_required?: boolean;
  order_index?: number;
  options?: ColumnOption[];
  help_text?: string;
  placeholder?: string;
  default_value?: string | number | boolean;
  validation?: ValidationRules;
  status?: 'active' | 'inactive' | string;
  created_at?: string;
  updated_at?: string;
}

export interface ColumnFormData {
  name: string;
  type: string;
  category_id?: string;
  is_required: boolean;
  order_index?: number;
  options?: ColumnOption[];
  help_text?: string;
  placeholder?: string;
  default_value?: string | number | boolean;
  validation?: ValidationRules;
}
