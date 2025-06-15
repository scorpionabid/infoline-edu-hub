export interface Category {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description: string;
  assignment: 'all' | 'schools' | 'sectors' | 'regions';
  status: 'active' | 'inactive';
  priority: number;
  deadline: string;
  order_index: number;
}

export interface AddCategoryFormData {
  name: string;
  description: string;
  assignment: 'all' | 'schools' | 'sectors' | 'regions';
  status: 'active' | 'inactive';
  priority: number;
  deadline: string | Date;
  order_index?: number; // Added this field
}

export const formatDeadlineForApi = (deadline: string | Date): string => {
  if (typeof deadline === 'string') {
    return deadline;
  }
  return deadline.toISOString();
};
