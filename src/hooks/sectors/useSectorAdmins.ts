import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useSectorAdmins(sectorIds: string[]) {
  const [adminMap, setAdminMap] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!sectorIds.length) {
      return;
    }

    async function fetchSectorAdmins() {
      setIsLoading(true);
      try {
        console.log('Sektor IDs:', sectorIds);
        
        // 1. Əvvəlcə user_roles cədvəlindən sektor adminlərini əldə edirik
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select(`
            user_id,
            sector_id,
            role,
            profiles:user_id(email, full_name)
          `)
          .eq('role', 'sectoradmin')
          .in('sector_id', sectorIds);
        
        console.log('Sektor admin məlumatları (user_roles):', roleData);
        
        if (roleError) {
          console.error('user_roles sorgu xətası:', roleError);
          throw roleError;
        }
        
        if (!roleData || roleData.length === 0) {
          console.log('Sektor adminləri tapılmadı, sectors cədvəlindən birbaşa yükləməyə çalışırıq...');
          
          // 2. Əgər user_roles cədvəlində admin tapılmadısa, sectors cədvəlindən admin məlumatlarını əldə etməyə çalışırıq
          const { data: sectorData, error: sectorError } = await supabase
            .from('sectors')
            .select(`
              id, 
              admin_id,
              admin_email,
              adminProfile:admin_id(email, full_name)
            `)
            .in('id', sectorIds);
          
          console.log('Sektor admin məlumatları (sectors):', sectorData);
          
          if (sectorError) {
            console.error('sectors sorgu xətası:', sectorError);
            throw sectorError;
          }
          
          // Sectors cədvəlindən admin məlumatlarını map edirik
          const admins: {[key: string]: string} = {};
          
          if (sectorData && sectorData.length > 0) {
            sectorData.forEach(sector => {
              const adminProfile = sector.adminProfile as any;
              let adminName = '';
              
              if (adminProfile && (adminProfile.email || adminProfile.full_name)) {
                adminName = adminProfile.email || adminProfile.full_name;
              } else if (sector.admin_email) {
                adminName = sector.admin_email;
              } else {
                adminName = `Admin ID: ${sector.admin_id || '-'}`;
              }
              
              admins[sector.id] = adminName;
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
            
            admins[role.sector_id] = adminName;
          });
          
          setAdminMap(admins);
        }
      } catch (err) {
        console.error('Sektor adminləri əldə edilərkən xəta:', err);
        setError(err as Error);
        toast.error('Admin məlumatları yüklənərkən xəta: ' + (err as Error).message);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchSectorAdmins();
  }, [sectorIds]);
  
  return { 
    adminMap, 
    isLoading, 
    error 
  };
}

export default useSectorAdmins;
