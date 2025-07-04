
import { School as SupabaseSchool, Region as SupabaseRegion, Sector as SupabaseSector } from '@/types/supabase';
import { School, Region, Sector } from '@/types/school';

export const adaptSchoolFromSupabase = (supabaseSchool: SupabaseSchool): School => {
  return {
    id: supabaseSchool.id || '',
    name: supabaseSchool.name || '',
    region_id: supabaseSchool.region_id || '',
    sector_id: supabaseSchool.sector_id || '',
    status: (supabaseSchool.status as 'active' | 'inactive') || 'active',
    created_at: supabaseSchool.created_at || new Date().toISOString(),
    updated_at: supabaseSchool.updated_at || new Date().toISOString(),
    address: supabaseSchool.address,
    phone: supabaseSchool.phone,
    email: supabaseSchool.email,
    principal_name: supabaseSchool.principal_name,
    student_count: supabaseSchool.student_count,
    teacher_count: supabaseSchool.teacher_count,
    type: supabaseSchool.type
  };
};

export const adaptSchoolsArrayFromSupabase = (supabaseSchools: SupabaseSchool[]): School[] => {
  return supabaseSchools.map(adaptSchoolFromSupabase);
};

export const adaptRegionFromSupabase = (supabaseRegion: SupabaseRegion): Region => {
  return {
    id: supabaseRegion.id || '',
    name: supabaseRegion.name || '',
    status: (supabaseRegion.status as 'active' | 'inactive') || 'active',
    created_at: supabaseRegion.created_at || new Date().toISOString(),
    updated_at: supabaseRegion.updated_at || new Date().toISOString(),
    description: supabaseRegion.description
  };
};

export const adaptRegionsArrayFromSupabase = (supabaseRegions: SupabaseRegion[]): Region[] => {
  return supabaseRegions.map(adaptRegionFromSupabase);
};

export const adaptSectorFromSupabase = (supabaseSector: SupabaseSector): Sector => {
  return {
    id: supabaseSector.id || '',
    name: supabaseSector.name || '',
    region_id: supabaseSector.region_id || '',
    status: (supabaseSector.status as 'active' | 'inactive') || 'active',
    created_at: supabaseSector.created_at || new Date().toISOString(),
    updated_at: supabaseSector.updated_at || new Date().toISOString(),
    description: supabaseSector.description
  };
};

export const adaptSectorsArrayFromSupabase = (supabaseSectors: SupabaseSector[]): Sector[] => {
  return supabaseSectors.map(adaptSectorFromSupabase);
};

// School to Supabase adapters
export const adaptSchoolToSupabase = (school: School): SupabaseSchool => {
  return {
    id: school.id || '',
    name: school.name,
    region_id: school.region_id,
    sector_id: school.sector_id,
    status: school.status,
    created_at: school.created_at || new Date().toISOString(),
    updated_at: school.updated_at || new Date().toISOString(),
    address: school.address,
    phone: school.phone,
    email: school.email,
    principal_name: school.principal_name,
    student_count: school.student_count,
    teacher_count: school.teacher_count,
    type: school.type
  };
};

export const adaptSchoolsArrayToSupabase = (schools: School[]): SupabaseSchool[] => {
  return schools.map(adaptSchoolToSupabase);
};

export const adaptRegionToSupabase = (region: Region): SupabaseRegion => {
  return {
    id: region.id,
    name: region.name,
    status: region.status,
    created_at: region.created_at || new Date().toISOString(),
    updated_at: region.updated_at || new Date().toISOString(),
    description: region.description
  };
};

export const adaptRegionsArrayToSupabase = (regions: Region[]): SupabaseRegion[] => {
  return regions.map(adaptRegionToSupabase);
};

export const adaptSectorToSupabase = (sector: Sector): SupabaseSector => {
  return {
    id: sector.id,
    name: sector.name,
    region_id: sector.region_id,
    status: sector.status,
    created_at: sector.created_at || new Date().toISOString(),
    updated_at: sector.updated_at || new Date().toISOString(),
    description: sector.description
  };
};

export const adaptSectorsArrayToSupabase = (sectors: Sector[]): SupabaseSector[] => {
  return sectors.map(adaptSectorToSupabase);
};
