
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
    region: supabaseSchool.region,
    sector: supabaseSchool.sector
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
    principal_name: school.principalName || directorName,
    type: school.type || schoolType,
    language: school.language || teachingLanguage,
    region_id: regionId,
    sector_id: sectorId,
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
