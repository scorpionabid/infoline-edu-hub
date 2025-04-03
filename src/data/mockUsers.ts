
import { User, UserFormData } from '@/types/user';
import { UserRole } from '@/types/supabase';

export const mockUsers: User[] = [
  {
    id: "user-1",
    name: "Admin İstifadəçi",
    email: "admin@example.com",
    role: "superadmin",
    status: "active",
    avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=admin",
    language: "az",
    phone: "+994551234567",
    position: "System Administrator",
    notificationSettings: {
      email: true,
      inApp: true,
      push: true,
      system: true
    },
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  {
    id: "user-2",
    name: "Bakı Region Admini",
    email: "baku@example.com",
    role: "regionadmin",
    regionId: "region-1",
    status: "active",
    avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=baku",
    language: "az",
    phone: "+994552345678",
    position: "Region Manager",
    notificationSettings: {
      email: true,
      inApp: true,
      system: true
    },
    createdAt: "2023-01-02T00:00:00Z",
    updatedAt: "2023-01-02T00:00:00Z"
  },
  {
    id: "user-3",
    name: "Nəsimi Sektor Admini",
    email: "nasimi@example.com",
    role: "sectoradmin",
    regionId: "region-1",
    sectorId: "sector-1",
    status: "active",
    avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=nasimi",
    language: "az",
    phone: "+994553456789",
    position: "Sector Manager",
    notificationSettings: {
      email: true,
      inApp: true,
      system: true
    },
    createdAt: "2023-01-03T00:00:00Z",
    updatedAt: "2023-01-03T00:00:00Z"
  },
  {
    id: "user-4",
    name: "20 nömrəli məktəb Admini",
    email: "school20@example.com",
    role: "schooladmin",
    regionId: "region-1",
    sectorId: "sector-1",
    schoolId: "school-1",
    status: "active",
    avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=school20",
    language: "az",
    phone: "+994554567890",
    position: "School Director",
    notificationSettings: {
      email: true,
      inApp: true,
      system: true
    },
    createdAt: "2023-01-04T00:00:00Z",
    updatedAt: "2023-01-04T00:00:00Z"
  },
  {
    id: "user-5",
    name: "Sumqayıt Region Admini",
    email: "sumgait@example.com",
    role: "regionadmin",
    regionId: "region-2",
    status: "active",
    avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=sumgait",
    language: "az",
    phone: "+994555678901",
    position: "Region Manager",
    notificationSettings: {
      email: true,
      inApp: true,
      system: true
    },
    createdAt: "2023-01-05T00:00:00Z",
    updatedAt: "2023-01-05T00:00:00Z"
  },
  {
    id: "user-6",
    name: "Gəncə Region Admini",
    email: "ganja@example.com",
    role: "regionadmin",
    regionId: "region-3",
    status: "active",
    avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=ganja",
    language: "az",
    phone: "+994556789012",
    position: "Region Manager",
    notificationSettings: {
      email: true,
      inApp: true,
      system: true
    },
    createdAt: "2023-01-06T00:00:00Z",
    updatedAt: "2023-01-06T00:00:00Z"
  },
  {
    id: "user-7",
    name: "158 nömrəli məktəb Admini",
    email: "school158@example.com",
    role: "schooladmin",
    regionId: "region-1",
    sectorId: "sector-2",
    schoolId: "school-2",
    status: "active",
    avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=school158",
    language: "az",
    phone: "+994557890123",
    position: "School Director",
    notificationSettings: {
      email: true,
      inApp: true,
      system: true
    },
    createdAt: "2023-01-07T00:00:00Z",
    updatedAt: "2023-01-07T00:00:00Z"
  },
  {
    id: "user-8",
    name: "245 nömrəli məktəb Admini",
    email: "school245@example.com",
    role: "schooladmin",
    regionId: "region-1",
    sectorId: "sector-3",
    schoolId: "school-3",
    status: "inactive",
    avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=school245",
    language: "az",
    phone: "+994558901234",
    position: "School Director",
    notificationSettings: {
      email: true,
      inApp: true,
      system: true
    },
    createdAt: "2023-01-08T00:00:00Z",
    updatedAt: "2023-01-08T00:00:00Z"
  }
];

// Yeni istifadəçi yaratmaq üçün mock funksiya
export const createMockUser = (userData: UserFormData): User => {
  return {
    id: `user-${Date.now()}`,
    name: userData.name,
    email: userData.email,
    role: userData.role,
    regionId: userData.regionId,
    sectorId: userData.sectorId,
    schoolId: userData.schoolId,
    status: userData.status,
    avatar: userData.avatar || `https://api.dicebear.com/6.x/avataaars/svg?seed=${userData.email}`,
    language: userData.language || 'az',
    phone: userData.phone,
    position: userData.position,
    notificationSettings: userData.notificationSettings,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};
