
import { z } from "zod";

// Kateqoriya statusları
export type CategoryStatus = 'active' | 'inactive' | 'draft';

// Təyinat tipi
export type AssignmentType = 'all' | 'sectors' | 'schools';

// Form statusu
export type FormStatus = 'pending' | 'approved' | 'rejected' | 'draft';

// Kateqoriya
export interface Category {
  id: string;
  name: string;
  description?: string;
  status: CategoryStatus;
  assignment: AssignmentType;
  deadline?: Date;
  priority?: number;
  archived?: boolean;
  column_count?: number;
  created_at: Date;
  updated_at: Date;
}

// Sütunları olan Kateqoriya
export interface CategoryWithColumns extends Category {
  columns: Column[];
}

// Schema validation
export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive', 'draft']),
  assignment: z.enum(['all', 'sectors', 'schools']),
  deadline: z.date().optional(),
  priority: z.number().optional(),
  archived: z.boolean().optional(),
  column_count: z.number().optional(),
  created_at: z.date(),
  updated_at: z.date()
});
