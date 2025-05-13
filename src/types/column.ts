
import { Json } from '@/types/supabase';

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
import { FileText, Hash, Calendar, ListChecks, Layers, AlignLeft, File, Mail, Globe, Phone, Lock, CheckSquare, CircleDot, SlidersHorizontal, Palette, Heading, Watch } from 'lucide-react';
import React from 'react';

export const columnTypeDefinitions: Record<ColumnType, {
  label: string;
  description: string;
  icon: React.ReactNode;
}> = {
  text: {
    label: 'Text',
    description: 'Single line of text',
    icon: <FileText className="h-4 w-4" />
  },
  number: {
    label: 'Number',
    description: 'Numeric values only',
    icon: <Hash className="h-4 w-4" />
  },
  boolean: {
    label: 'Boolean',
    description: 'Yes/No value',
    icon: <CheckSquare className="h-4 w-4" />
  },
  date: {
    label: 'Date',
    description: 'Date selection',
    icon: <Calendar className="h-4 w-4" />
  },
  datetime: {
    label: 'Date & Time',
    description: 'Date and time selection',
    icon: <Watch className="h-4 w-4" />
  },
  select: {
    label: 'Select',
    description: 'Single selection from options',
    icon: <ListChecks className="h-4 w-4" />
  },
  multiselect: {
    label: 'Multi-select',
    description: 'Multiple selections from options',
    icon: <Layers className="h-4 w-4" />
  },
  textarea: {
    label: 'Text Area',
    description: 'Multiple lines of text',
    icon: <AlignLeft className="h-4 w-4" />
  },
  file: {
    label: 'File Upload',
    description: 'Document or image upload',
    icon: <File className="h-4 w-4" />
  },
  email: {
    label: 'Email',
    description: 'Email address field',
    icon: <Mail className="h-4 w-4" />
  },
  url: {
    label: 'URL',
    description: 'Web address field',
    icon: <Globe className="h-4 w-4" />
  },
  tel: {
    label: 'Telephone',
    description: 'Phone number field',
    icon: <Phone className="h-4 w-4" />
  },
  phone: {
    label: 'Phone',
    description: 'Phone number field with formatting',
    icon: <Phone className="h-4 w-4" />
  },
  password: {
    label: 'Password',
    description: 'Secure password field',
    icon: <Lock className="h-4 w-4" />
  },
  checkbox: {
    label: 'Checkboxes',
    description: 'Multiple checkboxes',
    icon: <CheckSquare className="h-4 w-4" />
  },
  radio: {
    label: 'Radio Buttons',
    description: 'Single selection radio buttons',
    icon: <CircleDot className="h-4 w-4" />
  },
  range: {
    label: 'Range Slider',
    description: 'Slider for range selection',
    icon: <SlidersHorizontal className="h-4 w-4" />
  },
  color: {
    label: 'Color Picker',
    description: 'Color selection field',
    icon: <Palette className="h-4 w-4" />
  },
  richtext: {
    label: 'Rich Text',
    description: 'Formatted text editor',
    icon: <Heading className="h-4 w-4" />
  }
};
