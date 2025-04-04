
import { v4 as uuidv4 } from 'uuid';
import { Category } from '@/types/category';

// Mock kateqoriyalar
export const mockCategories: Category[] = [
  {
    id: uuidv4(),
    name: 'Məktəb məlumatları',
    description: 'Məktəblə bağlı əsas məlumatlar',
    status: 'active',
    assignment: 'all',
    priority: 1,
    archived: false,
    column_count: 5
  },
  {
    id: uuidv4(),
    name: 'Təhsil müəssisəsinin fəaliyyəti',
    description: 'Təhsil müəssisəsinin fəaliyyəti ilə bağlı məlumatlar',
    status: 'active',
    assignment: 'all',
    priority: 2,
    archived: false,
    column_count: 8
  },
  {
    id: uuidv4(),
    name: 'İnfrastruktur',
    description: 'Məktəb infrastrukturu haqqında məlumatlar',
    status: 'active',
    assignment: 'sectors',
    priority: 3,
    archived: false,
    column_count: 10
  },
  {
    id: uuidv4(),
    name: 'Şagird kontingenti',
    description: 'Şagird kontingenti haqqında məlumatlar',
    status: 'inactive',
    assignment: 'all',
    priority: 4,
    archived: false,
    column_count: 6
  }
];
