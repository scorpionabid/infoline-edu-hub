
export type ColumnType = 'text' | 'textarea' | 'number' | 'date' | 'select' | 
  'checkbox' | 'radio' | 'file' | 'email' | 'phone' | 'color' | 'tel' | 
  'url' | 'password' | 'range' | 'textarea' | 'multiselect' | 'richtext' | 'datetime';

export interface ColumnOption {
  id: string;
  label: string;
  value: string;
}

export interface Column {
  id: string;
  name: string;
  type: ColumnType;
  category_id?: string;
  is_required?: boolean;
  help_text?: string;
  placeholder?: string;
  default_value?: string;
  options?: ColumnOption[];
  validation?: Record<string, any>;
  status?: string;
  order_index?: number;
  created_at: string;
  updated_at: string;
  description?: string;
}

export interface CategoryWithColumns {
  id: string;
  name: string;
  description?: string;
  status?: string;
  columns: Column[];
}

export interface ColumnFormValues {
  name: string;
  type: ColumnType;
  category_id: string;
  is_required?: boolean;
  help_text?: string;
  placeholder?: string;
  default_value?: string;
  options?: ColumnOption[];
  validation?: Record<string, any>;
  status?: string;
  description?: string;
  order_index?: number;
}

export const columnTypeDefinitions = [
  {
    group: "Basic",
    types: [
      {
        value: "text",
        label: "Text",
        description: "Simple text input",
        icon: "TextIcon"
      },
      {
        value: "textarea",
        label: "Text Area",
        description: "Multi-line text input",
        icon: "AlignLeft"
      },
      {
        value: "number",
        label: "Number",
        description: "Numeric input only",
        icon: "Hash"
      }
    ]
  },
  {
    group: "Selection",
    types: [
      {
        value: "select",
        label: "Select",
        description: "Dropdown selection",
        icon: "List"
      },
      {
        value: "checkbox",
        label: "Checkbox",
        description: "True/false selection",
        icon: "CheckSquare"
      },
      {
        value: "radio",
        label: "Radio",
        description: "Single option selection",
        icon: "Circle"
      }
    ]
  },
  {
    group: "Date & Time",
    types: [
      {
        value: "date",
        label: "Date",
        description: "Date picker",
        icon: "Calendar"
      },
      {
        value: "datetime",
        label: "Date & Time",
        description: "Date and time picker",
        icon: "Clock"
      }
    ]
  }
];

export const columnTypes = Object.values(columnTypeDefinitions)
  .flatMap(group => group.types.map(type => type.value)) as ColumnType[];
