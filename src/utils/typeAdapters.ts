
import { School as SupabaseSchool, Region as SupabaseRegion, Sector as SupabaseSector } from '@/types/supabase';
import { School, Region, Sector } from '@/types/school';

export const adaptSchoolFromSupabase = (school: SupabaseSchool): School => {
  return {
    ...school,
    status: (school.status === 'active' || school.status === 'inactive') ? school.status : 'active',
    created_at: school.created_at || new Date().toISOString(),
    updated_at: school.updated_at || new Date().toISOString()
  } as School;
};

export const adaptRegionFromSupabase = (region: SupabaseRegion): Region => {
  return {
    ...region,
    status: (region.status === 'active' || region.status === 'inactive') ? region.status : 'active'
  } as Region;
};

export const adaptSectorFromSupabase = (sector: SupabaseSector): Sector => {
  return {
    ...sector,
    status: (sector.status === 'active' || sector.status === 'inactive') ? sector.status : 'active'
  } as Sector;
};

export const adaptSchoolsArrayFromSupabase = (schools: SupabaseSchool[]): School[] => {
  return schools.map(adaptSchoolFromSupabase);
};

export const adaptRegionsArrayFromSupabase = (regions: SupabaseRegion[]): Region[] => {
  return regions.map(adaptRegionFromSupabase);
};

export const adaptSectorsArrayFromSupabase = (sectors: SupabaseSector[]): Sector[] => {
  return sectors.map(adaptSectorFromSupabase);
};
