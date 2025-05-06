
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { UserFilter } from '@/hooks/useUserList';

export const useUserFetch = (
  filter: UserFilter,
  currentPage: number,
  pageSize: number
) => {
  const [users, setUsers] = useState<FullUserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const { session } = useAuth();
  
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching users with filter:', filter);
      
      // Database funksiyası ilə istifadəçiləri əldə edirik
      const { data: userData, error: fetchError } = await supabase.rpc(
        'get_filtered_users',
        {
          p_role: filter.role ? [filter.role].filter(Boolean) : null,
          p_region_id: filter.regionId || null,
          p_sector_id: filter.sectorId || null,
          p_school_id: filter.schoolId || null,
          p_status: filter.status ? [filter.status].filter(Boolean) : null,
          p_search: filter.search || null,
          p_page: currentPage,
          p_limit: pageSize
        }
      );
      
      if (fetchError) {
        console.error('Error fetching users:', fetchError);
        throw new Error(`İstifadəçilər əldə edilərkən xəta: ${fetchError.message}`);
      }
      
      console.log('Users fetched:', userData?.length || 0);
      
      // Count-u da əldə edirik
      const { data: countData, error: countError } = await supabase.rpc(
        'get_filtered_users_count',
        {
          p_role: filter.role ? [filter.role].filter(Boolean) : null,
          p_region_id: filter.regionId || null,
          p_sector_id: filter.sectorId || null,
          p_school_id: filter.schoolId || null,
          p_status: filter.status ? [filter.status].filter(Boolean) : null,
          p_search: filter.search || null
        }
      );
      
      if (countError) {
        console.error('Error getting user count:', countError);
      } else {
        setTotalCount(countData || 0);
        console.log('Total user count:', countData);
      }
      
      // Verilənləri FullUserData formatına çeviririk
      const formattedUsers: FullUserData[] = (userData || []).map((item: any) => {
        const user = JSON.parse(item.user_json);
        return {
          id: user.id,
          email: user.email || '',
          full_name: user.full_name || '',
          name: user.full_name || '',
          role: user.role || '',
          region_id: user.region_id,
          sector_id: user.sector_id,
          school_id: user.school_id,
          regionId: user.region_id,
          sectorId: user.sector_id,
          schoolId: user.school_id,
          phone: user.phone,
          position: user.position,
          language: user.language || 'az',
          avatar: user.avatar,
          status: user.status || 'active',
          last_login: user.last_login,
          lastLogin: user.last_login,
          created_at: user.created_at,
          createdAt: user.created_at,
          updated_at: user.updated_at,
          updatedAt: user.updated_at,
          entityName: user.entity_name,
          notificationSettings: {
            email: true,
            inApp: true,
            sms: false,
            deadlineReminders: true
          },
          twoFactorEnabled: false
        };
      });
      
      setUsers(formattedUsers);
      
    } catch (err) {
      console.error('Error in useUserFetch:', err);
      setError(err instanceof Error ? err : new Error('İstifadəçilər əldə edilərkən xəta baş verdi'));
      toast.error('İstifadəçilər əldə edilərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  }, [filter, currentPage, pageSize, session]);
  
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  return {
    users,
    loading,
    error,
    totalCount,
    refetch: fetchUsers
  };
};
