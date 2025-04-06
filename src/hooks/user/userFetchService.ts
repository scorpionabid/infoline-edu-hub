
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/supabase';
import { fetchAdminEntityData, formatUserData } from './useUserData';

// Mövcud istifadəçiləri əldə etmək üçün servis
export async function fetchAvailableUsersService() {
  try {
    console.log('İstifadəçiləri əldə etmə servisində...');
    
    // 1. İstifadəçilərin rollarını əldə edək
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('*');
      
    if (roleError) {
      console.error('İstifadəçi rollarını əldə edərkən xəta:', roleError);
      return { 
        error: roleError,
        users: [] 
      };
    }
    
    // İstifadəçi rollarının tapılıb-tapılmadığını yoxlayaq
    if (!roleData || roleData.length === 0) {
      console.log('Heç bir istifadəçi rolu tapılmadı, auth istifadəçilərini yükləyirəm...');
      
      // İstifadəçi rolu tapılmadı - edge funksiyasını çağıraq
      const { data: authUsers, error: authError } = await supabase.functions.invoke(
        'get_all_users_with_roles'
      );
      
      if (authError) {
        console.error('Auth istifadəçilərini əldə edərkən xəta:', authError);
        return { 
          error: authError,
          users: [] 
        };
      }
      
      if (!authUsers || !authUsers.users || authUsers.users.length === 0) {
        console.log('Heç bir istifadəçi tapılmadı');
        return { users: [] };
      }
      
      console.log(`${authUsers.users.length} auth istifadəçi tapıldı`);
      
      // Əsas istifadəçi məlumatlarını formatlaşdıraq
      const basicUsers: FullUserData[] = authUsers.users.map(user => ({
        id: user.id,
        email: user.email || 'N/A',
        user_metadata: user.raw_user_meta_data || {},
        full_name: user.raw_user_meta_data?.full_name || user.email || 'İsimsiz istifadəçi',
        role: user.role || 'user',
        region_id: user.region_id,
        sector_id: user.sector_id,
        school_id: user.school_id,
        created_at: user.created_at,
        updated_at: user.updated_at,
        // App tərəfindən istifadə edilən sahələr
        name: user.raw_user_meta_data?.full_name || user.email || 'İsimsiz istifadəçi',
        regionId: user.region_id,
        sectorId: user.sector_id,
        schoolId: user.school_id,
        language: 'az',
        status: 'active',
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }));
      
      return { users: basicUsers };
    }
    
    console.log(`${roleData.length} istifadəçi rolu tapıldı`);
    
    // İstifadəçi ID-lərini toplayaq
    const userIds = roleData.map(role => role.user_id);
    
    // 2. Profil məlumatlarını əldə edək
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);
    
    if (profilesError) {
      return { 
        error: profilesError,
        users: [] 
      };
    }
    
    console.log(`${profilesData?.length || 0} profil tapıldı`);
    
    // 3. E-poçt məlumatlarını əldə edək
    const { data: emailsData, error: emailsError } = await supabase.rpc(
      'get_user_emails_by_ids',
      { user_ids: userIds }
    );
    
    if (emailsError) {
      return { 
        error: emailsError,
        users: [] 
      };
    }
    
    console.log(`${emailsData?.length || 0} email tapıldı`);
    
    // Profil məlumatlarını ID-yə görə map edək
    const profilesMap: Record<string, any> = {};
    if (profilesData) {
      profilesData.forEach(profile => {
        profilesMap[profile.id] = profile;
      });
    }
    
    // Email məlumatlarını ID-yə görə map edək
    const emailMap: Record<string, string> = {};
    if (emailsData) {
      emailsData.forEach((item: any) => {
        emailMap[item.id] = item.email;
      });
    }
    
    // Admin entity məlumatlarını əldə et
    const adminEntityPromises = roleData.map(async (role: any) => {
      const modifiedUser = { 
        ...role, 
        id: role.user_id,
        email: emailMap[role.user_id] || 'N/A'
      };
      return await fetchAdminEntityData(modifiedUser);
    });
    
    const adminEntities = await Promise.all(adminEntityPromises);
    
    // İstifadəçiləri formatlaşdıraq
    const formattedUsers = formatUserData(
      roleData.map(role => ({ ...role, id: role.user_id })), 
      profilesMap, 
      adminEntities
    );
    
    console.log(`${formattedUsers.length} istifadəçi formatlandı`);
    return { users: formattedUsers };
  } catch (err) {
    console.error('İstifadəçi sorğusu servisində xəta:', err);
    return { 
      error: err instanceof Error ? err : new Error('İstifadəçilər yüklənərkən xəta baş verdi'),
      users: [] 
    };
  }
}
