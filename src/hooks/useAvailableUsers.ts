
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
      
      // 1. user_roles cədvəlindən məlumatları alaq
      const { data: rolesData, error: rolesError, count } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact' });
      
      if (rolesError) throw rolesError;
      
      if (!rolesData || rolesData.length === 0) {
        setUsers([]);
        setLoading(false);
        return;
      }
      
      // İstifadəçi ID-lərini toplayaq
      const userIds = rolesData.map(item => item.user_id);
      
      // 2. profiles cədvəlindən məlumatları alaq
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
      
      if (profilesError) throw profilesError;
      
      // Profil məlumatlarını ID-yə görə map edək
      const profilesMap: Record<string, any> = {};
      if (profilesData) {
        profilesData.forEach(profile => {
          profilesMap[profile.id] = profile;
        });
      }
      
      // 3. İstifadəçi məlumatlarını əldə etmək
      const { data: emailsData } = await supabase.rpc('get_user_emails_by_ids', { user_ids: userIds });
      
      const emailMap: Record<string, string> = {};
      if (emailsData) {
        emailsData.forEach((item: { id: string, email: string }) => {
          emailMap[item.id] = item.email;
        });
      }
      
      // Tam istifadəçi məlumatlarını formatlaşdır
      const formattedUsers: FullUserData[] = rolesData.map((roleItem) => {
        const profile = profilesMap[roleItem.user_id] || {};
        
        // Status dəyərini düzgün tipə çevirmək
        const statusValue = profile.status || 'active';
        const typedStatus = (statusValue === 'active' || statusValue === 'inactive' || statusValue === 'blocked') 
          ? statusValue as 'active' | 'inactive' | 'blocked'
          : 'active' as 'active' | 'inactive' | 'blocked';
        
        return {
          id: roleItem.user_id,
          email: emailMap[roleItem.user_id] || 'N/A',
          full_name: profile.full_name || 'İsimsiz İstifadəçi',
          role: roleItem.role,
          region_id: roleItem.region_id,
          sector_id: roleItem.sector_id,
          school_id: roleItem.school_id,
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
          regionId: roleItem.region_id,
          sectorId: roleItem.sector_id,
          schoolId: roleItem.school_id,
          lastLogin: profile.last_login,
          createdAt: profile.created_at || '',
          updatedAt: profile.updated_at || '',
        };
      });
      
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
