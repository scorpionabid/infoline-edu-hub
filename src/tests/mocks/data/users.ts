
import { FullUserData } from '@/types/supabase';

export const mockUsers: FullUserData[] = [
  {
    id: '1',
    email: 'superadmin@test.com',
    role: 'superadmin',
    status: 'active',
    full_name: 'Super Admin',
    regionId: null,
    sectorId: null,
    schoolId: null,
    language: 'az',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    email: 'regionadmin@test.com',
    role: 'regionadmin',
    status: 'active',
    full_name: 'Region Admin',
    regionId: 'region1',
    sectorId: null,
    schoolId: null,
    language: 'az',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    email: 'sectoradmin@test.com',
    role: 'sectoradmin',
    status: 'active',
    full_name: 'Sector Admin',
    regionId: 'region1',
    sectorId: 'sector1',
    schoolId: null,
    language: 'az',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    email: 'schooladmin@test.com',
    role: 'schooladmin',
    status: 'active',
    full_name: 'School Admin',
    regionId: 'region1',
    sectorId: 'sector1',
    schoolId: 'school1',
    language: 'az',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];
