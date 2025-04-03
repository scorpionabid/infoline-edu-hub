
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/supabase';

export async function fetchUserData(userId: string): Promise<FullUserData | null> {
  try {
    // Profil məlumatlarını əldə etmək
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      throw profileError;
    }

    if (!profileData) {
      console.error('No user profile found');
      return null;
    }

    // İstifadəçi rollarını əldə etmək
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId);

    if (rolesError) {
      console.error('Error fetching user roles:', rolesError);
    }

    // Əgər istifadəçi rol məlumatları varsa, onları emal edirik
    let role = 'user'; // Default rol
    let regionId = null;
    let sectorId = null;
    let schoolId = null;

    if (userRoles && userRoles.length > 0) {
      const userRole = userRoles[0];
      role = userRole.role || 'user';
      regionId = userRole.region_id || null;
      sectorId = userRole.sector_id || null;
      schoolId = userRole.school_id || null;
    }

    // Tam istifadəçi məlumatlarını qaytarırıq
    const userData: FullUserData = {
      id: profileData.id,
      email: profileData.email,
      full_name: profileData.full_name,
      name: profileData.full_name, // Legacy üçün əlavə edilib
      role: role as any, // Type cast
      region_id: regionId,
      sector_id: sectorId,
      school_id: schoolId,
      phone: profileData.phone || null,
      position: profileData.position || null,
      language: profileData.language || 'az',
      status: profileData.status || 'active',
      avatar: profileData.avatar || null,
      last_login: profileData.last_login || null,
      created_at: profileData.created_at,
      updated_at: profileData.updated_at,
      regionId: regionId,  // Legacy uyğunluq üçün
      sectorId: sectorId,  // Legacy uyğunluq üçün
      schoolId: schoolId,  // Legacy uyğunluq üçün
      createdAt: profileData.created_at,  // Legacy uyğunluq üçün
      updatedAt: profileData.updated_at,  // Legacy uyğunluq üçün
      lastLogin: profileData.last_login  // Legacy uyğunluq üçün
    };

    return userData;
  } catch (error) {
    console.error('Error in fetchUserData:', error);
    return null;
  }
}

// fetchUserData funksiyasını getUserData adı ilə də ixrac edirik ki, 
// mövcud koda uyğun olsun
export const getUserData = fetchUserData;
