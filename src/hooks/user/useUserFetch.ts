
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData, UserRole } from '@/types/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth';
import { UserFilter } from '@/hooks/useUserList';
import { fetchAdminEntityData } from './useUserData';

export const useUserFetch = (
  filter: UserFilter,
  currentPage: number,
  pageSize: number
) => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<FullUserData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching users with filter:', filter);
      let query = supabase
        .from('user_roles')
        .select('*', { count: 'exact' });
      
      if (filter.role) {
        query = query.eq('role', filter.role as any);
      }
      
      if (currentUser?.role === 'regionadmin' && currentUser?.regionId) {
        query = query.eq('region_id', currentUser.regionId);
      } else if (filter.region) {
        query = query.eq('region_id', filter.region);
      }
      
      if (filter.sector) {
        query = query.eq('sector_id', filter.sector);
      }
      
      if (filter.school) {
        query = query.eq('school_id', filter.school);
      }
      
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);
      
      const { data: rolesData, error: rolesError, count } = await query;
      console.log('User roles fetched:', rolesData);
      
      if (rolesError) {
        console.error('Error fetching user roles:', rolesError);
        throw rolesError;
      }
      
      if (!rolesData || rolesData.length === 0) {
        console.log('No users found');
        setUsers([]);
        setTotalCount(0);
        setLoading(false);
        return;
      }
      
      const userIds = rolesData.map(item => item.user_id);
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }
      
      console.log('User profiles fetched:', profilesData);
      
      const profilesMap: Record<string, any> = {};
      if (profilesData) {
        profilesData.forEach(profile => {
          profilesMap[profile.id] = profile;
        });
      }
      
      // User e-poçtlarını əldə edirik
      const { data: emailsData, error: emailsError } = await supabase.rpc('get_user_emails_by_ids', { user_ids: userIds });
      
      if (emailsError) {
        console.log('Warning: Could not fetch user emails:', emailsError);
        // İdeal halda xəta atmamalıyıq, əməliyyata davam edə bilərik
      }
      
      const emailMap: Record<string, string> = {};
      if (emailsData) {
        emailsData.forEach((item: { id: string, email: string }) => {
          emailMap[item.id] = item.email;
        });
      }
      
      let filteredRolesData = rolesData;
      if (filter.status || filter.search) {
        filteredRolesData = rolesData.filter(roleItem => {
          const profile = profilesMap[roleItem.user_id] || {};
          
          if (filter.status && profile.status !== filter.status) {
            return false;
          }
          
          if (filter.search) {
            const searchTerm = filter.search.toLowerCase();
            const fullName = (profile.full_name || '').toLowerCase();
            const email = (emailMap[roleItem.user_id] || '').toLowerCase();
            
            if (!fullName.includes(searchTerm) && !email.includes(searchTerm)) {
              return false;
            }
          }
          
          return true;
        });
      }
      
      // Admin entity məlumatlarını əldə edirik
      console.log('Fetching admin entity data');
      const adminEntityPromises = filteredRolesData.map(async (roleItem) => {
        try {
          return await fetchAdminEntityData(roleItem);
        } catch (error) {
          console.error('Error fetching admin entity data:', error);
          return null;
        }
      });
      
      const adminEntities = await Promise.all(adminEntityPromises);
      console.log('Admin entities fetched');
      
      // İstifadəçi məlumatlarını formatlayırıq
      const formattedUsers: FullUserData[] = filteredRolesData.map((roleItem, index) => {
        const profile = profilesMap[roleItem.user_id] || {};
        
        let typedStatus: 'active' | 'inactive' | 'blocked' = 'active';
        const statusValue = profile.status || 'active';
        
        if (statusValue === 'active' || statusValue === 'inactive' || statusValue === 'blocked') {
          typedStatus = statusValue as 'active' | 'inactive' | 'blocked';
        }
        
        // Rolu UserRole tipinə məcburi çeviririk
        const roleValue = roleItem.role as UserRole;
        
        return {
          id: roleItem.user_id,
          email: emailMap[roleItem.user_id] || 'N/A',
          full_name: profile.full_name || 'İsimsiz İstifadəçi',
          role: roleValue,
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
          
          // Əlavə tətbiq xüsusiyyətləri üçün alias-lar
          name: profile.full_name || 'İsimsiz İstifadəçi',
          regionId: roleItem.region_id,
          sectorId: roleItem.sector_id,
          schoolId: roleItem.school_id,
          lastLogin: profile.last_login,
          createdAt: profile.created_at || '',
          updatedAt: profile.updated_at || '',
          
          adminEntity: adminEntities[index],
          
          twoFactorEnabled: false,
          notificationSettings: {
            email: true,
            system: true
          }
        };
      });
      
      console.log('Users formatted:', formattedUsers.length);
      setUsers(formattedUsers);
      setTotalCount(count || filteredRolesData.length);
    } catch (err) {
      console.error('İstifadəçiləri əldə edərkən xəta:', err);
      setError(err instanceof Error ? err : new Error('İstifadəçilər yüklənərkən xəta baş verdi'));
      toast.error('İstifadəçilər yüklənərkən xəta baş verdi');
      setUsers([]); // Xəta baş verdikdə boş massiv qaytar
    } finally {
      setLoading(false);
    }
  }, [filter, currentPage, pageSize, currentUser]);

  return {
    users,
    totalCount,
    loading,
    error,
    fetchUsers,
    setUsers,
    setTotalCount
  };
};
