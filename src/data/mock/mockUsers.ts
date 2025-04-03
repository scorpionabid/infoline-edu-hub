
import { User } from "@/types/user";
import { UserRole } from '@/types/supabase';

// Mock istifadəçi məlumatları
export const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@infoline.az",
    full_name: "Super Admin",
    name: "Super Admin", // name propriety əlavə edirik
    position: "Sistem Administratoru",
    status: "active",
    role: "superadmin",
    notificationSettings: {
      email: true,
      inApp: true,
      push: true,
    },
    lastLoginAt: new Date("2023-10-05").toISOString()
  },
  {
    id: "2",
    email: "baki@infoline.az",
    full_name: "Bakı Region Admini",
    name: "Bakı Region Admini",
    position: "Region Müdiri",
    status: "active",
    role: "regionadmin",
    region_id: "1",
    regionId: "1",
    notificationSettings: {
      email: true,
      inApp: true,
    },
    lastLoginAt: new Date("2023-10-04").toISOString()
  },
  {
    id: "3",
    email: "sektor1@infoline.az",
    full_name: "Sektor 1 Admini",
    name: "Sektor 1 Admini",
    position: "Sektor Müdiri",
    status: "active",
    role: "sectoradmin",
    region_id: "1",
    regionId: "1",
    sector_id: "1",
    sectorId: "1",
    notificationSettings: {
      email: true,
      inApp: true,
      push: false,
    },
    lastLoginAt: new Date("2023-10-03").toISOString()
  },
  {
    id: "4",
    email: "mekteb1@infoline.az",
    full_name: "1 Nömrəli Məktəb",
    name: "1 Nömrəli Məktəb",
    position: "Məktəb Direktoru",
    status: "active",
    role: "schooladmin",
    region_id: "1",
    regionId: "1",
    sector_id: "1",
    sectorId: "1",
    school_id: "1",
    schoolId: "1",
    notificationSettings: {
      email: true,
      inApp: true,
    },
    lastLoginAt: new Date("2023-10-02").toISOString()
  },
  {
    id: "5",
    email: "mekteb2@infoline.az",
    full_name: "2 Nömrəli Məktəb",
    name: "2 Nömrəli Məktəb", 
    position: "Məktəb Direktoru",
    status: "inactive",
    role: "schooladmin",
    region_id: "1",
    regionId: "1",
    sector_id: "1",
    sectorId: "1",
    school_id: "2",
    schoolId: "2",
    notificationSettings: {
      email: true,
      inApp: true,
    },
    lastLoginAt: new Date("2023-09-25").toISOString()
  },
  {
    id: "6",
    email: "user1@example.com",
    full_name: "İstifadəçi 1",
    name: "İstifadəçi 1",
    position: "Müəllim",
    status: "active",
    role: "schooladmin", // "user" rolu problemlərə səbəb olur, dəyişdirdik
    region_id: "1",
    regionId: "1",
    sector_id: "2",
    sectorId: "2", 
    school_id: "3",
    schoolId: "3",
    notificationSettings: {
      email: false,
      inApp: true,
      push: false,
    },
    lastLoginAt: new Date("2023-09-20").toISOString()
  },
  {
    id: "7",
    email: "user2@example.com",
    full_name: "İstifadəçi 2",
    name: "İstifadəçi 2",
    position: "Müəllim",
    status: "blocked",
    role: "schooladmin", // "user" rolu problemlərə səbəb olur, dəyişdirdik
    region_id: "2",
    regionId: "2",
    sector_id: "3",
    sectorId: "3",
    school_id: "4",
    schoolId: "4",
    notificationSettings: {
      email: false,
      inApp: false,
      push: false,
    },
    lastLoginAt: new Date("2023-09-15").toISOString()
  },
  {
    id: "8",
    email: "user3@example.com",
    full_name: "İstifadəçi 3",
    name: "İstifadəçi 3",
    position: "Müəllim",
    status: "active",
    role: "schooladmin", // "user" rolu problemlərə səbəb olur, dəyişdirdik
    region_id: "3",
    regionId: "3",
    sector_id: "4",
    sectorId: "4",
    school_id: "5",
    schoolId: "5",
    notificationSettings: {
      email: true,
      inApp: true,
      push: true,
    },
    lastLoginAt: new Date("2023-09-10").toISOString()
  },
  {
    id: "9",
    email: "user4@example.com",
    full_name: "İstifadəçi 4", 
    name: "İstifadəçi 4",
    position: "Müəllim",
    status: "inactive",
    role: "schooladmin", // "user" rolu problemlərə səbəb olur, dəyişdirdik
    region_id: "4",
    regionId: "4",
    sector_id: "5",
    sectorId: "5",
    school_id: "6",
    schoolId: "6",
    notificationSettings: {
      email: false,
      inApp: false,
      push: false,
    },
    lastLoginAt: new Date("2023-09-05").toISOString()
  },
  {
    id: "10",
    email: "user5@example.com",
    full_name: "İstifadəçi 5",
    name: "İstifadəçi 5",
    position: "Müəllim",
    status: "active",
    role: "schooladmin", // "user" rolu problemlərə səbəb olur, dəyişdirdik
    region_id: "5",
    regionId: "5",
    sector_id: "6",
    sectorId: "6",
    school_id: "7",
    schoolId: "7",
    notificationSettings: {
      email: true,
      inApp: true,
      push: false,
    },
    lastLoginAt: new Date("2023-09-01").toISOString()
  }
];

// Müxtəlif rollarda olan istifadəçilər üçün köməkçi funksiyalar
export const getMockSuperAdmin = () => mockUsers.find(u => u.role === "superadmin");
export const getMockRegionAdmin = () => mockUsers.find(u => u.role === "regionadmin");
export const getMockSectorAdmin = () => mockUsers.find(u => u.role === "sectoradmin");
export const getMockSchoolAdmin = () => mockUsers.find(u => u.role === "schooladmin");
export const getMockUsers = () => mockUsers;
