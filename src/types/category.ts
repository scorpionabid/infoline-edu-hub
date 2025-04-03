
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
  order: number;  
}

export type CategoryWithOrder = Category & {
  order: number;
}

export type MockCategory = {
  id: string;
  name: string;
  assignment: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  priority: number;
  completionRate: number;
  deadline: string;
}

// Supabase tiplərini uyğunlaşdırmaq üçün adaptor funksiyaları
export const adaptSupabaseCategory = (rawData: any): Category => {
  return {
    id: rawData.id,
    name: rawData.name,
    description: rawData.description || "",
    assignment: rawData.assignment as CategoryAssignment,
    deadline: rawData.deadline,
    status: rawData.status || "active",
    archived: rawData.archived || false,
    priority: rawData.priority || 1,
    order: rawData.order || rawData.priority || 1,
    columnCount: rawData.column_count || 0,
    createdAt: rawData.created_at,
    updatedAt: rawData.updated_at,
  };
};

// Category Filtirləmə interfeysi
export interface CategoryFilter {
  search: string;
  status: string;
  assignment: string;
  withDeadline: boolean;
  showArchived: boolean;
}
