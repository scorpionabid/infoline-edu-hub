
import { Column } from './column';

export interface DataEntryTableData {
  columns: Column[];
  values: Record<string, any>;
  categoryId: string;
  schoolId?: string;
  sectorId?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface DataEntryFormData {
  categoryId: string;
  schoolId?: string;
  sectorId?: string;
  values: Record<string, any>;
  status?: 'draft' | 'pending' | 'approved' | 'rejected';
}

export interface DataEntryStatus {
  categoryId: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  completedFields: number;
  totalFields: number;
  lastUpdated: string;
}

export interface DataEntryProgress {
  completed: number;
  total: number;
  percentage: number;
}
