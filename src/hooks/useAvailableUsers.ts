
import { useState, useEffect } from 'react';
import { FullUserData } from '@/types/supabase';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { 
  fetchUserRoles, 
  fetchUserProfiles, 
  fetchAdminEntityData, 
  formatUserData 
} from './user/useUserData';
import { supabase } from '@/integrations/supabase/client';

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
      
      // 1. Edge funksiyası vasitəsilə bütün istifadəçiləri əldə et
      const { data, error } = await supabase.functions.invoke('get_all_users_with_roles');
      
      if (error) {
        console.error('Edge funksiyası xətası:', error);
        throw new Error(`İstifadəçiləri əldə edərkən xəta: ${error.message}`);
      }
      
      if (!data || !data.users || data.users.length === 0) {
        console.log('Heç bir istifadəçi tapılmadı');
        setUsers([]);
        setLoading(false);
        return;
      }
      
      const userData = data.users;
      console.log(`${userData.length} istifadəçi tapıldı`);
      
      // İstifadəçi ID-lərini toplayaq
      const userIds = userData.map((user: any) => user.id);
      
      // 2. profiles cədvəlindən məlumatları alaq
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
      
      if (profilesError) {
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
        return await fetchAdminEntityData(user);
      });
      
      const adminEntities = await Promise.all(adminEntityPromises);
      
      // Tam istifadəçi məlumatlarını formatlaşdır
      const formattedUsers = formatUserData(userData, profilesMap, adminEntities);
      
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
