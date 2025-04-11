
export interface School {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  directorName?: string;
  principalName?: string; // Əlavə property
  studentCount?: number;
  teacherCount?: number;
  schoolType?: 'elementary' | 'middle' | 'high' | 'vocational' | 'special';
  type?: string; // Daha flexible tip
  teachingLanguage?: 'azerbaijani' | 'russian' | 'georgian' | 'turkish' | 'english';
  language?: string; // Daha flexible dil tipi
  regionId: string;
  sectorId: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
  completionRate?: number; // Əlavə property
  logo?: string; // Əlavə property
  adminEmail?: string; // Əlavə property
  admin_email?: string; // Supabase adlandırması ilə
  completion_rate?: number; // Supabase adlandırması ilə
  region?: string; // Əlaqəli region adı
  sector?: string; // Əlaqəli sektor adı
  
  // Supabase tipindən gələn daxili adlar
  region_id?: string;
  sector_id?: string;
  principal_name?: string;
  student_count?: number;
  teacher_count?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * İstifadəçi rolu tipləri
 */
export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'user';

/**
 * İstifadəçi rolu məlumatları
 */
export interface UserRoleData {
  role?: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
}

// Profile interfeysi
export interface Profile {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  position?: string;
  avatar?: string;
  status?: string;
  language?: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

// Tam istifadəçi məlumatını təsvir edən interfeys
export interface FullUserData {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  phone?: string;
  position?: string;
  language?: string;
  avatar?: string;
  status?: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
  
  // Alias sahələr
  name?: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
  
  // Admin entity
  adminEntity?: {
    type: string;
    name: string;
    status?: string;
    regionName?: string;
    sectorName?: string;
    schoolType?: string;
  };
  
  // Əlavə sahələr
  twoFactorEnabled?: boolean;
  notificationSettings?: {
    email: boolean;
    system: boolean;
  };
}

// İstifadəçi yaratmaq üçün verilənlər
export interface CreateUserData {
  full_name: string;
  email: string;
  password: string;
  role: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  phone?: string;
  position?: string;
  language?: string;
  avatar?: string;
  status?: string;
}

// İstifadəçi yeniləmək üçün verilənlər
export interface UpdateUserData {
  full_name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  phone?: string;
  position?: string;
  language?: string;
  avatar?: string;
  status?: string;
}

// Region interface
export interface Region {
  id: string;
  name: string;
  description?: string;
  admin_id?: string;
  admin_email?: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

// Sector interface
export interface Sector {
  id: string;
  name: string;
  description?: string;
  region_id: string;
  admin_id?: string;
  admin_email?: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

// Data entry tipi
export interface DataEntry {
  id: string;
  category_id: string;
  column_id: string;
  school_id: string;
  value?: string;
  status?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejection_reason?: string;
}

// Supabase tipindən app tipinə çevirmək üçün adapter
export const adaptSchoolFromSupabase = (supabaseSchool: any): School => {
  return {
    id: supabaseSchool.id,
    name: supabaseSchool.name,
    address: supabaseSchool.address,
    phone: supabaseSchool.phone,
    email: supabaseSchool.email,
    directorName: supabaseSchool.principal_name,
    principalName: supabaseSchool.principal_name,
    studentCount: supabaseSchool.student_count,
    teacherCount: supabaseSchool.teacher_count,
    type: supabaseSchool.type,
    schoolType: mapSchoolType(supabaseSchool.type),
    language: supabaseSchool.language,
    teachingLanguage: mapLanguage(supabaseSchool.language),
    regionId: supabaseSchool.region_id,
    sectorId: supabaseSchool.sector_id,
    status: supabaseSchool.status || 'active',
    createdAt: supabaseSchool.created_at,
    updatedAt: supabaseSchool.updated_at,
    completionRate: supabaseSchool.completion_rate,
    logo: supabaseSchool.logo,
    adminEmail: supabaseSchool.admin_email,
    admin_email: supabaseSchool.admin_email,
    completion_rate: supabaseSchool.completion_rate,
    
    // Supabase sahələri
    region_id: supabaseSchool.region_id,
    sector_id: supabaseSchool.sector_id,
    principal_name: supabaseSchool.principal_name,
    student_count: supabaseSchool.student_count,
    teacher_count: supabaseSchool.teacher_count,
    created_at: supabaseSchool.created_at,
    updated_at: supabaseSchool.updated_at
  };
};

// Məktəb tipini supabase formatına çevirmək
export const adaptSchoolToSupabase = (school: Partial<School>): any => {
  const {
    directorName, teachingLanguage, regionId, sectorId, createdAt, updatedAt,
    schoolType, completionRate, adminEmail, region, sector, ...rest
  } = school;
  
  return {
    ...rest,
    principal_name: school.principalName || school.principal_name || directorName,
    type: school.type || schoolType,
    language: school.language || teachingLanguage,
    region_id: school.region_id || regionId,
    sector_id: school.sector_id || sectorId,
    completion_rate: school.completion_rate || completionRate,
    admin_email: school.admin_email || adminEmail
  };
};

// Köməkçi funksiyalar
function mapSchoolType(type?: string): 'elementary' | 'middle' | 'high' | 'vocational' | 'special' | undefined {
  if (!type) return undefined;
  
  const typeMapping: { [key: string]: 'elementary' | 'middle' | 'high' | 'vocational' | 'special' } = {
    'elementary': 'elementary',
    'middle': 'middle',
    'high': 'high',
    'vocational': 'vocational',
    'special': 'special',
    'ibtidai': 'elementary',
    'orta': 'middle',
    'tam_orta': 'high',
    'texniki_peşə': 'vocational',
    'xüsusi': 'special'
  };
  
  return typeMapping[type.toLowerCase()] || 'high';
}

function mapLanguage(language?: string): 'azerbaijani' | 'russian' | 'georgian' | 'turkish' | 'english' | undefined {
  if (!language) return undefined;
  
  const languageMapping: { [key: string]: 'azerbaijani' | 'russian' | 'georgian' | 'turkish' | 'english' } = {
    'azerbaijani': 'azerbaijani',
    'russian': 'russian',
    'georgian': 'georgian', 
    'turkish': 'turkish',
    'english': 'english',
    'azərbaycan': 'azerbaijani',
    'rus': 'russian',
    'gürcü': 'georgian',
    'türk': 'turkish',
    'ingilis': 'english'
  };
  
  return languageMapping[language.toLowerCase()] || 'azerbaijani';
}
