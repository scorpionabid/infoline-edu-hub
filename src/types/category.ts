
export type CategoryStatus = 'active' | 'inactive' | 'archived';
export type CategoryAssignment = 'all' | 'sectors' | 'schools';

export interface Category {
  id: string;
  name: string;
  description?: string;
  status: CategoryStatus;
  assignment: CategoryAssignment;
  priority: number;
  archived: boolean;
  column_count: number;
  deadline?: string;
  // order xüsusiyyəti buraya əlavə etməməliyik
}

export function adaptCategoryFromDatabase(dbData: any): Category {
  return {
    id: dbData.id || '',
    name: dbData.name || '',
    description: dbData.description || '',
    status: adaptCategoryStatus(dbData.status || ''),
    assignment: adaptCategoryAssignment(dbData.assignment || ''),
    priority: dbData.priority || 0,
    archived: dbData.archived || false,
    column_count: dbData.column_count || 0,
    deadline: dbData.deadline || undefined
  };
}

// Status və Assignment adapter funksiyaları
function adaptCategoryStatus(status: string): CategoryStatus {
  switch(status.toLowerCase()) {
    case 'active':
      return 'active';
    case 'inactive':
      return 'inactive';
    case 'archived':
      return 'archived';
    default:
      return 'active';
  }
}

function adaptCategoryAssignment(assignment: string): CategoryAssignment {
  switch(assignment.toLowerCase()) {
    case 'all':
      return 'all';
    case 'sectors':
      return 'sectors';
    case 'schools':
      return 'schools';
    default:
      return 'all';
  }
}
