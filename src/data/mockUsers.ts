
import { User } from '@/types/user';

export const mockUsers: User[] = [
  {
    id: 'superadmin-1',
    name: 'Super Admin',
    full_name: 'Super Admin',
    email: 'superadmin@infoline.edu',
    role: 'superadmin',
    status: 'active',
    avatar: '',
    lastLogin: '2023-10-15T08:30:00',
    twoFactorEnabled: true,
    language: 'az',
    notificationSettings: {
      email: true,
      system: true
    },
    createdAt: '2023-01-01T00:00:00',
    updatedAt: '2023-01-01T00:00:00'
  },
  {
    id: 'regionadmin-1',
    name: 'Bakı Region Admini',
    full_name: 'Bakı Region Admini',
    email: 'bakuadmin@infoline.edu',
    role: 'regionadmin',
    regionId: 'region-1',
    status: 'active',
    avatar: '',
    lastLogin: '2023-10-14T14:22:00',
    twoFactorEnabled: false,
    language: 'az',
    notificationSettings: {
      email: true,
      system: true
    },
    createdAt: '2023-01-05T00:00:00',
    updatedAt: '2023-05-12T00:00:00'
  },
  {
    id: 'regionadmin-2',
    name: 'Gəncə Region Admini',
    full_name: 'Gəncə Region Admini',
    email: 'ganja@infoline.edu',
    role: 'regionadmin',
    regionId: 'region-2',
    status: 'active',
    avatar: '',
    lastLogin: '2023-10-10T09:15:00',
    twoFactorEnabled: false,
    language: 'az',
    notificationSettings: {
      email: true,
      system: false
    },
    createdAt: '2023-02-15T00:00:00',
    updatedAt: '2023-08-02T00:00:00'
  },
  {
    id: 'sectoradmin-1',
    name: 'Yasamal Sektor Admini',
    full_name: 'Yasamal Sektor Admini',
    email: 'yasamal@infoline.edu',
    role: 'sectoradmin',
    regionId: 'region-1',
    sectorId: 'sector-1',
    status: 'active',
    avatar: '',
    lastLogin: '2023-10-12T11:45:00',
    twoFactorEnabled: false,
    language: 'az',
    notificationSettings: {
      email: false,
      system: true
    },
    createdAt: '2023-03-10T00:00:00',
    updatedAt: '2023-09-05T00:00:00'
  },
  {
    id: 'sectoradmin-2',
    name: 'Nəsimi Sektor Admini',
    full_name: 'Nəsimi Sektor Admini',
    email: 'nasimi@infoline.edu',
    role: 'sectoradmin',
    regionId: 'region-1',
    sectorId: 'sector-2',
    status: 'inactive',
    avatar: '',
    twoFactorEnabled: false,
    language: 'ru',
    notificationSettings: {
      email: true,
      system: true
    },
    createdAt: '2023-03-15T00:00:00',
    updatedAt: '2023-07-20T00:00:00'
  },
  {
    id: 'schooladmin-1',
    name: 'Məktəb 45 Admini',
    full_name: 'Məktəb 45 Admini',
    email: 'school45@infoline.edu',
    role: 'schooladmin',
    regionId: 'region-1',
    sectorId: 'sector-1',
    schoolId: 'school-1',
    status: 'active',
    avatar: '',
    lastLogin: '2023-10-15T08:15:00',
    twoFactorEnabled: false,
    language: 'az',
    notificationSettings: {
      email: true,
      system: true
    },
    createdAt: '2023-04-01T00:00:00',
    updatedAt: '2023-10-01T00:00:00'
  },
  {
    id: 'schooladmin-2',
    name: 'Məktəb 153 Admini',
    full_name: 'Məktəb 153 Admini',
    email: 'school153@infoline.edu',
    role: 'schooladmin',
    regionId: 'region-1',
    sectorId: 'sector-1',
    schoolId: 'school-2',
    status: 'blocked',
    avatar: '',
    lastLogin: '2023-09-01T10:30:00',
    twoFactorEnabled: false,
    language: 'en',
    notificationSettings: {
      email: false,
      system: false
    },
    createdAt: '2023-04-15T00:00:00',
    updatedAt: '2023-09-01T00:00:00'
  },
  {
    id: 'schooladmin-3',
    name: 'Məktəb 23 Admini',
    full_name: 'Məktəb 23 Admini',
    email: 'school23@infoline.edu',
    role: 'schooladmin',
    regionId: 'region-1',
    sectorId: 'sector-2',
    schoolId: 'school-3',
    status: 'active',
    avatar: '',
    lastLogin: '2023-10-14T12:00:00',
    twoFactorEnabled: true,
    language: 'az',
    notificationSettings: {
      email: true,
      system: true
    },
    createdAt: '2023-05-01T00:00:00',
    updatedAt: '2023-09-15T00:00:00'
  }
];
