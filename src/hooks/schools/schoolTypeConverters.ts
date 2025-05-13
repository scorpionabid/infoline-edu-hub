
import { School, SchoolFormData } from '@/types/ui';

export const mapSchoolToFormData = (school: School): SchoolFormData => {
  return {
    id: school.id,
    name: school.name,
    address: school.address,
    phone: school.phone,
    email: school.email,
    region_id: school.region_id,
    sector_id: school.sector_id,
    status: school.status,
    principal_name: school.principal_name,
    logo: school.logo,
  };
};

export const mapFormDataToSchool = (formData: SchoolFormData, existingSchool?: School): School => {
  const now = new Date().toISOString();
  
  return {
    id: formData.id || existingSchool?.id || '',
    name: formData.name,
    address: formData.address,
    phone: formData.phone,
    email: formData.email,
    region_id: formData.region_id,
    sector_id: formData.sector_id,
    status: formData.status || 'active',
    created_at: existingSchool?.created_at || now,
    updated_at: now,
    principal_name: formData.principal_name,
    logo: formData.logo,
    region_name: existingSchool?.region_name || '',
    sector_name: existingSchool?.sector_name || '',
  };
};

export const mapApiDataToSchool = (apiData: any): School => {
  return {
    id: apiData.id || '',
    name: apiData.name || '',
    address: apiData.address || '',
    phone: apiData.phone || '',
    email: apiData.email || '',
    region_id: apiData.region_id || '',
    sector_id: apiData.sector_id || '',
    status: apiData.status || 'active',
    created_at: apiData.created_at || new Date().toISOString(),
    updated_at: apiData.updated_at || new Date().toISOString(),
    principal_name: apiData.principal_name || '',
    logo: apiData.logo || null,
    region_name: apiData.region_name || '',
    sector_name: apiData.sector_name || '',
  };
};

export const mapToMockSchool = (): School => {
  return {
    id: 'mock-' + Math.random().toString(36).substr(2, 9),
    name: 'New School',
    address: '',
    phone: '',
    email: '',
    region_id: '',
    sector_id: '',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    principal_name: '',
    logo: null,
    region_name: '',
    sector_name: '',
  };
};
