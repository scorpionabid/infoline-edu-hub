
import { MockCategory } from '@/types/category';

// Kategoriyaların siyahısı
export const mockCategories: MockCategory[] = [
  {
    id: 'cat-1',
    name: 'Ümumi məlumat',
    assignment: 'All',
    status: 'active',
    createdAt: '2023-01-15',
    updatedAt: '2023-02-10',
    priority: 1,
    completionRate: 78,
    deadline: '2023-12-25'
  },
  {
    id: 'cat-2',
    name: 'Müəllim heyəti',
    assignment: 'All',
    status: 'active',
    createdAt: '2023-01-16',
    updatedAt: '2023-03-05',
    priority: 2,
    completionRate: 65,
    deadline: '2023-12-20'
  },
  {
    id: 'cat-3',
    name: 'Şagirdlər',
    assignment: 'All',
    status: 'active',
    createdAt: '2023-01-17',
    updatedAt: '2023-02-20',
    priority: 3,
    completionRate: 82,
    deadline: '2023-12-15'
  },
  {
    id: 'cat-4',
    name: 'Texniki baza',
    assignment: 'All',
    status: 'active',
    createdAt: '2023-01-18',
    updatedAt: '2023-04-15',
    priority: 4,
    completionRate: 59,
    deadline: '2023-12-30'
  },
  {
    id: 'cat-5',
    name: 'Maliyyə',
    assignment: 'Sectors',
    status: 'active',
    createdAt: '2023-01-19',
    updatedAt: '2023-03-25',
    priority: 5,
    completionRate: 45,
    deadline: '2024-01-10'
  },
  {
    id: 'cat-6',
    name: 'Tədris planı',
    assignment: 'All',
    status: 'active',
    createdAt: '2023-01-20',
    updatedAt: '2023-04-10',
    priority: 6,
    completionRate: 91,
    deadline: '2024-01-15'
  },
  {
    id: 'cat-7',
    name: 'İnfrastruktur',
    assignment: 'All',
    status: 'inactive',
    createdAt: '2023-01-21',
    updatedAt: '2023-04-05',
    priority: 7,
    completionRate: 38,
    deadline: '2023-12-10'
  },
  {
    id: 'cat-8',
    name: 'İmtahan nəticələri',
    assignment: 'All',
    status: 'active',
    createdAt: '2023-01-22',
    updatedAt: '2023-05-01',
    priority: 8,
    completionRate: 73,
    deadline: '2024-01-20'
  }
];
