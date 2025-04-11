
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
  status: 'active' | 'inactive';
  type: string;
  language: string;
  adminEmail: string;
}

export const mapToMockSchool = (school: SupabaseSchool): MappedSchool => {
  return {
    id: school.id,
    name: school.name,
    principalName: school.principalName || school.principal_name || '',
    address: school.address || '',
    regionId: school.regionId || school.region_id || '',
    sectorId: school.sectorId || school.sector_id || '',
    phone: school.phone || '',
    email: school.email || '',
    studentCount: school.studentCount || school.student_count || 0,
    teacherCount: school.teacherCount || school.teacher_count || 0,
    status: (school.status as 'active' | 'inactive') || 'active',
    type: school.type || '',
    language: school.language || '',
    adminEmail: school.adminEmail || school.admin_email || ''
  };
};

export const convertToSchoolType = (school: SupabaseSchool): School => {
  return {
    id: school.id,
    name: school.name,
    principalName: school.principalName || school.principal_name || '',
    address: school.address || '',
    regionId: school.regionId || school.region_id || '',
    sectorId: school.sectorId || school.sector_id || '',
    phone: school.phone || '',
    email: school.email || '',
    studentCount: school.studentCount || school.student_count || 0,
    teacherCount: school.teacherCount || school.teacher_count || 0,
    status: (school.status as 'active' | 'inactive') || 'active',
    type: school.type || '',
    language: school.language || '',
    createdAt: school.createdAt || school.created_at,
    completionRate: school.completionRate || school.completion_rate,
    region: '',
    sector: '',
    logo: school.logo || '',
    adminEmail: school.adminEmail || school.admin_email || ''
  };
};
