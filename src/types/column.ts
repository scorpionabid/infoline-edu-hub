
import { Json } from '@/types/supabase';
import * as React from 'react';
import { FileText, Hash, Calendar, ListChecks, Layers, AlignLeft, File, Mail, Globe, Phone, Lock, CheckSquare, CircleDot, SlidersHorizontal, Palette, Heading, Watch } from 'lucide-react';

export interface ColumnOption {
  id: string;
  value: string;
  label: string;
  color?: string;
}

export interface Column {
  id: string;
  name: string;
  category_id: string;
  type: ColumnType;
  options: Json | ColumnOption[];
  is_required: boolean;
  status: string;
  order_index: number;
  placeholder: string;
  help_text: string;
  default_value: string;
  validation: Json;
  created_at: string;
  updated_at: string;
  description?: string;
  color?: string;
  parent_column_id?: string;
  version?: number;
}

export interface ColumnFormData {
  name: string;
  type: ColumnType;
  options?: ColumnOption[];
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  default_value?: string;
  validation?: Record<string, any>;
  description?: string;
  color?: string;
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
  status: string;
  description: string;
  order_index: number;
}

export interface CategoryWithColumns {
  id: string;
  name: string;
  columns: Column[];
}

export type ColumnType = 'text' | 'number' | 'boolean' | 'date' | 'select' | 'multiselect' | 'textarea' | 'file' | 'email' | 'url' | 'tel' | 'password' | 'checkbox' | 'radio' | 'range' | 'color' | 'richtext' | 'phone' | 'datetime';

export const columnTypes = [
  'text',
  'number',
  'boolean',
  'date',
  'select',
  'multiselect',
  'textarea',
  'file',
  'email',
  'url',
  'tel',
  'password',
  'checkbox',
  'radio',
  'range',
  'color',
  'richtext',
  'phone',
  'datetime'
] as const;

// Define column type definitions with icons and descriptions
export type ColumnTypeDefinition = {
  label: string;
  description: string;
  icon: React.ReactNode;
};

export const columnTypeDefinitions: Record<ColumnType, ColumnTypeDefinition> = {
  text: {
    label: 'Text',
    description: 'Single line of text',
    icon: React.createElement(FileText, { className: "h-4 w-4" })
  },
  number: {
    label: 'Number',
    description: 'Numeric values only',
    icon: React.createElement(Hash, { className: "h-4 w-4" })
  },
  boolean: {
    label: 'Boolean',
    description: 'Yes/No value',
    icon: React.createElement(CheckSquare, { className: "h-4 w-4" })
  },
  date: {
    label: 'Date',
    description: 'Date selection',
    icon: React.createElement(Calendar, { className: "h-4 w-4" })
  },
  datetime: {
    label: 'Date & Time',
    description: 'Date and time selection',
    icon: React.createElement(Watch, { className: "h-4 w-4" })
  },
  select: {
    label: 'Select',
    description: 'Single selection from options',
    icon: React.createElement(ListChecks, { className: "h-4 w-4" })
  },
  multiselect: {
    label: 'Multi-select',
    description: 'Multiple selections from options',
    icon: React.createElement(Layers, { className: "h-4 w-4" })
  },
  textarea: {
    label: 'Text Area',
    description: 'Multiple lines of text',
    icon: React.createElement(AlignLeft, { className: "h-4 w-4" })
  },
  file: {
    label: 'File Upload',
    description: 'Document or image upload',
    icon: React.createElement(File, { className: "h-4 w-4" })
  },
  email: {
    label: 'Email',
    description: 'Email address field',
    icon: React.createElement(Mail, { className: "h-4 w-4" })
  },
  url: {
    label: 'URL',
    description: 'Web address field',
    icon: React.createElement(Globe, { className: "h-4 w-4" })
  },
  tel: {
    label: 'Telephone',
    description: 'Phone number field',
    icon: React.createElement(Phone, { className: "h-4 w-4" })
  },
  phone: {
    label: 'Phone',
    description: 'Phone number field with formatting',
    icon: React.createElement(Phone, { className: "h-4 w-4" })
  },
  password: {
    label: 'Password',
    description: 'Secure password field',
    icon: React.createElement(Lock, { className: "h-4 w-4" })
  },
  checkbox: {
    label: 'Checkboxes',
    description: 'Multiple checkboxes',
    icon: React.createElement(CheckSquare, { className: "h-4 w-4" })
  },
  radio: {
    label: 'Radio Buttons',
    description: 'Single selection radio buttons',
    icon: React.createElement(CircleDot, { className: "h-4 w-4" })
  },
  range: {
    label: 'Range Slider',
    description: 'Slider for range selection',
    icon: React.createElement(SlidersHorizontal, { className: "h-4 w-4" })
  },
  color: {
    label: 'Color Picker',
    description: 'Color selection field',
    icon: React.createElement(Palette, { className: "h-4 w-4" })
  },
  richtext: {
    label: 'Rich Text',
    description: 'Formatted text editor',
    icon: React.createElement(Heading, { className: "h-4 w-4" })
  }
};

export interface ColumnValidation {
  [key: string]: any;
}
