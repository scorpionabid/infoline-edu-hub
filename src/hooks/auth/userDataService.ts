
import { FullUserData } from '@/types/supabase';

/**
 * Bu xidmət simulyasiya edilmiş istifadəçi məlumatları ilə işləmək üçün istifadə olunur.
 * Həqiqi layihədə bu, Supabase və ya başqa bir backend xidməti ilə əvəz ediləcək.
 */

// Real istifadə zamanı fayl quruluşunu backend və api qovluqlarına yaxınlaşdırmaq üçün
// dəyişəcək. İndi sadəcə funksional bir prototipin nümayiş etdirilməsi üçün istifadə edirik.

// Istifadəçi siyahısının simulyasiyası
const mockUsers: FullUserData[] = [
  {
    id: "u1",
    email: "superadmin@infoline.az",
    full_name: "Super Admin",
    name: "Super Admin",
    role: "superadmin",
    region_id: undefined,
    regionId: undefined,
    sector_id: undefined,
    sectorId: undefined,
    school_id: undefined,
    schoolId: undefined,
    status: "active",
    phone: "+994501234567",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=superadmin",
    language: "az",
    position: "Baş Administrator",
    last_login: "2023-11-01T08:30:00Z",
    lastLogin: "2023-11-01T08:30:00Z",
    created_at: "2023-01-15T10:00:00Z",
    createdAt: "2023-01-15T10:00:00Z",
    updated_at: "2023-10-25T14:20:00Z",
    updatedAt: "2023-10-25T14:20:00Z",
    twoFactorEnabled: false,
    notificationSettings: {
      email: true,
      system: true
    }
  },
  {
    id: "u2",
    email: "regionadmin@infoline.az",
    full_name: "Region Admin",
    name: "Region Admin",
    role: "regionadmin",
    region_id: "r1",
    regionId: "r1",
    sector_id: undefined,
    sectorId: undefined,
    school_id: undefined,
    schoolId: undefined,
    status: "active",
    phone: "+994502345678",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=region",
    language: "az",
    position: "Region Rəhbəri",
    last_login: "2023-11-02T09:15:00Z",
    lastLogin: "2023-11-02T09:15:00Z", 
    created_at: "2023-02-20T11:30:00Z",
    createdAt: "2023-02-20T11:30:00Z",
    updated_at: "2023-10-26T15:45:00Z",
    updatedAt: "2023-10-26T15:45:00Z",
    twoFactorEnabled: false,
    notificationSettings: {
      email: true,
      system: true
    }
  },
  {
    id: "u3",
    email: "sectoradmin@infoline.az",
    full_name: "Sektor Admin",
    name: "Sektor Admin",
    role: "sectoradmin",
    region_id: "r1",
    regionId: "r1",
    sector_id: "s1",
    sectorId: "s1",
    school_id: undefined, 
    schoolId: undefined,
    status: "active",
    phone: "+994503456789",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sector",
    language: "az",
    position: "Sektor Rəhbəri",
    last_login: "2023-11-03T10:45:00Z",
    lastLogin: "2023-11-03T10:45:00Z",
    created_at: "2023-03-25T12:15:00Z",
    createdAt: "2023-03-25T12:15:00Z",
    updated_at: "2023-10-27T16:30:00Z",
    updatedAt: "2023-10-27T16:30:00Z",
    twoFactorEnabled: true,
    notificationSettings: {
      email: false,
      system: true
    }
  },
  {
    id: "u4",
    email: "schooladmin@infoline.az",
    full_name: "Məktəb Admin",
    name: "Məktəb Admin",
    role: "schooladmin",
    region_id: "r1",
    regionId: "r1",
    sector_id: "s1",
    sectorId: "s1",
    school_id: "sch1",
    schoolId: "sch1",
    status: "active",
    phone: "+994504567890",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=school",
    language: "az",
    position: "Məktəb Direktoru",
    last_login: "2023-11-04T11:30:00Z",
    lastLogin: "2023-11-04T11:30:00Z",
    created_at: "2023-04-30T08:45:00Z",
    createdAt: "2023-04-30T08:45:00Z",
    updated_at: "2023-10-28T13:20:00Z",
    updatedAt: "2023-10-28T13:20:00Z",
    twoFactorEnabled: false,
    notificationSettings: {
      email: true,
      system: true
    }
  }
];

// Xüsusilə API çağırışlarını simulyasiya etmək üçün istədiyimiz gecikməni yaradır
const delayedResponse = <T>(data: T, delay = 500): Promise<T> => {
  return new Promise(resolve => setTimeout(() => resolve(data), delay));
};

