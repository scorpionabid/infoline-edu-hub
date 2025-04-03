import { adaptSchoolData } from '@/types/school';
import { supabase } from '@/integrations/supabase/client';
import { CreateSchoolParams, School } from '@/types/school';

export const fetchSchools = async (): Promise<School[]> => {
  try {
    const { data, error } = await supabase.from('schools').select('*');
    
    if (error) throw new Error(error.message);
    
    const schools: School[] = data.map(school => ({
      id: school.id,
      name: school.name,
      regionId: school.region_id,
      sectorId: school.sector_id,
      address: school.address,
      phone: school.phone,
      email: school.email,
      principalName: school.principal_name,
      studentCount: school.student_count,
      teacherCount: school.teacher_count,
      type: school.type,
      language: school.language,
      status: school.status,
      logo: school.logo,
      adminEmail: school.admin_email,
      completionRate: school.completion_rate || 0,
      createdAt: school.created_at,
      updatedAt: school.updated_at
    }));
    
    return schools;
  } catch (error) {
    throw error;
  }
};

export const getSchoolById = async (schoolId: string): Promise<School | null> => {
  try {
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .eq('id', schoolId)
      .single();

    if (error) {
      console.error("Error fetching school by ID:", error);
      return null;
    }

    return adaptSchoolData(data);
  } catch (error) {
    console.error("Unexpected error fetching school by ID:", error);
    return null;
  }
};

export const createSchool = async (schoolData: CreateSchoolParams): Promise<School> => {
  try {
    // E-poçt ünvanının mövcudluğunu yoxlayaq
    if (schoolData.adminEmail) {
      const { data: existingUsers, error: emailCheckErr } = await supabase
        .from('auth.users')
        .select('email')
        .eq('email', schoolData.adminEmail)
        .single();
        
      if (emailCheckErr && emailCheckErr.code !== 'PGRST116') {
        throw new Error(`Error checking email: ${emailCheckErr.message}`);
      }
      
      if (existingUsers) {
        throw new Error(`User with email ${schoolData.adminEmail} already exists`);
      }
    }
    
    // Məktəb yaradılır
    const { data: newSchool, error } = await supabase
      .from('schools')
      .insert({
        name: schoolData.name,
        region_id: schoolData.regionId,
        sector_id: schoolData.sectorId,
        address: schoolData.address,
        phone: schoolData.phone,
        email: schoolData.email,
        principal_name: schoolData.principalName,
        student_count: schoolData.studentCount,
        teacher_count: schoolData.teacherCount,
        type: schoolData.type,
        language: schoolData.language,
        status: schoolData.status || 'active',
        admin_email: schoolData.adminEmail,
        logo: schoolData.logo,
        completion_rate: schoolData.completionRate || 0
      })
      .select()
      .single();
      
    if (error) throw new Error(`Error creating school: ${error.message}`);
    
    return adaptSchoolData(newSchool);
  } catch (error) {
    throw error;
  }
};

export const updateSchool = async (schoolId: string, schoolData: Partial<CreateSchoolParams>): Promise<School> => {
  try {
    const updateData: any = {};
    
    // Yalnız təqdim edilən sahələri yeniləyək
    if (schoolData.name !== undefined) updateData.name = schoolData.name;
    if (schoolData.regionId !== undefined) updateData.region_id = schoolData.regionId;
    if (schoolData.sectorId !== undefined) updateData.sector_id = schoolData.sectorId;
    if (schoolData.address !== undefined) updateData.address = schoolData.address;
    if (schoolData.phone !== undefined) updateData.phone = schoolData.phone;
    if (schoolData.email !== undefined) updateData.email = schoolData.email;
    if (schoolData.principalName !== undefined) updateData.principal_name = schoolData.principalName;
    if (schoolData.studentCount !== undefined) updateData.student_count = schoolData.studentCount;
    if (schoolData.teacherCount !== undefined) updateData.teacher_count = schoolData.teacherCount;
    if (schoolData.type !== undefined) updateData.type = schoolData.type;
    if (schoolData.language !== undefined) updateData.language = schoolData.language;
    if (schoolData.adminEmail !== undefined) updateData.admin_email = schoolData.adminEmail;
    if (schoolData.status !== undefined) updateData.status = schoolData.status;
    if (schoolData.logo !== undefined) updateData.logo = schoolData.logo;
    if (schoolData.completionRate !== undefined) updateData.completion_rate = schoolData.completionRate;
    
    const { data: updatedSchool, error } = await supabase
      .from('schools')
      .update(updateData)
      .eq('id', schoolId)
      .select()
      .single();
      
    if (error) throw new Error(`Error updating school: ${error.message}`);
    
    return adaptSchoolData(updatedSchool);
  } catch (error) {
    throw error;
  }
};

export const deleteSchool = async (schoolId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('schools')
      .delete()
      .eq('id', schoolId);
      
    if (error) throw new Error(error.message);
    
    return true;
  } catch (error) {
    console.error("Error deleting school:", error);
    return false;
  }
};
