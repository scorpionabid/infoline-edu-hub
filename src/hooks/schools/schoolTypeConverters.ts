
import { School } from '@/types/ui';

/**
 * Converts raw database/Supabase school data to our School type
 */
export function convertToSchool(data: any): School {
  return {
    id: data.id,
    name: data.name,
    address: data.address,
    phone: data.phone,
    email: data.email,
    region_id: data.region_id,
    sector_id: data.sector_id,
    status: data.status || 'active',
    created_at: data.created_at,
    updated_at: data.updated_at,
    principal_name: data.principal_name,
    logo: data.logo || null
  };
}

/**
 * Converts an array of raw school data from Supabase to School type
 */
export function convertToSchools(data: any[]): School[] {
  if (!Array.isArray(data)) {
    console.warn('Invalid data passed to convertToSchools, expected array');
    return [];
  }
  
  return data.map(convertToSchool);
}

/**
 * Enriches a school object with additional data like region name, sector name, etc.
 */
export function enrichSchool(school: School, regions: any[], sectors: any[]): School {
  const enriched = { ...school };
  
  // Add region name if region_id exists
  if (school.region_id && regions && Array.isArray(regions)) {
    const region = regions.find(r => r.id === school.region_id);
    if (region) {
      enriched.region_name = region.name;
    }
  }
  
  // Add sector name if sector_id exists
  if (school.sector_id && sectors && Array.isArray(sectors)) {
    const sector = sectors.find(s => s.id === school.sector_id);
    if (sector) {
      enriched.sector_name = sector.name;
    }
  }
  
  // Ensure logo is properly set or null
  if (!enriched.logo) {
    enriched.logo = null;
  }
  
  return enriched;
}

/**
 * Prepare school data for API requests
 */
export function prepareSchoolForApi(school: Partial<School>) {
  // Remove any properties that shouldn't be sent to the API
  const { region_name, sector_name, ...apiData } = school as any;
  
  return apiData;
}
