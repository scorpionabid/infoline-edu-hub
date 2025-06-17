
import { ColumnDef } from "@tanstack/react-table";

export enum DataEntryStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface Category {
  id: string;
  name: string;
  description: string;
  deadline: Date | null;
  column_count: number;
}

export interface Column {
  id: string;
  name: string;
  category_id: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  options?: string[];
  required: boolean;
  validation_rules?: string[];
}

export interface DataEntryTableData {
  columns: Column[];
  values: Record<string, any>;
}

export interface DataEntryColumn extends ColumnDef<any> {
  id: string;
  name: string;
  category_id: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  options?: string[];
  required: boolean;
  validation_rules?: string[];
}

export interface DataEntryValue {
  column_id: string;
  value: any;
}

export interface DataEntry {
  id: string;
  school_id: string;
  category_id: string;
  values: DataEntryValue[];
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  created_at: Date;
  updated_at: Date;
}

export interface School {
  id: string;
  name: string;
  address: string;
  city: string;
  region_id: string;
  sector_id: string;
  type: string;
  email: string;
  phone: string;
  website: string;
  principal: string;
  vice_principal: string;
  created_at: Date;
  updated_at: Date;
}

export interface ProxyDataEntryOptions {
  readonly: boolean;
  showValidation: boolean;
  autoSave: boolean;
  status?: string;
}

// Add missing exports
export interface DataEntryFormData {
  [columnId: string]: any;
}

export interface ValidationResult {
  valid: boolean;
  message?: string;
  errors?: Record<string, string>;
}
