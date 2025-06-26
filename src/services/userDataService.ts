
/**
 * Mərkəzləşdirilmiş istifadəçi məlumatları xidməti
 * Bütün istifadəçi məlumatları sorğuları bu servis vasitəsilə edilir
 */

import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData, UserRole } from '@/types/supabase';

// Simple cache implementation since the main cache module has issues
const cache = new Map<string, { data: any; expiry: number }>();
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

const getCache = <T>(key: string): T | null => {
  const cached = cache.get(key);
  if (cached && cached.expiry > Date.now()) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCache = <T>(key: string, data: T): void => {
  cache.set(key, {
    data,
    expiry: Date.now() + CACHE_EXPIRY_MS
  });
};

// Anti-loop məntiqini əlavə edək
const EVENT_THROTTLE_MS = 500;
let lastFetchTime = 0;
let lastFetchedUserId: string | null = null;

/**
 * İstifadəçi məlumatlarını əldə etmək
 */
export async function fetchUserData(
  userId: string,
  sessionData: Session,
  forceRefresh = false
): Promise<FullUserData | null> {
  try {
    // Throttling - eyni istifadəçi üçün tez-tez sorğuları məhdudlaşdırırıq
    const now = Date.now();
    if (
      !forceRefresh &&
      lastFetchedUserId === userId &&
      now - lastFetchTime < EVENT_THROTTLE_MS
    ) {
      console.log('Throttling user data fetch request');
      return null;
    }

    // Əvvəlcə keşdən yoxlayırıq
    if (!forceRefresh) {
      const cachedUser = getCache<FullUserData>(`user_profile_${userId}`);
      if (cachedUser && cachedUser.id === userId) {
        console.log('Using cached user data');
        return cachedUser;
      }
    }

    // Tokeni yeniləyirik
    try {
      await supabase.auth.setSession({
        access_token: sessionData.access_token,
        refresh_token: sessionData.refresh_token || ''
      });
    } catch (e) {
      console.warn('Session token update failed:', e);
    }

    // Əvvəlcə RPC metodu ilə cəhd edirik (daha effektivdir)
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_user_with_role', {
      user_id_param: userId
    });

    // RPC metodu uğurlu oldusa, ondan istifadə edirik
    if (!rpcError && rpcData) {
      const userData: FullUserData = {
        id: userId,
        email: sessionData.user.email || '',
        role: rpcData.role || ('user' as UserRole),
        region_id: rpcData.region_id,
        sector_id: rpcData.sector_id,
        school_id: rpcData.school_id,
        regionId: rpcData.region_id,
        sectorId: rpcData.sector_id,
        schoolId: rpcData.school_id,
        name: rpcData.full_name || '',
        full_name: rpcData.full_name || '',
        avatar: rpcData.avatar || '',
        phone: rpcData.phone || '',
        position: rpcData.position || '',
        language: rpcData.language || 'az',
        status: rpcData.status || 'active',
        lastLogin: rpcData.last_login || null,
        last_login: rpcData.last_login || null,
        createdAt: rpcData.created_at || new Date().toISOString(),
        updatedAt: rpcData.updated_at || new Date().toISOString(),
        created_at: rpcData.created_at || new Date().toISOString(),
        updated_at: rpcData.updated_at || new Date().toISOString()
      };

      // Keşləmə məlumatlarını yeniləyirik
      lastFetchedUserId = userId;
      lastFetchTime = now;
      
      // Keşdə saxlayırıq
      setCache(`user_profile_${userId}`, userData);
      
      return userData;
    }
    
    console.warn('RPC method failed, falling back to direct queries:', rpcError);

    // Parallel olaraq user_roles və profile əldə edirik
    const [roleResult, profileResult] = await Promise.all([
      supabase
        .from('user_roles')
        .select('role, region_id, sector_id, school_id')
        .eq('user_id', userId)
        .maybeSingle(),
        
      supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()
    ]);

    // User role məlumatlarını alırıq
    const userRole = roleResult.data?.role || ('user' as UserRole);
    const regionId = roleResult.data?.region_id;
    const sectorId = roleResult.data?.sector_id;
    const schoolId = roleResult.data?.school_id;
    
    // Profile məlumatları
    let profile = profileResult.data;
    
    // Əgər profil tapılmadısa, yaradaq
    if (!profile) {
      try {
        const { data: newProfile } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: sessionData.user.email,
            full_name: sessionData.user.email?.split('@')[0] || 'İstifadəçi',
            language: 'az',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
          
        profile = newProfile;
      } catch (e) {
        console.error('Profile creation failed:', e);
        // Default profil yaradırıq əgər yaratma əməliyyatı uğursuz olsa
        profile = {
          id: userId,
          email: sessionData.user.email,
          full_name: sessionData.user.email?.split('@')[0] || 'İstifadəçi',
          language: 'az',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
    }

    // İstifadəçi məlumatlarını birləşdiririk
    const userData: FullUserData = {
      id: userId,
      email: sessionData.user.email || '',
      role: userRole,
      region_id: regionId,
      sector_id: sectorId,
      school_id: schoolId,
      regionId: regionId,
      sectorId: sectorId,
      schoolId: schoolId,
      name: profile?.full_name || '',
      full_name: profile?.full_name || '',
      avatar: profile?.avatar || '',
      phone: profile?.phone || '',
      position: profile?.position || '',
      language: profile?.language || 'az',
      status: profile?.status || 'active',
      lastLogin: profile?.last_login || null,
      last_login: profile?.last_login || null,
      createdAt: profile?.created_at || new Date().toISOString(),
      updatedAt: profile?.updated_at || new Date().toISOString(),
      created_at: profile?.created_at || new Date().toISOString(),
      updated_at: profile?.updated_at || new Date().toISOString()
    };

    // Keşləmə məlumatlarını yeniləyirik
    lastFetchedUserId = userId;
    lastFetchTime = now;
    
    // Keşdə saxlayırıq
    setCache(`user_profile_${userId}`, userData);
    
    return userData;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

/**
 * İstifadəçi profilini yeniləmək
 * @param userId İstifadəçi ID-si
 * @param updates Yenilənəcək məlumatlar
 * @returns Əməliyyatın uğurlu olub-olmadığı
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<FullUserData>
): Promise<boolean> {
  try {
    // Yeniləmək üçün məlumatları hazırlayırıq
    const updateData = {
      full_name: updates.full_name,
      phone: updates.phone,
      position: updates.position,
      language: updates.language,
      avatar: updates.avatar,
      updated_at: new Date().toISOString()
    };
    
    // Profili yeniləyirik
    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);
      
    if (error) {
      console.error('Profile update error:', error);
      return false;
    }
    
    // Keşi yeniləyirik
    const cachedUser = getCache<FullUserData>(`user_profile_${userId}`);
    if (cachedUser && cachedUser.id === userId) {
      setCache(`user_profile_${userId}`, {
        ...cachedUser,
        ...updates
      });
    }
    
    return true;
  } catch (err) {
    console.error('Profile update exception:', err);
    return false;
  }
}

/**
 * İstifadəçi yaratmaq
 * @param userData İstifadəçi məlumatları
 * @returns Əməliyyat nəticəsi
 */
export async function createUser(userData: {
  email: string;
  password: string;
  full_name: string;
  role: string;
  region_id?: string | null;
  sector_id?: string | null;
  school_id?: string | null;
  phone?: string | null;
  position?: string | null;
  language?: string;
}): Promise<{ data: any; error: any }> {
  try {
    // Edge Function çağırırıq
    const { data, error } = await supabase.functions.invoke('create-user', {
      body: {
        email: userData.email,
        password: userData.password,
        full_name: userData.full_name,
        role: userData.role,
        region_id: userData.region_id || null,
        sector_id: userData.sector_id || null,
        school_id: userData.school_id || null,
        phone: userData.phone || null,
        position: userData.position || null,
        language: userData.language || 'az'
      }
    });
    
    if (error) {
      console.error('User creation error:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('User creation exception:', err);
    return { data: null, error: err };
  }
}

/**
 * Rolları normallaşdırmaq
 */
export function normalizeRole(role: string): UserRole {
  // Kiçik hərflərə çeviririk və boşluqları silirik
  const normalizedRole = role.toLowerCase().trim().replace(/\s+/g, '');
  
  // Standart rol adları
  const standardRoles: UserRole[] = ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin', 'user'];
  
  // Əgər rol standart rollardan birinə uyğundursa, onu qaytarırıq
  for (const stdRole of standardRoles) {
    if (normalizedRole === stdRole || normalizedRole.includes(stdRole)) {
      return stdRole;
    }
  }
  
  // Default olaraq user qaytarırıq
  return 'user' as UserRole;
}

/**
 * Rol massivini normallaşdırmaq
 */
export function normalizeRoleArray(roles: string[]): UserRole[] {
  return roles.map(normalizeRole).filter((role, index, self) => self.indexOf(role) === index);
}
