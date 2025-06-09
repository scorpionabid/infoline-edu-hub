
import { useState, useEffect, useRef } from 'react';
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
  
  // Loop-u önləmək üçün ref istifadə edirik
  const prevSchoolIdsRef = useRef<string>('');
  const isFetchingRef = useRef(false);

  useEffect(() => {
    const schoolIdsString = schoolIds.sort().join(',');
    
    // Əgər schoolIds dəyişməyibsə, yenidən sorğu etməyək
    if (prevSchoolIdsRef.current === schoolIdsString || !schoolIds.length || isFetchingRef.current) {
      return;
    }
    
    prevSchoolIdsRef.current = schoolIdsString;
    console.log('📋 Adminləri əldə etməyə başlayırıq...', schoolIds);
    
    async function fetchSchoolAdmins() {
      if (isFetchingRef.current) return;
      
      isFetchingRef.current = true;
      setIsLoading(true);
      
      try {
        // 1. user_roles cədvəlindən məktəb adminlərini əldə edirik
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
        
        console.log('👤 Məktəb admin məlumatları (user_roles):', roleData);
        
        if (roleError) {
          console.error('❌ user_roles sorgu xətası:', roleError);
          throw roleError;
        }
        
        const admins: {[key: string]: string} = {};
        
        if (roleData && roleData.length > 0) {
          roleData.forEach(role => {
            const profile = role.profiles as any;
            let adminName = 'Təyin edilməyib';
            
            if (profile && (profile.email || profile.full_name)) {
              adminName = profile.full_name || profile.email;
            }
            
            admins[role.school_id] = adminName;
          });
        } else {
          console.log('🔍 user_roles-da admin tapılmadı, schools cədvəlindən yoxlayırıq...');
          
          // 2. schools cədvəlindən admin məlumatlarını əldə etməyə çalışırıq
          const { data: schoolData, error: schoolError } = await supabase
            .from('schools')
            .select(`
              id, 
              admin_id,
              admin_email,
              profiles:admin_id(email, full_name)
            `)
            .in('id', schoolIds);
          
          console.log('🏫 Məktəb admin məlumatları (schools):', schoolData);
          
          if (schoolError) {
            console.error('❌ schools sorgu xətası:', schoolError);
            throw schoolError;
          }
          
          if (schoolData && schoolData.length > 0) {
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
        
        // Tapılmayan məktəblər üçün default value
        schoolIds.forEach(schoolId => {
          if (!admins[schoolId]) {
            admins[schoolId] = 'Təyin edilməyib';
          }
        });
        
        console.log('✅ Final admin map:', admins);
        setAdminMap(admins);
      } catch (err) {
        console.error('❌ Məktəb adminləri əldə edilərkən xəta:', err);
        setError(err as Error);
        toast.error('Admin məlumatları yüklənərkən xəta: ' + (err as Error).message);
      } finally {
        setIsLoading(false);
        setTimeout(() => {
          isFetchingRef.current = false;
        }, 500);
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
