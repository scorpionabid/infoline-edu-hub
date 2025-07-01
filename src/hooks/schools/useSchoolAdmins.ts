import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  
  // Loop-u önləmək üçün ref istifadə edirik
  const prevSchoolIdsRef = useRef<string>('');
  const isFetchingRef = useRef(false);

  useEffect(() => {
    const schoolIdsString = schoolIds.sort().join(',');
    
    // Əgər schoolIds dəyişməyibsə və ya boşdursa, sorğu etməyək
    if (prevSchoolIdsRef.current === schoolIdsString || !schoolIds.length || isFetchingRef.current) {
      return;
    }
    
    prevSchoolIdsRef.current = schoolIdsString;
    
    async function fetchSchoolAdmins() {
      if (isFetchingRef.current) return;
      
      isFetchingRef.current = true;
      setIsLoading(true);
      setError(null);
      
      try {
        // Bütün admin məlumatlarını bir sorğu ilə əldə edirik
        const { data: userRoles, error: userRolesError } = await supabase
          .from('user_roles')
          .select(`
            user_id,
            school_id,
            role,
            profiles:user_id(id, email, full_name)
          `)
          .eq('role', 'schooladmin')
          .in('school_id', schoolIds);
        
        if (userRolesError) {
          throw userRolesError;
        }
        
        const admins: {[key: string]: string} = {};
        
        // user_roles-dan admin məlumatlarını map-ə çeviririk
        if (userRoles && userRoles.length > 0) {
          userRoles.forEach(role => {
            const profile = role.profiles as any;
            let adminName = 'Təyin edilməyib';
            
            if (profile && (profile.email || profile.full_name)) {
              adminName = profile.full_name || profile.email;
            }
            
            if (role.school_id) {
              admins[role.school_id] = adminName;
            }
          });
        }
        
        // Tapılmayan məktəblər üçün schools cədvəlindən yoxlayırıq
        const missingSchoolIds = schoolIds.filter(id => !admins[id]);
        
        if (missingSchoolIds.length > 0) {
          const { data: schoolData, error: schoolError } = await supabase
            .from('schools')
            .select(`
              id, 
              admin_id,
              admin_email,
              profiles:admin_id(id, email, full_name)
            `)
            .in('id', missingSchoolIds);
          
          if (schoolError) {
            console.warn('Schools cədvəlindən admin məlumatları alınarkən xəta:', schoolError);
          } else if (schoolData && schoolData.length > 0) {
            schoolData.forEach(school => {
              const adminProfile = school.profiles as any;
              let adminName = 'Təyin edilməyib';
              
              if (adminProfile && (adminProfile.email || adminProfile.full_name)) {
                adminName = adminProfile.full_name || adminProfile.email;
              } else if (school.admin_email) {
                adminName = school.admin_email;
              }
              
              admins[school.id] = adminName;
            });
          }
        }
        
        // Hələ də tapılmayan məktəblər üçün default value
        schoolIds.forEach(schoolId => {
          if (!admins[schoolId]) {
            admins[schoolId] = 'Təyin edilməyib';
          }
        });
        
        setAdminMap(admins);
      } catch (err) {
        console.error('❌ Məktəb adminləri əldə edilərkən xəta:', err);
        setError(err as Error);
        
        // Xəta halında default values
        const defaultAdmins: {[key: string]: string} = {};
        schoolIds.forEach(schoolId => {
          defaultAdmins[schoolId] = 'Təyin edilməyib';
        });
        setAdminMap(defaultAdmins);
      } finally {
        setIsLoading(false);
        setTimeout(() => {
          isFetchingRef.current = false;
        }, 100); // Qısa timeout
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