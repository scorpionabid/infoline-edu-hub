
import { supabase } from '@/integrations/supabase/client';

/**
 * Region üçün admin email ünvanını əldə etmək üçün utilit funksiya
 * @param regionId Region ID
 * @returns Admin email və ya null
 */
export const fetchRegionAdminEmail = async (regionId: string): Promise<string | null> => {
  try {
    // Birbaşa regiona aid metadatadan admin_id-sini tapmağa çalışaq
    const { data: region, error: regionError } = await supabase
      .from('regions')
      .select('admin_id')
      .eq('id', regionId)
      .single();
    
    if (!regionError && region && region.admin_id) {
      // admin_id var, auth.users-dən email-i yoxlayaq
      try {
        const { data: authData } = await supabase.functions
          .invoke('user-email', {
            body: { 
              userId: region.admin_id
            }
          });
          
        if (authData && authData.email) {
          console.log(`Region ${regionId} üçün admin emaili tapıldı (edge function ilə):`, authData.email);
          return authData.email;
        }
      } catch (edgeError) {
        console.error('Edge function xətası:', edgeError);
      }
    }
    
    // Auth metadatasından istifadə edək - direct user_roles cədvəlini sorğu etmədən
    // RLS policy rekursiyasını aradan qaldırır
    const { data: authUsers, error: authError } = await supabase.auth
      .admin.listUsers({
        // Saytda görüntülənəcək məlumat sayı məhdud olduğu üçün
        // ilk 20 nəticə kifayət edir
        perPage: 20
      });
    
    if (!authError && authUsers) {
      // Auth metadatadan regionadmin rolu və müvafiq region_id-ni axtaraq
      const adminUser = authUsers.users.find(user => 
        user.user_metadata?.role === 'regionadmin' && 
        user.user_metadata?.region_id === regionId
      );
      
      if (adminUser && adminUser.email) {
        console.log(`Region ${regionId} üçün admin emaili auth metadatasında tapıldı:`, adminUser.email);
        return adminUser.email;
      }
    }
    
    // Əgər heç bir yolla tapa bilmədiksə
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
    // Əvvəlcə auth.users-dən metadatasında regionadmins olan istifadəçiləri tapaq
    const { data: authUsers, error: authError } = await supabase.auth
      .admin.listUsers({
        perPage: 50  // Maximum regionadmin sayına əsaslanan limit
      });
    
    if (!authError && authUsers) {
      // Auth metadatadan regionadmin rolunda olan istifadəçiləri seçək
      const regionAdmins = authUsers.users.filter(user => 
        user.user_metadata?.role === 'regionadmin' && 
        user.user_metadata?.region_id
      );
      
      // Region ID -> email map yaradaq
      for (const admin of regionAdmins) {
        if (admin.email && admin.user_metadata?.region_id) {
          const regionId = admin.user_metadata.region_id as string;
          adminEmails.set(regionId, admin.email);
          console.log(`Auth metadatasından: Region ${regionId} üçün admin emaili: ${admin.email}`);
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
