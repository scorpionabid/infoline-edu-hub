
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { UserFilter } from '@/hooks/useUserList';

export const useUserFetch = (
  filter: UserFilter = {}, // Provide default empty object
  currentPage: number = 1, // Provide default value
  pageSize: number = 10    // Provide default value
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
      
      // Ensure filter is not undefined
      const safeFilter = filter || {};
      
      // Filter parametrlərini hazırlayırıq
      const filterParams: Record<string, any> = {
        p_page: currentPage || 1,
        p_limit: pageSize || 10
      };
      
      // Null olmayan filter parametrlərini əlavə edirik
      filterParams.p_role = safeFilter.role ? [safeFilter.role] : null;
      filterParams.p_region_id = safeFilter.regionId || null;
      filterParams.p_sector_id = safeFilter.sectorId || null;
      filterParams.p_school_id = safeFilter.schoolId || null;
      filterParams.p_status = safeFilter.status ? [safeFilter.status] : null;
      filterParams.p_search = safeFilter.search || null;
      
      console.log('Sending filter params to DB:', filterParams);
      
      // Database funksiyası ilə istifadəçiləri əldə edirik
      const { data: userData, error: fetchError } = await supabase.rpc(
        'get_filtered_users',
        filterParams
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
          p_role: filterParams.p_role,
          p_region_id: filterParams.p_region_id,
          p_sector_id: filterParams.p_sector_id, 
          p_school_id: filterParams.p_school_id,
          p_status: filterParams.p_status,
          p_search: filterParams.p_search
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
        try {
          let user;
          // JSON.parse bəzən xəta verə bilər, bunu try-catch ilə idarə edirik
          if (typeof item.user_json === 'string') {
            user = JSON.parse(item.user_json);
          } else if (typeof item.user_json === 'object') {
            user = item.user_json;
          } else {
            console.error('Unexpected user_json type:', typeof item.user_json);
            user = {}; // Default boş obyekt 
          }
          
          return {
            id: user.id || '',
            email: user.email || '',
            full_name: user.full_name || '',
            name: user.full_name || '',
            role: user.role || '',
            region_id: user.region_id || '',
            sector_id: user.sector_id || '',
            school_id: user.school_id || '',
            regionId: user.region_id || '',
            sectorId: user.sector_id || '',
            schoolId: user.school_id || '',
            phone: user.phone || '',
            position: user.position || '',
            language: user.language || 'az',
            avatar: user.avatar || '',
            status: user.status || 'active',
            last_login: user.last_login || '',
            lastLogin: user.last_login || '',
            created_at: user.created_at || '',
            createdAt: user.created_at || '',
            updated_at: user.updated_at || '',
            updatedAt: user.updated_at || '',
            entityName: user.entity_name || '',
            notificationSettings: user.notification_settings || {
              email: true,
              inApp: true,
              sms: false,
              deadlineReminders: true
            },
            twoFactorEnabled: false
          };
        } catch (parseError) {
          console.error('Error parsing user data:', parseError, item);
          return {
            id: '',
            email: '',
            full_name: 'Error loading user',
            name: 'Error loading user',
            role: '',
            status: 'active',
            language: 'az',
            notificationSettings: {
              email: true,
              inApp: true,
              sms: false,
              deadlineReminders: true
            },
            twoFactorEnabled: false
          };
        }
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
