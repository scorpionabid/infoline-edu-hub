
import { User, UserFormData } from '@/types/user';
import { UserRole } from '@/types/supabase';

export const mockUsers: User[] = [
  {
    id: "1",
    name: "Admin İstifadəçi",
    full_name: "Admin İstifadəçi",
    email: "admin@infoline.az",
    role: "superadmin",
    status: "active",
    avatar: "https://ui-avatars.com/api/?name=Admin+User&color=7F9CF5&background=EBF4FF",
    language: "az",
    phone: "+994501234567",
    position: "Sistem administratoru",
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
    id: "2",
    name: "Region Müdiri",
    full_name: "Region Müdiri",
    email: "region@infoline.az",
    role: "regionadmin",
    regionId: "region-1",
    region_id: "region-1",
    status: "active",
    avatar: "https://ui-avatars.com/api/?name=Region+Admin&color=7F9CF5&background=EBF4FF",
    language: "az",
    phone: "+994502345678",
    position: "Bakı Təhsil İdarəsi müdiri",
    notificationSettings: {
      email: true,
      inApp: true,
      system: true
    },
    createdAt: "2023-01-02T00:00:00Z",
    updatedAt: "2023-01-02T00:00:00Z"
  },
  {
    id: "3",
    name: "Sektor Müdiri",
    full_name: "Sektor Müdiri",
    email: "sector@infoline.az",
    role: "sectoradmin",
    regionId: "region-1",
    region_id: "region-1",
    sectorId: "sector-1",
    sector_id: "sector-1",
    status: "active",
    avatar: "https://ui-avatars.com/api/?name=Sector+Admin&color=7F9CF5&background=EBF4FF",
    language: "az",
    phone: "+994503456789",
    position: "Binəqədi rayonu sektor müdiri",
    notificationSettings: {
      email: true,
      inApp: true,
      system: true
    },
    createdAt: "2023-01-03T00:00:00Z",
    updatedAt: "2023-01-03T00:00:00Z"
  },
  {
    id: "4",
    name: "Məktəb Direktoru",
    full_name: "Məktəb Direktoru",
    email: "school@infoline.az",
    role: "schooladmin",
    regionId: "region-1",
    region_id: "region-1",
    sectorId: "sector-1",
    sector_id: "sector-1",
    schoolId: "school-1",
    school_id: "school-1",
    status: "active",
    avatar: "https://ui-avatars.com/api/?name=School+Admin&color=7F9CF5&background=EBF4FF",
    language: "az",
    phone: "+994504567890",
    position: "20 nömrəli məktəb direktoru",
    notificationSettings: {
      email: true,
      inApp: true,
      push: false,
      system: true
    },
    createdAt: "2023-01-04T00:00:00Z",
    updatedAt: "2023-01-04T00:00:00Z"
  },
  {
    id: "5",
    name: "Gəncə Region Müdiri",
    full_name: "Gəncə Region Müdiri",
    email: "ganja@infoline.az",
    role: "regionadmin",
    regionId: "region-2",
    region_id: "region-2",
    status: "active",
    avatar: "https://ui-avatars.com/api/?name=Ganja+Admin&color=7F9CF5&background=EBF4FF",
    language: "az",
    phone: "+994505678901",
    position: "Gəncə Təhsil İdarəsi müdiri",
    notificationSettings: {
      email: true,
      inApp: true,
      system: true
    },
    createdAt: "2023-01-05T00:00:00Z",
    updatedAt: "2023-01-05T00:00:00Z"
  },
  {
    id: "6",
    name: "Sumqayıt Region Müdiri",
    full_name: "Sumqayıt Region Müdiri",
    email: "sumgait@infoline.az",
    role: "regionadmin",
    regionId: "region-3",
    region_id: "region-3",
    status: "active",
    avatar: "https://ui-avatars.com/api/?name=Sumgait+Admin&color=7F9CF5&background=EBF4FF",
    language: "az",
    phone: "+994506789012",
    position: "Sumqayıt Təhsil İdarəsi müdiri",
    notificationSettings: {
      email: true,
      inApp: true,
      system: true
    },
    createdAt: "2023-01-06T00:00:00Z",
    updatedAt: "2023-01-06T00:00:00Z"
  },
  {
    id: "7",
    name: "Məktəb Müdiri 2",
    full_name: "Məktəb Müdiri 2",
    email: "school2@infoline.az",
    role: "schooladmin",
    regionId: "region-2",
    region_id: "region-2",
    sectorId: "sector-3",
    sector_id: "sector-3",
    schoolId: "school-5",
    school_id: "school-5",
    status: "active",
    avatar: "https://ui-avatars.com/api/?name=School+Admin+2&color=7F9CF5&background=EBF4FF",
    language: "az",
    phone: "+994507890123",
    position: "32 nömrəli məktəb direktoru",
    notificationSettings: {
      email: true,
      inApp: true,
      system: true
    },
    createdAt: "2023-01-07T00:00:00Z",
    updatedAt: "2023-01-07T00:00:00Z"
  },
  {
    id: "8",
    name: "Test İstifadəçi",
    full_name: "Test İstifadəçi",
    email: "test@infoline.az",
    role: "schooladmin",
    regionId: "region-1",
    region_id: "region-1",
    sectorId: "sector-2",
    sector_id: "sector-2",
    schoolId: "school-3",
    school_id: "school-3",
    status: "inactive",
    avatar: "https://ui-avatars.com/api/?name=Test+User&color=7F9CF5&background=EBF4FF",
    language: "az",
    phone: "+994508901234",
    position: "Test istifadəçi",
    notificationSettings: {
      email: true,
      inApp: true,
      system: true
    },
    createdAt: "2023-01-08T00:00:00Z",
    updatedAt: "2023-01-08T00:00:00Z"
  }
];

export const createMockUser = (
  role: UserRole = "schooladmin",
  status: "active" | "inactive" | "blocked" = "active"
): User => ({
  id: `user-${Date.now()}`,
  name: `${role.charAt(0).toUpperCase()}${role.slice(1)} İstifadəçi`,
  full_name: `${role.charAt(0).toUpperCase()}${role.slice(1)} İstifadəçi`,
  email: `${role}${Date.now()}@infoline.az`,
  role,
  regionId: role !== "superadmin" ? "region-1" : undefined,
  region_id: role !== "superadmin" ? "region-1" : undefined,
  sectorId: role === "sectoradmin" || role === "schooladmin" ? "sector-1" : undefined,
  sector_id: role === "sectoradmin" || role === "schooladmin" ? "sector-1" : undefined,
  schoolId: role === "schooladmin" ? "school-1" : undefined,
  school_id: role === "schooladmin" ? "school-1" : undefined,
  status,
  avatar: `https://ui-avatars.com/api/?name=${role}+User&color=7F9CF5&background=EBF4FF`,
  language: "az",
  phone: "+99450" + Math.floor(1000000 + Math.random() * 9000000),
  position: `${role} vəzifəsi`,
  notificationSettings: {
    email: true,
    inApp: true,
    system: true
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});
