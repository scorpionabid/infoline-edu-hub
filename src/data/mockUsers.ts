
import { User } from '@/types/user';

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@infoline.edu.az',
    full_name: 'Sistem Admin',
    role: 'superadmin',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T12:00:00Z',
    region_id: null,
    sector_id: null,
    school_id: null
  },
  {
    id: '2', 
    email: 'region.admin@infoline.edu.az',
    full_name: 'Rayon Admin',
    role: 'regionadmin',
    status: 'active', 
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-14T10:30:00Z',
    region_id: 'region_1',
    sector_id: null,
    school_id: null
  },
  {
    id: '3',
    email: 'sector.admin@infoline.edu.az', 
    full_name: 'Sektor Admin',
    role: 'sectoradmin',
    status: 'active',
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-13T16:45:00Z',
    region_id: 'region_1',
    sector_id: 'sector_1', 
    school_id: null
  },
  {
    id: '4',
    email: 'school.admin@infoline.edu.az',
    full_name: 'Məktəb Admin',
    role: 'schooladmin',
    status: 'inactive',
    created_at: '2024-01-04T00:00:00Z',
    updated_at: '2024-01-12T14:20:00Z',
    region_id: 'region_1',
    sector_id: 'sector_1',
    school_id: 'school_1'
  },
  {
    id: '5',
    email: 'school.user@infoline.edu.az',
    full_name: 'Məktəb İstifadəçisi',
    role: 'schooluser',
    status: 'active',
    created_at: '2024-01-05T00:00:00Z', 
    updated_at: '2024-01-11T09:15:00Z',
    region_id: 'region_1',
    sector_id: 'sector_1',
    school_id: 'school_1'
  }
];
