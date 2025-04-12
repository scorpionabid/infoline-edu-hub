
import { supabase } from '@/integrations/supabase/client';
import { PermissionLevel, PermissionCheckResult } from './permissionTypes';
import { UserRole } from '@/types/supabase';

/**
 * İstifadəçinin region üzərində hüququ olduğunu yoxlayır
 * @param userId İstifadəçi ID
 * @param regionId Region ID
 * @param level Hüquq səviyyəsi
 * @returns Boolean
 */
export async function checkRegionAccess(
  userId: string,
  regionId: string,
  level: PermissionLevel = 'read'
): Promise<boolean> {
  try {
    // SuperAdmin-in tam hüquqları var
    const isSuperAdmin = await checkSuperAdmin(userId);
    if (isSuperAdmin) return true;

    // RegionAdmin yoxlama
    if (level === 'read' || level === 'write') {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role, region_id')
        .eq('user_id', userId)
        .eq('role', 'regionadmin')
        .eq('region_id', regionId)
        .single();

      if (error) {
        console.error('Region hüquq yoxlaması zamanı xəta:', error);
        return false;
      }

      return !!data;
    }

    return false;
  } catch (error) {
    console.error('Region hüquq yoxlaması zamanı xəta:', error);
    return false;
  }
}

/**
 * İstifadəçinin sektor üzərində hüququ olduğunu yoxlayır
 * @param userId İstifadəçi ID
 * @param sectorId Sektor ID
 * @param level Hüquq səviyyəsi
 * @returns Boolean
 */
export async function checkSectorAccess(
  userId: string,
  sectorId: string,
  level: PermissionLevel = 'read'
): Promise<boolean> {
  try {
    // SuperAdmin-in tam hüquqları var
    const isSuperAdmin = await checkSuperAdmin(userId);
    if (isSuperAdmin) return true;

    // Sektorun region ID-sini əldə et
    const { data: sectorData, error: sectorError } = await supabase
      .from('sectors')
      .select('region_id')
      .eq('id', sectorId)
      .single();

    if (sectorError || !sectorData) {
      console.error('Sektor məlumatlarının əldə edilməsi zamanı xəta:', sectorError);
      return false;
    }

    // RegionAdmin yoxlama (regionun bütün sektorlarına giriş hüququ var)
    const { data: regionAdminData, error: regionAdminError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'regionadmin')
      .eq('region_id', sectorData.region_id)
      .single();

    if (regionAdminData) return true;

    // SectorAdmin yoxlama
    if (level === 'read' || level === 'write') {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role, sector_id')
        .eq('user_id', userId)
        .eq('role', 'sectoradmin')
        .eq('sector_id', sectorId)
        .single();

      if (error) {
        console.error('Sektor hüquq yoxlaması zamanı xəta:', error);
        return false;
      }

      return !!data;
    }

    return false;
  } catch (error) {
    console.error('Sektor hüquq yoxlaması zamanı xəta:', error);
    return false;
  }
}

/**
 * İstifadəçinin məktəb üzərində hüququ olduğunu yoxlayır
 * @param userId İstifadəçi ID
 * @param schoolId Məktəb ID
 * @param level Hüquq səviyyəsi
 * @returns Boolean
 */
export async function checkSchoolAccess(
  userId: string,
  schoolId: string,
  level: PermissionLevel = 'read'
): Promise<boolean> {
  try {
    // SuperAdmin-in tam hüquqları var
    const isSuperAdmin = await checkSuperAdmin(userId);
    if (isSuperAdmin) return true;

    // Məktəbin region və sektor ID-sini əldə et
    const { data: schoolData, error: schoolError } = await supabase
      .from('schools')
      .select('region_id, sector_id')
      .eq('id', schoolId)
      .single();

    if (schoolError || !schoolData) {
      console.error('Məktəb məlumatlarının əldə edilməsi zamanı xəta:', schoolError);
      return false;
    }

    // RegionAdmin yoxlama (regionun bütün məktəblərinə giriş hüququ var)
    const { data: regionAdminData, error: regionAdminError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'regionadmin')
      .eq('region_id', schoolData.region_id)
      .single();

    if (regionAdminData) return true;

    // SectorAdmin yoxlama (sektorun bütün məktəblərinə giriş hüququ var)
    const { data: sectorAdminData, error: sectorAdminError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'sectoradmin')
      .eq('sector_id', schoolData.sector_id)
      .single();

    if (sectorAdminData) return true;

    // SchoolAdmin yoxlama
    if (level === 'read' || level === 'write') {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role, school_id')
        .eq('user_id', userId)
        .eq('role', 'schooladmin')
        .eq('school_id', schoolId)
        .single();

      if (error) {
        console.error('Məktəb hüquq yoxlaması zamanı xəta:', error);
        return false;
      }

      return !!data;
    }

    return false;
  } catch (error) {
    console.error('Məktəb hüquq yoxlaması zamanı xəta:', error);
    return false;
  }
}

