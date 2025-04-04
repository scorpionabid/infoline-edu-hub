
import { User } from "@/types/user";
import { UserRole } from "@/types/supabase";

// Mock user datasını daha uyğun formata çevirək
const adaptMockUser = (data: any): User => {
  return {
    id: data.id || '',
    email: data.email || '',
    full_name: data.name || '',
    name: data.name || '',
    role: data.role || 'schooladmin',
    status: data.status || 'active',
    region_id: data.regionId || null,
    regionId: data.regionId || null,
    sector_id: data.sectorId || null,
    sectorId: data.sectorId || null,
    school_id: data.schoolId || null,
    schoolId: data.schoolId || null,
    avatar: data.avatar || '',
    language: data.language || 'az',
    phone: data.phone || '',
    position: data.position || '',
    notificationSettings: data.notificationSettings || {
      email: true,
      inApp: true
    },
    lastLogin: data.lastLogin || null,
    createdAt: data.createdAt || '',
    updatedAt: data.updatedAt || ''
  };
};

// Mock istifadəçilər
export const mockUsers: User[] = [
  adaptMockUser({
    id: 'user-1',
    name: 'Admin İstifadəçi',
    email: 'admin@admin.com',
    role: 'superadmin',
    status: 'active',
    avatar: '/avatars/admin.png',
    language: 'az',
    phone: '+994501234567',
    position: 'Sistem Administratoru',
    notificationSettings: {
      email: true,
      inApp: true,
      push: true,
      system: true
    },
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  }),
  
  adaptMockUser({
    id: 'user-2',
    name: 'Region Admin',
    email: 'region@admin.com',
    role: 'regionadmin',
    regionId: 'region-1',
    status: 'active',
    avatar: '/avatars/region.png',
    language: 'az',
    phone: '+994502345678',
    position: 'Region Müdiri',
    notificationSettings: {
      email: true,
      inApp: true,
      system: true
    },
    createdAt: '2023-01-02T00:00:00.000Z',
    updatedAt: '2023-01-02T00:00:00.000Z'
  }),
  
  adaptMockUser({
    id: 'user-3',
    name: 'Sektor Admin',
    email: 'sector@admin.com',
    role: 'sectoradmin',
    regionId: 'region-1',
    sectorId: 'sector-1',
    status: 'active',
    avatar: '/avatars/sector.png',
    language: 'az',
    phone: '+994503456789',
    position: 'Sektor Müdiri',
    notificationSettings: {
      email: true,
      inApp: true,
      system: true
    },
    createdAt: '2023-01-03T00:00:00.000Z',
    updatedAt: '2023-01-03T00:00:00.000Z'
  }),
  
  adaptMockUser({
    id: 'user-4',
    name: 'Məktəb Admin',
    email: 'school@admin.com',
    role: 'schooladmin',
    regionId: 'region-1',
    sectorId: 'sector-1',
    schoolId: 'school-1',
    status: 'active',
    avatar: '/avatars/school.png',
    language: 'az',
    phone: '+994504567890',
    position: 'Məktəb Direktoru',
    notificationSettings: {
      email: true,
      inApp: true,
      system: true
    },
    createdAt: '2023-01-04T00:00:00.000Z',
    updatedAt: '2023-01-04T00:00:00.000Z'
  }),

  adaptMockUser({
    id: 'user-5',
    name: 'Bakı Region Admin',
    email: 'baku@admin.com',
    role: 'regionadmin',
    regionId: 'region-2',
    status: 'active',
    avatar: '/avatars/baku.png',
    language: 'az',
    phone: '+994505678901',
    position: 'Region Müdiri',
    notificationSettings: {
      email: true,
      inApp: true,
      system: true
    },
    createdAt: '2023-01-05T00:00:00.000Z',
    updatedAt: '2023-01-05T00:00:00.000Z'
  }),
  
  adaptMockUser({
    id: 'user-6',
    name: 'Gəncə Region Admin',
    email: 'ganja@admin.com',
    role: 'regionadmin',
    regionId: 'region-3',
    status: 'active',
    avatar: '/avatars/ganja.png',
    language: 'az',
    phone: '+994506789012',
    position: 'Region Müdiri',
    notificationSettings: {
      email: true,
      inApp: true,
      system: true
    },
    createdAt: '2023-01-06T00:00:00.000Z',
    updatedAt: '2023-01-06T00:00:00.000Z'
  }),
  
  adaptMockUser({
    id: 'user-7',
    name: 'Məktəb Admin 2',
    email: 'school2@admin.com',
    role: 'schooladmin',
    regionId: 'region-2',
    sectorId: 'sector-2',
    schoolId: 'school-2',
    status: 'active',
    avatar: '/avatars/school2.png',
    language: 'az',
    phone: '+994507890123',
    position: 'Məktəb Direktoru',
    notificationSettings: {
      email: true,
      inApp: true,
      system: true
    },
    createdAt: '2023-01-07T00:00:00.000Z',
    updatedAt: '2023-01-07T00:00:00.000Z'
  }),
  
  adaptMockUser({
    id: 'user-8',
    name: 'Məktəb Admin 3',
    email: 'school3@admin.com',
    role: 'schooladmin',
    regionId: 'region-3',
    sectorId: 'sector-3',
    schoolId: 'school-3',
    status: 'inactive',
    avatar: '/avatars/school3.png',
    language: 'az',
    phone: '+994508901234',
    position: 'Məktəb Direktoru',
    notificationSettings: {
      email: false,
      inApp: true,
      system: false
    },
    createdAt: '2023-01-08T00:00:00.000Z',
    updatedAt: '2023-01-08T00:00:00.000Z'
  })
];

// Mock istifadəçi yaratmaq üçün funksiya
export const createMockUser = (userData: Partial<User>): User => {
  return adaptMockUser({
    id: `user-${Date.now()}`,
    name: userData.name || 'Yeni İstifadəçi',
    email: userData.email || `user-${Date.now()}@example.com`,
    role: userData.role || 'schooladmin' as UserRole,
    regionId: userData.regionId || userData.region_id || null,
    sectorId: userData.sectorId || userData.sector_id || null,
    schoolId: userData.schoolId || userData.school_id || null,
    status: userData.status || 'active',
    avatar: userData.avatar || '/avatars/default.png',
    language: userData.language || 'az',
    phone: userData.phone || '',
    position: userData.position || '',
    notificationSettings: userData.notificationSettings || {
      email: true,
      inApp: true,
      system: true
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
};
