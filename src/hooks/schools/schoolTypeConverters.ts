
import { School } from '@/data/schoolsData';
import { School as SupabaseSchool } from '@/types/supabase';

export interface MappedSchool {
  id: string;
  name: string;
  principalName: string;
  address: string;
  regionId: string;
  sectorId: string;
  phone: string;
  email: string;
  studentCount: number;
  teacherCount: number;
  status: string;
  type: string;
  language: string;
  adminEmail: string;
}

export const mapToMockSchool = (school: SupabaseSchool): MappedSchool => {
  return {
    id: school.id,
    name: school.name,
    principalName: school.principal_name || '',
    address: school.address || '',
    regionId: school.region_id,
    sectorId: school.sector_id,
    phone: school.phone || '',
    email: school.email || '',
    studentCount: school.student_count || 0,
    teacherCount: school.teacher_count || 0,
    status: school.status || 'active',
    type: school.type || '',
    language: school.language || '',
    adminEmail: school.admin_email || ''
  };
};

export const convertToSchoolType = (school: SupabaseSchool): School => {
  return {
    id: school.id,
    name: school.name,
    principalName: school.principal_name || '',
    address: school.address || '',
    regionId: school.region_id,
    sectorId: school.sector_id,
    phone: school.phone || '',
    email: school.email || '',
    studentCount: school.student_count || 0,
    teacherCount: school.teacher_count || 0,
    status: school.status || 'active',
    type: school.type || '',
    language: school.language || '',
    createdAt: school.created_at,
    completionRate: school.completion_rate,
    region: '',
    sector: '',
    logo: school.logo || '',
    adminEmail: school.admin_email || ''
  };
};
