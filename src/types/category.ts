
export type CategoryAssignment = "all" | "sectors";
export type CategoryStatus = "active" | "inactive" | "archived";

export interface Category {
  id: string;
  name: string;
  description?: string;
  assignment: CategoryAssignment;
  deadline?: string | Date;
  status: string;
  archived?: boolean;
  priority: number;
  order: number;  // Bu məcburi sahədir
  columnCount?: number;
  createdAt?: string;
  updatedAt?: string;
  // Supabase ilə uyğunluq üçün
  created_at?: string;
  updated_at?: string;
  column_count?: number;
}

export interface CategoryListItem {
  id: string;
  name: string;
  status: string;
  assignment: CategoryAssignment;
  deadline?: string;
  columnCount: number;
  order: number;  // Əlavə edildi
}
