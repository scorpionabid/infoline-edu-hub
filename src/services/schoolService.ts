import { supabase } from '@/integrations/supabase/client';
import { School } from '@/types/school';

// Məktəb yaratmaq üçün parametrlər
export interface CreateSchoolParams {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  principalName?: string;
  studentCount?: number;
  teacherCount?: number;
  schoolType?: 'elementary' | 'middle' | 'high' | 'vocational' | 'special';
  teachingLanguage?: 'azerbaijani' | 'russian' | 'georgian' | 'turkish' | 'english';
  regionId: string;
  sectorId: string;
  status?: 'active' | 'inactive';
  adminEmail?: string;
  adminFullName?: string;
  adminPassword?: string;
}

// Bu funksiyanı faylın əvvəlinə əlavə edək
const mapSchool = (schoolData: any): School => {
  return {
    id: schoolData.id,
    name: schoolData.name,
    address: schoolData.address,
    phone: schoolData.phone,
    email: schoolData.email,
    directorName: schoolData.principal_name,
    studentCount: schoolData.student_count,
    teacherCount: schoolData.teacher_count,
    status: schoolData.status || 'active',
    regionId: schoolData.region_id,
    sectorId: schoolData.sector_id,
    adminEmail: schoolData.admin_email,
    createdAt: schoolData.created_at,
    updatedAt: schoolData.updated_at,
    // Supabase ilə uyğunluq üçün əlavə sahələr
    region_id: schoolData.region_id,
    sector_id: schoolData.sector_id,
    principal_name: schoolData.principal_name,
    created_at: schoolData.created_at,
    updated_at: schoolData.updated_at,
    type: schoolData.type,
    language: schoolData.language,
    completion_rate: schoolData.completion_rate,
    logo: schoolData.logo,
    admin_id: schoolData.admin_id,
    admin_email: schoolData.admin_email
  };
};

// Məktəbləri yükləmək üçün funksiya
export const fetchSchools = async (regionId?: string, sectorId?: string): Promise<School[]> => {
  try {
    console.log('Məktəblər sorğusu göndərilir...');

    let query = supabase
      .from('schools')
      .select('*')
      .order('name');

    // Əgər regionId varsa, filtrlə
    if (regionId) {
      query = query.eq('region_id', regionId);
    }

    // Əgər sectorId varsa, filtrlə
    if (sectorId) {
      query = query.eq('sector_id', sectorId);
    }

    const { data: schools, error } = await query;

    if (error) {
      console.error('Məktəbləri yükləmə xətası:', error);
      return [];
    }

    if (!schools || schools.length === 0) {
      console.log('Heç bir məktəb tapılmadı');
      return [];
    }

    console.log(`${schools.length} məktəb tapıldı, admin emailləri əldə edilir...`);

    // Məktəbləri admin emailləri ilə formalaşdır
    const formattedSchools = schools.map(school => ({
      ...school,
      adminEmail: school.admin_email || '', 
      studentCount: school.student_count || 0,
      teacherCount: school.teacher_count || 0,
      adminCount: school.admin_email ? 1 : 0
    }));

    console.log('Formatlanmış məktəblər:', formattedSchools.map(s => ({ name: s.name, adminEmail: s.adminEmail })));
    return formattedSchools.map(mapSchool);
  } catch (error) {
    console.error('Məktəbləri əldə edərkən ümumi xəta:', error);
    return [];
  }
};

// Məktəbi ID-ə görə yükləmək
export const getSchoolById = async (schoolId: string): Promise<School | null> => {
  try {
    console.log(`Məktəb ID ${schoolId} sorğusu göndərilir...`);

    const { data: school, error } = await supabase
      .from('schools')
      .select('*')
      .eq('id', schoolId)
      .single();

    if (error) {
      console.error(`Məktəb ID ${schoolId} yükləmə xətası:`, error);
      return null;
    }

    if (!school) {
      console.log(`Məktəb ID ${schoolId} tapılmadı`);
      return null;
    }

    console.log(`Məktəb ID ${schoolId} tapıldı, admin emaili əldə edilir...`);

    // Məktəbi admin emaili ilə formalaşdır
    const formattedSchool = {
      ...school,
      adminEmail: school.admin_email || '',
      studentCount: school.student_count || 0,
      teacherCount: school.teacher_count || 0,
      adminCount: school.admin_email ? 1 : 0
    };

    console.log('Formatlanmış məktəb:', { name: formattedSchool.name, adminEmail: formattedSchool.adminEmail });
    return mapSchool(school);
  } catch (error) {
    console.error(`Məktəb ID ${schoolId} əldə edərkən ümumi xəta:`, error);
    return null;
  }
};

