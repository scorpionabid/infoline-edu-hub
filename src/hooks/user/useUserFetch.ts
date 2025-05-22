
import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth';
import { UserFilter } from '@/hooks/useUserList';

export const useUserFetch = (
  filter: UserFilter = {}, 
  currentPage: number = 1,
  pageSize: number = 10
) => {
  const [users, setUsers] = useState<FullUserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const { session } = useAuth();
  
  // Add these refs to prevent fetch loops
  const isMounted = useRef(true);
  const prevFilterRef = useRef<string>('');
  const fetchInProgressRef = useRef(false);
  const lastPageRef = useRef(currentPage);
  
  const fetchUsers = useCallback(async () => {
    // Skip if a fetch is already in progress
    if (fetchInProgressRef.current) {
      return;
    }
    
    // Convert filter and pagination to string for comparison
    const filterString = JSON.stringify({ filter, page: currentPage, pageSize });
    
    // Skip if filter and pagination haven't changed
    if (filterString === prevFilterRef.current) {
      return;
    }
    
    // Remember if only page changed without filter changing
    const onlyPageChanged = JSON.stringify({ filter, pageSize }) === 
      JSON.stringify({ filter: JSON.parse(prevFilterRef.current || '{}').filter, pageSize: JSON.parse(prevFilterRef.current || '{}').pageSize });
    
    // Update the previous filter
    prevFilterRef.current = filterString;
    
    try {
      // Set fetch in progress flag
      fetchInProgressRef.current = true;
      
      // Only show loading state for full data reloads, not just page changes
      if (!onlyPageChanged) {
        setLoading(true);
      }
      
      setError(null);
      lastPageRef.current = currentPage;
      
      console.log('Fetching users with filter:', filter, 'page:', currentPage);
      
      // Ensure filter is not undefined
      const safeFilter = filter || {};
      
      // Filter parametrlərini hazırlayırıq
      const filterParams: Record<string, any> = {
        p_page: currentPage || 1,
        p_limit: pageSize || 10
      };
      
      // Null olmayan filter parametrlərini əlavə edirik
      if (safeFilter.role) {
        filterParams.p_role = [safeFilter.role];
      } else {
        filterParams.p_role = null;
      }
      
      filterParams.p_region_id = safeFilter.regionId || null;
      filterParams.p_sector_id = safeFilter.sectorId || null;
      filterParams.p_school_id = safeFilter.schoolId || null;
      
      if (safeFilter.status) {
        filterParams.p_status = [safeFilter.status];
      } else {
        filterParams.p_status = null;
      }
      
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
      
      console.log('Users fetched:', userData?.length || 0, userData);
      
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
      
      // Don't update state if component unmounted
      if (!isMounted.current) return;
      
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
          
          // Ensure ID is present
          if (!user.id && item.id) {
            user.id = item.id;
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
            id: item.id || '',
            email: item.email || '',
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
      
      if (isMounted.current) {
        setUsers(formattedUsers);
      }
      
    } catch (err) {
      console.error('Error in useUserFetch:', err);
      if (isMounted.current) {
        setError(err instanceof Error ? err : new Error('İstifadəçilər əldə edilərkən xəta baş verdi'));
        toast.error('İstifadəçilər əldə edilərkən xəta baş verdi');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
      fetchInProgressRef.current = false;
    }
  }, [filter, currentPage, pageSize, session]);
  
  // Effect to handle cleanup and initial fetch
  useEffect(() => {
    isMounted.current = true;
    
    fetchUsers();
    
    return () => {
      isMounted.current = false;
    };
  }, [fetchUsers]);
  
  // Manually trigger refetch function that forces a new fetch
  const refetch = useCallback(() => {
    // Clear the previous filter to force refetch
    prevFilterRef.current = '';
    return fetchUsers();
  }, [fetchUsers]);
  
  return {
    users,
    loading,
    error,
    totalCount,
    refetch,
    currentPage: lastPageRef.current
  };
};
