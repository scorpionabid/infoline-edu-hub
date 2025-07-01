import { School } from '@/types/school';
import { FilterOptions, SortOptions } from '@/hooks/common/useEnhancedPagination';

// School-specific filter function
export const filterSchools = (school: School, filters: FilterOptions): boolean => {
  // Search filter (name, principal_name, email)
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    const searchableFields = [
      school.name,
      school.principal_name,
      school.email,
      school.address
    ].filter(Boolean);
    
    const matchesSearch = searchableFields.some(field => 
      field?.toLowerCase().includes(searchTerm)
    );
    
    if (!matchesSearch) return false;
  }

  // Region filter
  if (filters.regionId && filters.regionId !== '') {
    if (school.region_id !== filters.regionId) return false;
  }

  // Sector filter
  if (filters.sectorId && filters.sectorId !== '') {
    if (school.sector_id !== filters.sectorId) return false;
  }

  // Status filter
  if (filters.status && filters.status !== '') {
    if (school.status !== filters.status) return false;
  }

  return true;
};

// School-specific sort function
export const sortSchools = (
  a: School, 
  b: School, 
  sortOptions: SortOptions,
  regionNames: Record<string, string> = {},
  sectorNames: Record<string, string> = {},
  adminMap: Record<string, string> = {}
): number => {
  if (!sortOptions.field || !sortOptions.direction) return 0;

  let aValue: string = '';
  let bValue: string = '';

  switch (sortOptions.field) {
    case 'name':
      aValue = a.name || '';
      bValue = b.name || '';
      break;
    case 'region':
      aValue = regionNames[a.region_id] || '';
      bValue = regionNames[b.region_id] || '';
      break;
    case 'sector':
      aValue = sectorNames[a.sector_id] || '';
      bValue = sectorNames[b.sector_id] || '';
      break;
    case 'admin':
      aValue = adminMap[a.id] || '';
      bValue = adminMap[b.id] || '';
      break;
    case 'email':
      aValue = a.email || '';
      bValue = b.email || '';
      break;
    case 'principal_name':
      aValue = a.principal_name || '';
      bValue = b.principal_name || '';
      break;
    case 'address':
      aValue = a.address || '';
      bValue = b.address || '';
      break;
    case 'student_count':
      return sortOptions.direction === 'asc' 
        ? (a.student_count || 0) - (b.student_count || 0)
        : (b.student_count || 0) - (a.student_count || 0);
    case 'teacher_count':
      return sortOptions.direction === 'asc' 
        ? (a.teacher_count || 0) - (b.teacher_count || 0)
        : (b.teacher_count || 0) - (a.teacher_count || 0);
    case 'completion_rate':
      return sortOptions.direction === 'asc' 
        ? (a.completion_rate || 0) - (b.completion_rate || 0)
        : (b.completion_rate || 0) - (a.completion_rate || 0);
    case 'created_at':
      const aDate = new Date(a.created_at || 0).getTime();
      const bDate = new Date(b.created_at || 0).getTime();
      return sortOptions.direction === 'asc' ? aDate - bDate : bDate - aDate;
    default:
      return 0;
  }

  // String comparison with proper locale support
  const comparison = aValue.localeCompare(bValue, 'az', { 
    sensitivity: 'base',
    numeric: true 
  });

  return sortOptions.direction === 'asc' ? comparison : -comparison;
};

// Helper function to get sortable fields
export const getSortableFields = () => [
  { value: 'name', label: 'Məktəb Adı' },
  { value: 'region', label: 'Region' },
  { value: 'sector', label: 'Sektor' },
  { value: 'admin', label: 'Admin' },
  { value: 'email', label: 'Email' },
  { value: 'principal_name', label: 'Direktor' },
  { value: 'address', label: 'Ünvan' },
  { value: 'student_count', label: 'Şagird sayı' },
  { value: 'teacher_count', label: 'Müəllim sayı' },
  { value: 'completion_rate', label: 'Tamamlanma faizi' },
  { value: 'created_at', label: 'Yaradılma tarixi' }
];

// Helper function to get filterable statuses
export const getFilterableStatuses = () => [
  { value: 'ALL_STATUSES', label: 'Bütün statuslar' },
  { value: 'active', label: 'Aktiv' },
  { value: 'inactive', label: 'Deaktiv' },
  { value: 'pending', label: 'Gözləyən' }
];