// İstifadəçi ID-si ilə istifadəçini tapmaq üçün funksiya
export const getUserById = async (id: string): Promise<FullUserData | null> => {
  const user = mockUsers.find(u => u.id === id);
  return delayedResponse(user || null);
};

// Bütün istifadəçiləri əldə etmək üçün funksiya
export const getAllUsers = async (): Promise<FullUserData[]> => {
  return delayedResponse([...mockUsers]);
};

// İstifadəçi məlumatlarını yeniləmək
export const updateUser = async (userId: string, userData: Partial<FullUserData>): Promise<FullUserData> => {
  const userIndex = mockUsers.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    throw new Error("İstifadəçi tapılmadı");
  }
  
  // İstifadəçi məlumatlarını yeniləyək
  mockUsers[userIndex] = {
    ...mockUsers[userIndex],
    ...userData,
    // Avtomatik olaraq yenilənmə tarixini əlavə edək
    updated_at: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  return delayedResponse(mockUsers[userIndex]);
};

// Yeni istifadəçi yaratmaq
export const createUser = async (userData: Partial<FullUserData>): Promise<FullUserData> => {
  // Yeni ID yaradaq
  const newId = `u${mockUsers.length + 1}`;
  
  // Məlumatların düzgün olduğundan əmin olaq
  if (!userData.email || !userData.full_name || !userData.role) {
    throw new Error("Email, ad və rol tələb olunur");
  }
  
  // Email ünvanının təkrar olub-olmadığını yoxlayaq
  if (mockUsers.some(u => u.email === userData.email)) {
    throw new Error("Bu email ünvanı artıq istifadə olunur");
  }
  
  // Avtomatik əlavə edilən xüsusiyyətlər
  const now = new Date().toISOString();
  
  // Yeni istifadəçi yaratmaq
  const newUser: FullUserData = {
    id: newId,
    email: userData.email,
    full_name: userData.full_name,
    name: userData.full_name,
    role: userData.role,
    region_id: userData.region_id,
    regionId: userData.region_id,
    sector_id: userData.sector_id, 
    sectorId: userData.sector_id,
    school_id: userData.school_id,
    schoolId: userData.school_id,
    status: userData.status || "active",
    phone: userData.phone || "",
    avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${newId}`,
    language: userData.language || "az",
    position: userData.position || "",
    last_login: null,
    lastLogin: null,
    created_at: now,
    createdAt: now,
    updated_at: now,
    updatedAt: now,
    twoFactorEnabled: userData.twoFactorEnabled || false,
    notificationSettings: userData.notificationSettings || {
      email: true,
      system: true
    }
  };
  
  // İstifadəçini əlavə edək
  mockUsers.push(newUser);
  
  return delayedResponse(newUser);
};

// İstifadəçi silmə
export const deleteUser = async (userId: string): Promise<boolean> => {
  const userIndex = mockUsers.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return delayedResponse(false);
  }
  
  // İstifadəçini siyahıdan çıxaraq
  mockUsers.splice(userIndex, 1);
  
  return delayedResponse(true);
};

// Filtrlər və səhifələmə ilə istifadəçiləri əldə etmək
export const getFilteredUsers = async (
  filters: {
    role?: string;
    region?: string;
    sector?: string;
    school?: string;
    status?: string;
    search?: string;
  },
  pagination: {
    page: number;
    pageSize: number;
  }
): Promise<{ data: FullUserData[]; count: number }> => {
  
  let filteredUsers = [...mockUsers];
  
  // Filtrləri tətbiq edək
  if (filters.role) {
    filteredUsers = filteredUsers.filter(u => u.role === filters.role);
  }
  
  if (filters.region) {
    filteredUsers = filteredUsers.filter(u => u.region_id === filters.region);
  }
  
  if (filters.sector) {
    filteredUsers = filteredUsers.filter(u => u.sector_id === filters.sector);
  }
  
  if (filters.school) {
    filteredUsers = filteredUsers.filter(u => u.school_id === filters.school);
  }
  
  if (filters.status) {
    filteredUsers = filteredUsers.filter(u => u.status === filters.status);
  }
  
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filteredUsers = filteredUsers.filter(u => 
      u.full_name?.toLowerCase().includes(searchLower) || 
      u.email.toLowerCase().includes(searchLower)
    );
  }
  
  // Ümumi sayı hesablayaq
  const count = filteredUsers.length;
  
  // Səhifələmə tətbiq edək
  const { page, pageSize } = pagination;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pagedUsers = filteredUsers.slice(startIndex, endIndex);
  
  return delayedResponse({ data: pagedUsers, count });
};

// Yeni fetchUserData funksiyası əlavə edirik, useSupabaseAuth.ts faylı üçün
export const fetchUserData = async (userId: string): Promise<FullUserData | null> => {
  return getUserById(userId);
};
