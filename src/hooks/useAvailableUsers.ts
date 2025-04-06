
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/supabase';
import { fetchAvailableUsersService } from '@/hooks/user/userFetchService';

export interface UseAvailableUsersReturn {
  users: FullUserData[];
  loading: boolean;
  error: Error | null;
  fetchAvailableUsers: () => Promise<void>;
}

export const useAvailableUsers = (): UseAvailableUsersReturn => {
  const [users, setUsers] = useState<FullUserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Mövcud istifadəçiləri əldə etmək
  const fetchAvailableUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Mövcud istifadəçilər yüklənir...');
      
      // Birbaşa supabase-dən istifadə edək
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');
      
      if (rolesError) throw new Error(rolesError.message);
      
      if (!rolesData || rolesData.length === 0) {
        console.warn('Heç bir istifadəçi rolu tapılmadı');
        setUsers([]);
        return;
      }
      
      const userIds = rolesData.map(role => role.user_id);
      
      // İstifadəçi profillərini əldə edək
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
      
      if (profilesError) throw new Error(profilesError.message);
      
      // İstifadəçi e-poçtlarını əldə etmək üçün RPC funksiyası istifadə edək
      const { data: emailsData, error: emailsError } = await supabase.rpc(
        'get_user_emails_by_ids',
        { user_ids: userIds }
      );
      
      if (emailsError) throw new Error(emailsError.message);
      
      // Müxtəlif mənbələrdən məlumatları birləşdirək
      const userMap = new Map<string, FullUserData>();
      
      // İlk əvvəl əsas istifadəçi rol məlumatlarını əlavə edək
      rolesData.forEach(role => {
        userMap.set(role.user_id, {
          id: role.user_id,
          email: '', // Sonra doldurulacaq
          full_name: '', // Sonra doldurulacaq
          role: role.role as any,
          region_id: role.region_id,
          sector_id: role.sector_id,
          school_id: role.school_id,
          status: 'active', // Default
          created_at: role.created_at,
          updated_at: role.updated_at,
          
          // JavaScript/React alias fields
          name: '',
          regionId: role.region_id,
          sectorId: role.sector_id,
          schoolId: role.school_id,
          createdAt: role.created_at,
          updatedAt: role.updated_at,
        } as FullUserData);
      });
      
      // Profil məlumatlarını əlavə edək
      if (profilesData) {
        profilesData.forEach(profile => {
          if (userMap.has(profile.id)) {
            const userData = userMap.get(profile.id)!;
            userMap.set(profile.id, {
              ...userData,
              full_name: profile.full_name,
              name: profile.full_name,
              phone: profile.phone,
              position: profile.position,
              language: profile.language,
              avatar: profile.avatar,
              status: profile.status || 'active',
              last_login: profile.last_login,
              lastLogin: profile.last_login,
            });
          }
        });
      }
      
      // E-poçt məlumatlarını əlavə edək
      if (emailsData) {
        emailsData.forEach((item: { id: string, email: string }) => {
          if (userMap.has(item.id)) {
            const userData = userMap.get(item.id)!;
            userMap.set(item.id, {
              ...userData,
              email: item.email,
            });
          }
        });
      }
      
      // Map-dəki məlumatları array-ə çevirək
      const formattedUsers = Array.from(userMap.values());
      
      console.log(`${formattedUsers.length} istifadəçi yükləndi`);
      setUsers(formattedUsers);
      
    } catch (err) {
      console.error('İstifadəçiləri əldə edərkən xəta:', err);
      setError(err instanceof Error ? err : new Error('İstifadəçiləri yükləyərkən xəta baş verdi'));
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    users,
    loading,
    error,
    fetchAvailableUsers
  };
};
