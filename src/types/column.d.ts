
import { LucideIcon } from 'lucide-react';

export type ColumnType = 
  'text' | 'textarea' | 'number' | 'select' | 
  'radio' | 'checkbox' | 'date' | 'time' | 
  'file' | 'image' | 'email' | 'url' | 
  'tel' | 'password' | 'color' | 'range' | 
  'phone' | 'richtext';

export interface ColumnOption {
  id: string;
  label: string;
  value: string;
  description?: string;
  color?: string;
}

export interface Column {
  id: string;
  name: string;
  type: ColumnType;
  category_id: string;
  status: string;
  is_required: boolean;
  help_text?: string;
  placeholder?: string;
  default_value?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
  options?: ColumnOption[];
  validation?: Record<string, any>;
  description?: string;
  section?: string;
  color?: string;
}

export interface BasicColumnFieldsProps {
  control: any;
  categories: { id: string; name: string }[];
  columns: Column[];
  editColumn?: Column | null;
  selectedType: ColumnType;
  onTypeChange: (type: ColumnType) => void;
  isEditMode: boolean;
}

export interface ColumnFormValues {
  name: string;
  type: ColumnType;
  category_id: string;
  is_required: boolean;
  help_text: string;
  placeholder: string;
  default_value: string;
  options: ColumnOption[];
  validation: Record<string, any>;
  description: string;
  order_index: number;
  status: string;
}

export interface ColumnTypeDefinition {
  value: ColumnType;
  label: string;
  description: string;
  icon: string;
}

export const columnTypeDefinitions = [
  {
    group: "Əsas tiplar",
    types: [
      {
        value: "text",
        label: "Mətn",
        description: "Qısa mətn üçün",
        icon: "text"
      },
      {
        value: "textarea",
        label: "Mətn sahəsi",
        description: "Uzun mətn üçün",
        icon: "fileText"
      },
      {
        value: "number",
        label: "Rəqəm",
        description: "Rəqəm daxil etmək üçün",
        icon: "calculator"
      }
    ]
  },
  {
    group: "Seçim tipləri",
    types: [
      {
        value: "select",
        label: "Açılan siyahı",
        description: "Bir seçim edin",
        icon: "listFilter"
      },
      {
        value: "radio",
        label: "Radio",
        description: "Bir seçim edin",
        icon: "radioTower"
      },
      {
        value: "checkbox",
        label: "Çeklist",
        description: "Birdən çox seçim edin",
        icon: "check"
      }
    ]
  },
  {
    group: "Xüsusi tiplər",
    types: [
      {
        value: "date",
        label: "Tarix",
        description: "Tarix seçimi",
        icon: "calendar"
      },
      {
        value: "email",
        label: "E-poçt",
        description: "E-poçt ünvanı",
        icon: "mail"
      },
      {
        value: "phone",
        label: "Telefon",
        description: "Telefon nömrəsi",
        icon: "phone"
      }
    ]
  }
];
