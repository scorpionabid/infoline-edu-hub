
import { School as SupabaseSchool, Region as SupabaseRegion, Sector as SupabaseSector } from '@/types/supabase';
import { School as SchoolType, Region as RegionType, Sector as SectorType } from '@/types/school';

/**
 * Adapts a School object from supabase.d.ts format to school.ts format
 */
export function adaptSchoolFromSupabase(school: SupabaseSchool): SchoolType {
  return {
    ...school,
    status: school.status || 'active',
  } as SchoolType;
}

/**
 * Adapts a School object from school.ts format to supabase.d.ts format
 */
export function adaptSchoolToSupabase(school: SchoolType): SupabaseSchool {
  const { created_at, updated_at, ...rest } = school;
  
  return {
    ...rest,
    created_at: typeof created_at === 'string' ? created_at : created_at?.toISOString(),
    updated_at: typeof updated_at === 'string' ? updated_at : updated_at?.toISOString(),
  } as SupabaseSchool;
}

/**
 * Adapts a Region object from supabase.d.ts format to school.ts format
 */
export function adaptRegionFromSupabase(region: SupabaseRegion): RegionType {
  return {
    ...region,
    status: region.status || 'active',
  } as RegionType;
}

/**
 * Adapts a Region array from supabase.d.ts format to school.ts format
 */
export function adaptRegionsFromSupabase(regions: SupabaseRegion[]): RegionType[] {
  return regions.map(adaptRegionFromSupabase);
}

/**
 * Adapts a Sector object from supabase.d.ts format to school.ts format
 */
export function adaptSectorFromSupabase(sector: SupabaseSector): SectorType {
  return {
    ...sector,
    status: sector.status || 'active',
  } as SectorType;
}

/**
 * Adapts a Sector array from supabase.d.ts format to school.ts format
 */
export function adaptSectorsFromSupabase(sectors: SupabaseSector[]): SectorType[] {
  return sectors.map(adaptSectorFromSupabase);
}
