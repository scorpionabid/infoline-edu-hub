
import { Json } from './supabase';

export type ColumnType = 
  'text' | 
  'number' | 
  'date' | 
  'select' | 
  'checkbox' | 
  'radio' | 
  'file' | 
  'image' | 
  'textarea' | 
  'email' | 
  'phone' | 
  'url' |
  'time';

export interface ColumnOption {
  label: string;
  value: string;
}

export interface ColumnValidation {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  email?: boolean;
  url?: boolean;
  date?: boolean;
  number?: boolean;
  integer?: boolean;
  positive?: boolean;
  message?: string;
}

export interface Column {
  id: string;
  name: string;
  type: ColumnType;
  categoryId: string;
  isRequired: boolean;
  placeholder?: string;
  helpText?: string;
  defaultValue?: string;
  orderIndex: number; // orderIndex olmalıdır, order yox
  options: string[] | ColumnOption[];
  validation?: ColumnValidation;
  status?: string;
  parentColumnId?: string;
  dependsOn?: string;
}

// Adapter funksiyası 
export function adaptDatabaseColumn(dbColumn: any): Column {
  return {
    id: dbColumn.id,
    name: dbColumn.name,
    type: dbColumn.type as ColumnType,
    categoryId: dbColumn.category_id,
    isRequired: dbColumn.is_required,
    placeholder: dbColumn.placeholder || '',
    helpText: dbColumn.help_text || '',
    defaultValue: dbColumn.default_value || '',
    orderIndex: dbColumn.order_index || 0,
    // Options və validation JSON olaraq gəlirsə, onları parse edirik
    options: parseOptions(dbColumn.options),
    validation: parseValidation(dbColumn.validation),
    status: dbColumn.status || 'active',
    parentColumnId: dbColumn.parent_column_id || '',
    dependsOn: dbColumn.depends_on || ''
  };
}

// JSON options və validation-u parse edən funksiyalar
function parseOptions(options: any): string[] | ColumnOption[] {
  if (!options) return [];
  
  if (typeof options === 'string') {
    try {
      const parsed = JSON.parse(options);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }
  
  return Array.isArray(options) ? options : [];
}

function parseValidation(validation: any): ColumnValidation | undefined {
  if (!validation) return undefined;
  
  if (typeof validation === 'string') {
    try {
      return JSON.parse(validation);
    } catch (e) {
      return undefined;
    }
  }
  
  return validation as ColumnValidation;
}
