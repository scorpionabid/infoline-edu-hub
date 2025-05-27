import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Admin məlumatları üçün interfeys
interface AdminUser {
  id: string;
  full_name?: string;
  email?: string;
}

export function useSchoolAdmins(schoolIds: string[]) {
  const [adminMap, setAdminMap] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!schoolIds.length) {
      console.log('SchoolIds siyahısı boşdur!');
      return;
    }
    
    console.log('Adminləri əldə etməyə başlayırıq...');
    
    async function fetchSchoolAdmins() {
      setIsLoading(true);
      try {
        console.log('Məktəb IDs:', schoolIds);
        
        // 1. Əvvəlcə user_roles cədvəlindən məktəb adminlərini əldə edirik
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select(`
            user_id,
            school_id,
            role,
            profiles:user_id(email, full_name)
          `)
          .eq('role', 'schooladmin')
          .in('school_id', schoolIds);
        
        console.log('Məktəb admin məlumatları (user_roles):', roleData);
        
        if (roleError) {
          console.error('user_roles sorgu xətası:', roleError);
          throw roleError;
        }
        
        if (!roleData || roleData.length === 0) {
          console.log('Məktəb adminləri tapılmadı, schools cədvəlindən birbaşa yüləməyə çalışırıq...');
          
          // 2. Əgər user_roles cədvəlində admin tapılmadısa, schools cədvəlindən admin məlumatlarını əldə etməyə çalışırıq
          const { data: schoolData, error: schoolError } = await supabase
            .from('schools')
            .select(`
              id, 
              admin_id,
              admin_email,
              adminProfile:admin_id(email, full_name)
            `)
            .in('id', schoolIds);
          
          console.log('Məktəb admin məlumatları (schools):', schoolData);
          
          if (schoolError) {
            console.error('schools sorgu xətası:', schoolError);
            throw schoolError;
          }
          
          // Schools cədvəlindən admin məlumatlarını map edirik
          const admins: {[key: string]: string} = {};
          
          if (schoolData && schoolData.length > 0) {
            schoolData.forEach(school => {
              const adminProfile = school.adminProfile as any;
              let adminName = '';
              
              if (adminProfile && (adminProfile.email || adminProfile.full_name)) {
                adminName = adminProfile.email || adminProfile.full_name;
              } else if (school.admin_email) {
                adminName = school.admin_email;
              } else {
                adminName = `Admin ID: ${school.admin_id || '-'}`;
              }
              
              admins[school.id] = adminName;
            });
          }
          
          setAdminMap(admins);
        } else {
          // 3. user_roles cədvəlindən admin məlumatlarını map edirik
          const admins: {[key: string]: string} = {};
          
          roleData.forEach(role => {
            const profile = role.profiles as any;
            let adminName = '';
            
            if (profile && (profile.email || profile.full_name)) {
              // Login üçün email-i göstəririk, çünki user login üçün email istifadə edir
              adminName = profile.email || profile.full_name;
            } else {
              adminName = `User ID: ${role.user_id || '-'}`;
            }
            
            admins[role.school_id] = adminName;
          });
          
          setAdminMap(admins);
        }
      } catch (err) {
        console.error('Məktəb adminləri əldə edilərkən xəta:', err);
        setError(err as Error);
        toast.error('Admin məlumatları yüklənərkən xəta: ' + (err as Error).message);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchSchoolAdmins();
  }, [schoolIds]);
  
  return { 
    adminMap, 
    isLoading, 
    error 
  };
}
        


export default useSchoolAdmins;
