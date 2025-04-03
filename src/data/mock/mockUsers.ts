
import { User } from '@/types/user';

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'superadmin@example.com',
    fullName: 'Super Admin',
    role: 'superadmin',
    status: 'active',
    language: 'az',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: '2',
    email: 'regionadmin@example.com',
    fullName: 'Region Admin',
    role: 'regionadmin',
    status: 'active',
    regionId: '1',
    regionName: 'Bakı',
    language: 'az',
    createdAt: '2023-01-02T00:00:00Z',
    updatedAt: '2023-01-02T00:00:00Z'
  },
  {
    id: '3',
    email: 'sectoradmin@example.com',
    fullName: 'Sector Admin',
    role: 'sectoradmin',
    status: 'active',
    regionId: '1',
    regionName: 'Bakı',
    sectorId: '1',
    sectorName: 'Binəqədi',
    language: 'az',
    createdAt: '2023-01-03T00:00:00Z',
    updatedAt: '2023-01-03T00:00:00Z'
  },
  {
    id: '4',
    email: 'school1admin@example.com',
    fullName: 'School 1 Admin',
    role: 'schooladmin',
    status: 'active',
    regionId: '1',
    regionName: 'Bakı',
    sectorId: '1',
    sectorName: 'Binəqədi',
    schoolId: '1',
    schoolName: 'Bakı şəhər 1 nömrəli məktəb',
    language: 'az',
    createdAt: '2023-01-04T00:00:00Z',
    updatedAt: '2023-01-04T00:00:00Z'
  },
  {
    id: '5',
    email: 'school2admin@example.com',
    fullName: 'School 2 Admin',
    role: 'schooladmin',
    status: 'active',
    regionId: '1',
    regionName: 'Bakı',
    sectorId: '2',
    sectorName: 'Yasamal',
    schoolId: '2',
    schoolName: 'Bakı şəhər 2 nömrəli məktəb',
    language: 'az',
    createdAt: '2023-01-05T00:00:00Z',
    updatedAt: '2023-01-05T00:00:00Z'
  }
];
