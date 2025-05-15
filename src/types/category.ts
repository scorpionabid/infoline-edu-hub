
export type CategoryStatus = 'active' | 'inactive' | 'archived';
export type CategoryAssignment = 'all' | 'region' | 'sector' | 'school';

export interface Category {
  id: string;
  name: string;
  description?: string;
  status: CategoryStatus;
  priority?: number;
  deadline?: string | null;
  column_count?: number;
  archived?: boolean;
  assignment?: CategoryAssignment;
  created_at: string;
  updated_at: string;
}

export interface CategoryFilter {
  status?: CategoryStatus[];
  assignment?: CategoryAssignment[];
  archived?: boolean;
  search?: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
}

export interface ExtendedCategoryFilter extends CategoryFilter {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}
