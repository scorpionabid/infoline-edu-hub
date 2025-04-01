
import { supabase } from '@/integrations/supabase/client';

/**
 * Region üçün admin email ünvanını əldə etmək üçün utilit funksiya
 * @param regionId Region ID
 * @returns Admin email və ya null
 */
export const fetchRegionAdminEmail = async (regionId: string): Promise<string | null> => {
  try {
    // Regionun admin_id-sini tapmağa çalışaq
    const { data: region, error: regionError } = await supabase
      .from('regions')
      .select('admin_id')
      .eq('id', regionId)
      .single();
    
    if (regionError || !region || !region.admin_id) {
      // admin_id yoxdur, user_roles cədvəlindən baxaq
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('region_id', regionId)
        .eq('role', 'regionadmin');
      
      if (rolesError || !roles || roles.length === 0) {
        console.log('Bu region üçün admin tapılmadı:', regionId);
        return null;
      }
      
      const userId = roles[0].user_id;
      
      // profiles cədvəlindən email-i yoxlayaq
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single();
        
      if (!profileError && profile && profile.email) {
        console.log('Profildən email tapıldı:', profile.email);
        return profile.email;
      }
      
      // Edge function vasitəsilə email əldə edək
      const { data, error } = await supabase.functions
        .invoke('region-operations', {
          body: { 
            action: 'get-admin-email',
            userId
          }
        });
      
      if (error || !data || !data.email) {
        console.error('Admin email ünvanını əldə etmə xətası:', error || 'Məlumat tapılmadı');
        return null;
      }
      
      console.log('Edge function-dan email alındı:', data.email);
      return data.email;
    } else {
      // admin_id var, bu istifadəçinin email-ini əldə edək
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', region.admin_id)
        .single();
        
      if (!profileError && profile && profile.email) {
        console.log('Profildən email tapıldı (admin_id ilə):', profile.email);
        return profile.email;
      }
      
      // Edge function vasitəsilə email əldə edək
      const { data, error } = await supabase.functions
        .invoke('region-operations', {
          body: { 
            action: 'get-admin-email',
            userId: region.admin_id
          }
        });
      
      if (error || !data || !data.email) {
        console.error('Admin email ünvanını əldə etmə xətası:', error || 'Məlumat tapılmadı');
        return null;
      }
      
      console.log('Edge function-dan email alındı (admin_id ilə):', data.email);
      return data.email;
    }
  } catch (error) {
    console.error('Region admin emaili əldə etmə xətası:', error);
    return null;
  }
};

/**
 * Region adminlərinin emaillərini əldə etmək üçün utilit funksiya
 * @param regionIds Region ID massivi
 * @returns Region ID -> admin email map obyekti
 */
export const fetchRegionAdminEmails = async (regions: any[]): Promise<Map<string, string>> => {
  const adminEmails = new Map<string, string>();
  
  // Profillərdən və user_roles ilişkilərindən admin e-poçtlarını əldə edək
  for (const region of regions) {
    try {
      // user_roles cədvəlindən regionun admin ID-sini əldə et
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'regionadmin')
        .eq('region_id', region.id)
        .limit(1);
      
      if (rolesError) {
        console.error(`Region ${region.id} üçün admin ID sorğusunda xəta:`, rolesError);
        continue;
      }
      
      if (!userRoles || userRoles.length === 0) {
        console.log(`Region ${region.id} üçün admin tapılmadı`);
        continue;
      }
      
      const adminId = userRoles[0].user_id;
      
      // Profiles cədvəlindən email məlumatını əldə et
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', adminId)
        .single();
      
      if (!profileError && profile && profile.email) {
        console.log(`Region ${region.id} üçün admin emaili tapıldı: ${profile.email}`);
        adminEmails.set(region.id, profile.email);
      } else {
        console.log(`Region ${region.id} üçün admin profili tapılmadı:`, profileError);
        
        // Auth cədvəlindən e-poçt əldə etmək üçün function çağırışı
        const { data, error } = await supabase.functions
          .invoke('region-operations', {
            body: { 
              action: 'get-admin-email',
              userId: adminId
            }
          });
        
        if (!error && data && data.email) {
          console.log(`Region ${region.id} üçün edge function ilə email alındı: ${data.email}`);
          adminEmails.set(region.id, data.email);
        } else {
          console.log(`Region ${region.id} üçün edge function ilə email alınamadı`);
        }
      }
    } catch (err) {
      console.error(`Region ${region.id} üçün admin email əldə edilməsi xətası:`, err);
    }
  }
  
  return adminEmails;
};