/**
 * İstifadəçinin SuperAdmin olub-olmadığını yoxlayır
 * @param userId İstifadəçi ID
 * @returns Boolean
 */
export async function checkSuperAdmin(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'superadmin')
      .single();

    if (error) {
      // no-match error qeyd edilmir, çünki bu gözlənilən nəticə ola bilər
      if (error.code !== 'PGRST116') {
        console.error('SuperAdmin hüquq yoxlaması zamanı xəta:', error);
      }
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('SuperAdmin hüquq yoxlaması zamanı xəta:', error);
    return false;
  }
}

/**
 * İstifadəçinin RegionAdmin olub-olmadığını yoxlayır
 * @param userId İstifadəçi ID
 * @returns Boolean
 */
export async function checkRegionAdmin(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'regionadmin')
      .single();

    if (error) {
      if (error.code !== 'PGRST116') {
        console.error('RegionAdmin hüquq yoxlaması zamanı xəta:', error);
      }
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('RegionAdmin hüquq yoxlaması zamanı xəta:', error);
    return false;
  }
}

/**
 * İstifadəçinin kateqoriya üzərində hüququ olduğunu yoxlayır
 * @param userId İstifadəçi ID
 * @param categoryId Kateqoriya ID
 * @param level Hüquq səviyyəsi
 * @returns Boolean
 */
export async function checkCategoryAccess(
  userId: string,
  categoryId: string,
  level: PermissionLevel = 'read'
): Promise<boolean> {
  try {
    // SuperAdmin və RegionAdmin-in tam hüquqları var
    const isSuperAdmin = await checkSuperAdmin(userId);
    if (isSuperAdmin) return true;

    const isRegionAdmin = await checkRegionAdmin(userId);
    if (isRegionAdmin && (level === 'read' || level === 'write')) return true;

    // SectorAdmin yalnız oxuma hüququna malikdir
    if (level === 'read') {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'sectoradmin')
        .single();

      if (data) return true;
    }

    return false;
  } catch (error) {
    console.error('Kateqoriya hüquq yoxlaması zamanı xəta:', error);
    return false;
  }
}

/**
 * İstifadəçinin sütun üzərində hüququ olduğunu yoxlayır
 * @param userId İstifadəçi ID
 * @param columnId Sütun ID
 * @param level Hüquq səviyyəsi
 * @returns Boolean
 */
export async function checkColumnAccess(
  userId: string,
  columnId: string,
  level: PermissionLevel = 'read'
): Promise<boolean> {
  // Sütunlar kateqoriyalara bağlı olduğundan, kateqoriya hüquqları ilə eyni yoxlama aparılır
  try {
    // SuperAdmin və RegionAdmin-in tam hüquqları var
    const isSuperAdmin = await checkSuperAdmin(userId);
    if (isSuperAdmin) return true;

    const isRegionAdmin = await checkRegionAdmin(userId);
    if (isRegionAdmin && (level === 'read' || level === 'write')) return true;

    // SectorAdmin yalnız oxuma hüququna malikdir
    if (level === 'read') {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'sectoradmin')
        .single();

      if (data) return true;
    }

    return false;
  } catch (error) {
    console.error('Sütun hüquq yoxlaması zamanı xəta:', error);
    return false;
  }
}

/**
 * İstifadəçinin rolunu qaytarır
 * @param userId İstifadəçi ID
 * @returns UserRole | undefined
 */
export async function getUserRole(userId: string): Promise<UserRole | undefined> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('İstifadəçi rolu əldə edilərkən xəta:', error);
      return undefined;
    }

    return data.role as UserRole;
  } catch (error) {
    console.error('İstifadəçi rolu əldə edilərkən xəta:', error);
    return undefined;
  }
}
