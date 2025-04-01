
import { supabase } from '@/integrations/supabase/client';

/**
 * Region üçün admin email ünvanını əldə etmək üçün utilit funksiya
 * @param regionId Region ID
 * @returns Admin email və ya null
 */
export const fetchRegionAdminEmail = async (regionId: string): Promise<string | null> => {
  try {
    // Birbaşa sorğu ilə regionun admin_id-sini tapmağa çalışaq
    const { data: region, error: regionError } = await supabase
      .from('regions')
      .select('admin_id')
      .eq('id', regionId)
      .single();
    
    if (!regionError && region && region.admin_id) {
      // admin_id var, profiles cədvəlindən email-i yoxlayaq
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', region.admin_id)
        .single();
        
      if (!profileError && profile && profile.email) {
        console.log(`Region ${regionId} üçün admin emaili tapıldı (admin_id ilə):`, profile.email);
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
      
      if (!error && data && data.email) {
        console.log(`Region ${regionId} üçün edge function ilə email alındı:`, data.email);
        return data.email;
      }
    }
    
    // admin_id yoxdursa, user_roles cədvəlindən baxaq
    // Birbaşa regionadmin rolunu axtaraq
    const { data: admins, error: adminsError } = await supabase
      .from('profiles')
      .select('id, email, user_roles!inner(role, region_id)')
      .eq('user_roles.role', 'regionadmin')
      .eq('user_roles.region_id', regionId)
      .limit(1);
    
    if (!adminsError && admins && admins.length > 0) {
      const adminEmail = admins[0].email;
      if (adminEmail) {
        console.log(`Region ${regionId} üçün profiles və user_roles cədvəlindən email tapıldı:`, adminEmail);
        return adminEmail;
      }
    }
      
    console.log(`Region ${regionId} üçün admin tapılmadı`);
    return null;
  } catch (error) {
    console.error('Region admin emaili əldə etmə xətası:', error);
    return null;
  }
};

/**
 * Region adminlərinin emaillərini əldə etmək üçün utilit funksiya
 * @param regions Region obyektləri massivi
 * @returns Region ID -> admin email map obyekti
 */
export const fetchRegionAdminEmails = async (regions: any[]): Promise<Map<string, string>> => {
  const adminEmails = new Map<string, string>();
  
  try {
    // Əvvəlcə bütün regionlar üçün sorğunu bir dəfəyə edirik
    const regionIds = regions.map(r => r.id);
    
    // Profiles və user_roles cədvəllərini join edib email məlumatlarını əldə edək
    const { data: admins, error: adminsError } = await supabase
      .from('profiles')
      .select('id, email, user_roles!inner(role, region_id)')
      .eq('user_roles.role', 'regionadmin')
      .in('user_roles.region_id', regionIds);
    
    if (!adminsError && admins && admins.length > 0) {
      // Adminləri region_id ilə map edək
      for (const admin of admins) {
        if (admin.email && admin.user_roles && admin.user_roles.length > 0) {
          const regionId = admin.user_roles[0].region_id;
          if (regionId) {
            adminEmails.set(regionId, admin.email);
            console.log(`Region ${regionId} üçün admin emaili tapıldı: ${admin.email}`);
          }
        }
      }
    }
    
    // Hələ də email-i tapılmayan regionlar üçün tək-tək yoxlayaq
    for (const region of regions) {
      if (!adminEmails.has(region.id)) {
        const email = await fetchRegionAdminEmail(region.id);
        if (email) {
          adminEmails.set(region.id, email);
        }
      }
    }
  } catch (err) {
    console.error('Region adminlərinin emaillərini əldə etmə xətası:', err);
  }
  
  return adminEmails;
};