// Məktəbi yaratmaq
export const addSchool = async (schoolData: CreateSchoolParams): Promise<School> => {
  try {
    console.log('Məktəb əlavə edilir:', schoolData);

    // Edge function vasitəsilə məktəbi və admini yaradaq
    const response = await supabase.functions.invoke('school-operations', {
      body: {
        action: 'create',
        name: schoolData.name,
        principalName: schoolData.principalName,
        address: schoolData.address,
        phone: schoolData.phone,
        email: schoolData.email,
        regionId: schoolData.regionId,
        sectorId: schoolData.sectorId,
        studentCount: schoolData.studentCount ? Number(schoolData.studentCount) : null,
        teacherCount: schoolData.teacherCount ? Number(schoolData.teacherCount) : null,
        type: schoolData.schoolType,
        language: schoolData.teachingLanguage,
        status: schoolData.status || 'active',
        adminEmail: schoolData.adminEmail,
        adminFullName: schoolData.adminFullName,
        adminPassword: schoolData.adminPassword,
        adminStatus: 'active'
      }
    });

    const { data, error } = response;

    if (error) {
      console.error('Məktəb yaratma sorğusu xətası:', error);
      throw error;
    }

    console.log('Məktəb yaratma nəticəsi:', data);

    // Edge function-dan qaytarılan məlumatları formalaşdır
    if (data && data.data && data.data.school) {
      console.log('Yaradılan məktəb:', data.data.school);
      
      if (data.data.admin) {
        console.log('Admin yaradılmışdır:', data.data.admin.email);
      } else if (schoolData.adminEmail) {
        console.warn('Admin yaradılmamışdır, admin məlumatlarını yoxlayın!');
      }
      
      return mapSchool(data.data.school);
    } else {
      // Xəta halında boş obyekt qaytar
      throw new Error('Məktəb yaradıldı, amma məlumatlar qaytarılmadı');
    }
  } catch (error) {
    console.error('Məktəb əlavə etmə xətası:', error);
    throw error;
  }
};

// Məktəbi yeniləmək
export const updateSchool = async (schoolId: string, schoolData: Partial<CreateSchoolParams>): Promise<School | null> => {
  try {
    console.log(`Məktəb ID ${schoolId} yenilənir:`, schoolData);

    // Supabase tipləri ilə uyğunlaşdıraq
    const supabaseData = {
      name: schoolData.name,
      principal_name: schoolData.principalName,
      address: schoolData.address,
      phone: schoolData.phone,
      email: schoolData.email,
      region_id: schoolData.regionId,
      sector_id: schoolData.sectorId,
      student_count: schoolData.studentCount ? Number(schoolData.studentCount) : undefined,
      teacher_count: schoolData.teacherCount ? Number(schoolData.teacherCount) : undefined,
      status: schoolData.status,
      type: schoolData.schoolType,
      language: schoolData.teachingLanguage,
      admin_email: schoolData.adminEmail
    };

    const { data: updatedSchool, error } = await supabase
      .from('schools')
      .update(supabaseData)
      .eq('id', schoolId)
      .select()
      .single();

    if (error) {
      console.error(`Məktəb ID ${schoolId} yeniləmə xətası:`, error);
      return null;
    }

    if (!updatedSchool) {
      console.log(`Məktəb ID ${schoolId} tapılmadı`);
      return null;
    }

    console.log(`Məktəb ID ${schoolId} yeniləndi:`, updatedSchool);

    return mapSchool(updatedSchool);
  } catch (error) {
    console.error(`Məktəb ID ${schoolId} yeniləmə xətası:`, error);
    return null;
  }
};

// Məktəbi silmək
export const deleteSchool = async (schoolId: string): Promise<any> => {
  try {
    console.log(`Məktəb ID ${schoolId} silinir...`);

    // Edge function vasitəsilə məktəbi və admini siləcəyik
    const response = await supabase.functions.invoke('school-operations', {
      body: {
        action: 'delete',
        schoolId: schoolId
      }
    });

    const { data, error } = response;

    if (error) {
      console.error(`Məktəb ID ${schoolId} silmə xətası:`, error);
      throw error;
    }

    console.log(`Məktəb ID ${schoolId} uğurla silindi`);
    return { success: true, message: 'Məktəb uğurla silindi' };
  } catch (error) {
    console.error(`Məktəb ID ${schoolId} silmə xətası:`, error);
    throw error;
  }
};
