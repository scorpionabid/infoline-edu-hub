
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/supabase';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

export const useAvailableUsers = () => {
  const { t } = useLanguage();
  const [users, setUsers] = useState<FullUserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // İstifadəçiləri əldə etmə
  const fetchAvailableUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('İstifadəçiləri əldə etmə başladı');
      
      // 1. auth.users və user_roles cədvəlindən məlumatları alaq
      const { data: userData, error: authError } = await supabase.rpc('get_all_users_with_roles');
      
      if (authError) {
        console.error('İstifadəçi məlumatlarını əldə edərkən xəta:', authError);
        throw authError;
      }
      
      if (!userData || userData.length === 0) {
        console.log('Heç bir istifadəçi tapılmadı');
        setUsers([]);
        setLoading(false);
        return;
      }
      
      console.log(`${userData.length} istifadəçi tapıldı`);
      
      // İstifadəçi ID-lərini toplayaq
      const userIds = userData.map((item: any) => item.id);
      
      // 2. profiles cədvəlindən məlumatları alaq
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
      
      if (profilesError) {
        console.error('Profilləri əldə edərkən xəta:', profilesError);
        throw profilesError;
      }
      
      console.log(`${profilesData?.length || 0} profil tapıldı`);
      
      // Profil məlumatlarını ID-yə görə map edək
      const profilesMap: Record<string, any> = {};
      if (profilesData) {
        profilesData.forEach(profile => {
          profilesMap[profile.id] = profile;
        });
      }
      
      // Admin entity məlumatlarını əldə et
      const adminEntityPromises = userData.map(async (user: any) => {
        if (!user.role.includes('admin') || 
           (user.role === 'regionadmin' && !user.region_id) ||
           (user.role === 'sectoradmin' && !user.sector_id) || 
           (user.role === 'schooladmin' && !user.school_id)) {
          return null;
        }
        
        try {
          let adminEntity: any = null;
          
          if (user.role === 'regionadmin' && user.region_id) {
            const { data: regionData } = await supabase
              .from('regions')
              .select('name, status')
              .eq('id', user.region_id)
              .single();
            
            if (regionData) {
              adminEntity = {
                type: 'region',
                name: regionData.name,
                status: regionData.status
              };
            }
          } else if (user.role === 'sectoradmin' && user.sector_id) {
            const { data: sectorData } = await supabase
              .from('sectors')
              .select('name, status, regions(name)')
              .eq('id', user.sector_id)
              .single();
            
            if (sectorData) {
              adminEntity = {
                type: 'sector',
                name: sectorData.name,
                status: sectorData.status,
                regionName: sectorData.regions?.name
              };
            }
          } else if (user.role === 'schooladmin' && user.school_id) {
            const { data: schoolData } = await supabase
              .from('schools')
              .select('name, status, type, sectors(name), regions(name)')
              .eq('id', user.school_id)
              .single();
            
            if (schoolData) {
              adminEntity = {
                type: 'school',
                name: schoolData.name,
                status: schoolData.status,
                schoolType: schoolData.type,
                sectorName: schoolData.sectors?.name,
                regionName: schoolData.regions?.name
              };
            }
          }
          
          return adminEntity;
        } catch (err) {
          console.error('Admin entity məlumatları əldə edilərkən xəta:', err);
          return null;
        }
      });
      
      const adminEntities = await Promise.all(adminEntityPromises);
      
      // Tam istifadəçi məlumatlarını formatlaşdır
      const formattedUsers: FullUserData[] = userData.map((user: any, index: number) => {
        const profile = profilesMap[user.id] || {};
        
        // Status dəyərini düzgün tipə çevirmək
        const statusValue = profile.status || 'active';
        const typedStatus = (statusValue === 'active' || statusValue === 'inactive' || statusValue === 'blocked') 
          ? statusValue as 'active' | 'inactive' | 'blocked'
          : 'active' as 'active' | 'inactive' | 'blocked';
        
        return {
          id: user.id,
          email: user.email || 'N/A',
          full_name: profile.full_name || 'İsimsiz İstifadəçi',
          role: user.role,
          region_id: user.region_id,
          sector_id: user.sector_id,
          school_id: user.school_id,
          phone: profile.phone,
          position: profile.position,
          language: profile.language || 'az',
          avatar: profile.avatar,
          status: typedStatus,
          last_login: profile.last_login,
          created_at: profile.created_at || '',
          updated_at: profile.updated_at || '',
          
          // Alias-lar
          name: profile.full_name || 'İsimsiz İstifadəçi',
          regionId: user.region_id,
          sectorId: user.sector_id,
          schoolId: user.school_id,
          lastLogin: profile.last_login,
          createdAt: profile.created_at || '',
          updatedAt: profile.updated_at || '',
          
          // Admin entity
          adminEntity: adminEntities[index],
          
          // Əlavə xüsusiyyətlər
          twoFactorEnabled: false,
          notificationSettings: {
            email: true,
            system: true
          }
        };
      });
      
      console.log(`${formattedUsers.length} istifadəçi formatlandı`);
      setUsers(formattedUsers);
    } catch (err) {
      console.error('İstifadəçiləri əldə edərkən xəta:', err);
      setError(err instanceof Error ? err : new Error('İstifadəçilər yüklənərkən xəta baş verdi'));
      toast.error('İstifadəçilər yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  // İlk dəfə yüklənmə
  useEffect(() => {
    fetchAvailableUsers();
  }, []);

  return {
    users,
    loading,
    error,
    fetchAvailableUsers
  };
};
