
import { Json } from './supabase';
import { Category } from './category';

export type Column = {
  id: string;
  categoryId: string;
  name: string;
  type: string;
  isRequired: boolean;
  defaultValue?: string;
  placeholder?: string;
  helpText?: string;
  options?: string[] | { label: string; value: string }[];  // Allow both string[] or object[] for options
  status: string;
  order: number;
  orderIndex: number;  // Add this missing property
  validation?: any;
};

export type CategoryWithColumns = Category & {
  columns: Column[];
};

export { Category } from './category';
