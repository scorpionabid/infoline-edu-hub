
import { Category } from '@/types/category';

export const mockCategories: Category[] = [
  {
    id: 'cat1',
    name: 'Ümumi məlumatlar',
    description: 'Məktəblər haqqında ümumi məlumatlar',
    assignment: 'all',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    priority: 1,
    column_count: 5
  },
  {
    id: 'cat2',
    name: 'Şagird statistikası',
    description: 'Şagird sayı və statistikası',
    assignment: 'sectors',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    priority: 2,
    column_count: 3
  },
  {
    id: 'cat3',
    name: 'Müəllim statistikası',
    description: 'Müəllim sayı və statistikası',
    assignment: 'sectors',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    priority: 3,
    column_count: 4
  }
];
