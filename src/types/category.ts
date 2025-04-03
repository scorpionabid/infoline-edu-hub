
export type Category = {
  id: string;
  name: string;
  description?: string;
  assignment: 'all' | 'sectors';  // only 'all' or 'sectors' allowed
  priority: number;
  deadline?: string | Date;
  status: string;
  columnCount?: number;  // using camelCase instead of snake_case
  order: number;  // adding the missing order property
  archived?: boolean;  // adding the missing archived property
  createdAt?: string;
  updatedAt?: string;
};

export type MockCategory = {
  id: string;
  name: string;
  description?: string;
  assignment: string;
  status: string;
  priority: number;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
  completionRate?: number;  // adding this property to fix mock data errors
};

export type CategoryFilter = {
  status?: string;
  assignment?: 'all' | 'sectors';
  search?: string;
  showArchived?: boolean;  // adding the missing property
};

// Re-export type for other modules
export type { Category as CategoryType };
