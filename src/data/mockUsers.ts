
import { User } from '@/types/user';

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'superadmin@infoline.az',
    role: 'superadmin',
    name: 'SuperAdmin User',
    full_name: 'SuperAdmin User',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    status: 'active',
    created_at: '2023-01-01T00:00:00Z',
    last_sign_in_at: '2024-04-14T08:45:12Z',
    lastLogin: '2024-04-14T08:45:12Z',
    createdAt: '2023-01-01T00:00:00Z',
    language: 'az',
    twoFactorEnabled: false,
    notificationSettings: {
      email: true,
      push: true,
      sms: false,
      system: true
    }
  },
  {
    id: '2',
    email: 'regionadmin@infoline.az',
    role: 'regionadmin',
    name: 'Region Admin',
    full_name: 'Region Admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
    status: 'active',
    regionId: 'region1',
    created_at: '2023-01-02T00:00:00Z',
    last_sign_in_at: '2024-04-13T14:30:22Z',
    lastLogin: '2024-04-13T14:30:22Z',
    createdAt: '2023-01-02T00:00:00Z',
    language: 'az',
    twoFactorEnabled: false,
    notificationSettings: {
      email: true,
      push: true,
      sms: false,
      system: true
    }
  },
  {
    id: '3',
    email: 'sectoradmin@infoline.az',
    role: 'sectoradmin',
    name: 'Sector Admin',
    full_name: 'Sector Admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
    status: 'active',
    regionId: 'region1',
    sectorId: 'sector1',
    created_at: '2023-01-03T00:00:00Z',
    last_sign_in_at: '2024-04-12T11:15:45Z',
    lastLogin: '2024-04-12T11:15:45Z',
    createdAt: '2023-01-03T00:00:00Z',
    language: 'az',
    twoFactorEnabled: false,
    notificationSettings: {
      email: true,
      push: true,
      sms: false,
      system: true
    }
  },
  {
    id: '4',
    email: 'schooladmin@infoline.az',
    role: 'schooladmin',
    name: 'School Admin',
    full_name: 'School Admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
    status: 'active',
    regionId: 'region1',
    sectorId: 'sector1',
    schoolId: 'school1',
    created_at: '2023-01-04T00:00:00Z',
    last_sign_in_at: '2024-04-14T09:20:18Z',
    lastLogin: '2024-04-14T09:20:18Z',
    createdAt: '2023-01-04T00:00:00Z',
    language: 'az',
    twoFactorEnabled: false,
    notificationSettings: {
      email: true,
      push: true,
      sms: false,
      system: true
    }
  },
  {
    id: '5',
    email: 'admin2@infoline.az',
    role: 'schooladmin',
    name: 'Another School Admin',
    full_name: 'Another School Admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5',
    status: 'active',
    regionId: 'region2',
    sectorId: 'sector2',
    schoolId: 'school2',
    created_at: '2023-01-05T00:00:00Z',
    createdAt: '2023-01-05T00:00:00Z',
    updatedAt: '2023-05-10T00:00:00Z',
    language: 'az',
    twoFactorEnabled: false,
    notificationSettings: {
      email: true,
      push: true,
      sms: false,
      system: false
    }
  },
  {
    id: '6',
    email: 'inactive@infoline.az',
    role: 'schooladmin',
    name: 'Inactive User',
    full_name: 'Inactive User',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=6',
    status: 'inactive',
    regionId: 'region2',
    sectorId: 'sector2',
    schoolId: 'school3',
    created_at: '2023-01-06T00:00:00Z',
    last_sign_in_at: '2023-06-15T16:42:33Z',
    lastLogin: '2023-06-15T16:42:33Z',
    createdAt: '2023-01-06T00:00:00Z',
    language: 'az',
    twoFactorEnabled: false,
    notificationSettings: {
      email: true,
      push: true,
      sms: false,
      system: true
    }
  },
  {
    id: '7',
    email: 'newadmin@infoline.az',
    role: 'regionadmin',
    name: 'New Region Admin',
    full_name: 'New Region Admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=7',
    status: 'active',
    regionId: 'region3',
    created_at: '2023-11-10T00:00:00Z',
    last_sign_in_at: '2024-04-14T07:32:10Z',
    lastLogin: '2024-04-14T07:32:10Z',
    createdAt: '2023-11-10T00:00:00Z',
    language: 'az',
    twoFactorEnabled: true,
    notificationSettings: {
      email: true,
      push: true,
      sms: false,
      system: true
    }
  },
  {
    id: '8',
    email: 'newsectoradmin@infoline.az',
    role: 'sectoradmin',
    name: 'New Sector Admin',
    full_name: 'New Sector Admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=8',
    status: 'active',
    regionId: 'region3',
    sectorId: 'sector3',
    created_at: '2023-12-05T00:00:00Z',
    last_sign_in_at: '2024-04-13T11:45:52Z',
    lastLogin: '2024-04-13T11:45:52Z',
    createdAt: '2023-12-05T00:00:00Z',
    language: 'az',
    twoFactorEnabled: false,
    notificationSettings: {
      email: true,
      push: true,
      sms: false,
      system: true
    }
  }
];

export default mockUsers;
