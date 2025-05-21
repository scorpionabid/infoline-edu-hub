
import { BaseEntity } from './index';
import { Column } from './column';

/**
 * Core Category type definitions
 */

export type CategoryStatus = 'active' | 'inactive' | 'archived' | 'draft' | 'approved' | 'pending';
export type CategoryAssignment = 'all' | 'sectors' | 'schools' | 'regions';

// Base category interface - core properties
export interface BaseCategory extends BaseEntity {
  name: string;
  status?: CategoryStatus;
}

// Complete category interface with all fields
export interface Category extends BaseCategory {
  description?: string;
  deadline?: string | Date;
  status?: CategoryStatus;
  priority?: number;
  archived?: boolean;
  column_count?: number;
  assignment?: CategoryAssignment;
  completion_rate?: number;
}

// Category with related columns
export interface CategoryWithColumns extends Category {
  columns: Column[];
}

// Form data for creating/editing categories
export interface CategoryFormData {
  name: string;
  description?: string;
  deadline?: string | Date | null;
  status?: CategoryStatus;
  assignment?: CategoryAssignment;
  priority?: number;
}

// Filter for searching/filtering categories
export interface CategoryFilter {
  search: string;
  status: CategoryStatus | string | null;
  assignment: CategoryAssignment | string | null;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Helper function to format deadline for API
export function formatDeadlineForApi(deadline: Date | string | null | undefined): string | null {
  if (!deadline) return null;
  if (deadline instanceof Date) return deadline.toISOString();
  return deadline;
}
