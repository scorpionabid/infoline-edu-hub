
import { School } from '@/types/ui';

/**
 * Map database school object to UI School object
 * @param dbSchool - School object from database
 * @returns School object for UI
 */
export const mapDbSchoolToUiSchool = (dbSchool: any): School => {
  return {
    id: dbSchool.id,
    name: dbSchool.name,
    address: dbSchool.address || '',
    phone: dbSchool.phone || '',
    email: dbSchool.email || '',
    region_id: dbSchool.region_id || '',
    sector_id: dbSchool.sector_id || '',
    status: dbSchool.status || 'active',
    created_at: dbSchool.created_at || '',
    updated_at: dbSchool.updated_at || '',
    principal_name: dbSchool.principal_name || '',
    logo: dbSchool.logo || null,
    region_name: dbSchool.region_name || '',
    sector_name: dbSchool.sector_name || ''
  };
};

/**
 * Map UI School object to database school object format
 * @param uiSchool - School object from UI
 * @returns School object for database
 */
export const mapUiSchoolToDbSchool = (uiSchool: School): any => {
  const { region_name, sector_name, ...dbSchool } = uiSchool;
  return dbSchool;
};

/**
 * Create a mock school object for testing
 * @returns Mock school object
 */
export const mapToMockSchool = (): School => {
  return {
    id: 'mock-id',
    name: 'Mock School',
    address: 'Mock Address',
    phone: '123456789',
    email: 'mock@school.com',
    region_id: 'mock-region-id',
    sector_id: 'mock-sector-id',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    principal_name: 'Mock Principal',
    logo: null,
    region_name: 'Mock Region',
    sector_name: 'Mock Sector'
  };
};

export const formatSchoolSelectOptions = (schools: School[]) => {
  return schools.map(school => ({
    value: school.id,
    label: school.name
  }));
};
