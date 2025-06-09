
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData, UserFilter, NotificationSettings } from '@/types/user';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { usePermissions } from '@/hooks/auth/usePermissions';

type ValidUserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin';

export const useUserFetch = () => {
  const [users, setUsers] = useState<FullUserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const user = useAuthStore(selectUser);
  const { userRole, regionId, sectorId } = usePermissions();

  const fetchUsers = useCallback(async (filters: UserFilter = {}, page: number = 1, limit: number = 20) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching users with role:', userRole, 'regionId:', regionId, 'sectorId:', sectorId);

      // Build base query
      let query = supabase
        .from('profiles')
        .select(`
          *,
          user_roles!inner(
            role,
            region_id,
            sector_id,
            school_id
          )
        `, { count: 'exact' });

      // Apply role-based restrictions
      if (userRole === 'regionadmin' && regionId) {
        query = query.eq('user_roles.region_id', regionId);
      } else if (userRole === 'sectoradmin' && sectorId) {
        query = query.eq('user_roles.sector_id', sectorId);
        query = query.eq('user_roles.role', 'schooladmin'); // Sector admins can only see school admins
      }

      // Apply filters - handle both string and array types safely with proper casting
      if (filters.role) {
        if (Array.isArray(filters.role)) {
          if (filters.role.length > 0) {
            // Cast array elements to ValidUserRole
            const validRoles = filters.role.filter((role): role is ValidUserRole => 
              ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin'].includes(role as ValidUserRole)
            );
            if (validRoles.length > 0) {
              query = query.in('user_roles.role', validRoles);
            }
          }
        } else {
          // Cast single role to ValidUserRole
          const validRole = ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin'].includes(filters.role as ValidUserRole) 
            ? filters.role as ValidUserRole 
            : null;
          if (validRole) {
            query = query.eq('user_roles.role', validRole);
          }
        }
      }
      if (filters.region_id) {
        query = query.eq('user_roles.region_id', filters.region_id);
      }
      if (filters.sector_id) {
        query = query.eq('user_roles.sector_id', filters.sector_id);
      }
      if (filters.school_id) {
        query = query.eq('user_roles.school_id', filters.school_id);
      }
      if (filters.status) {
        if (Array.isArray(filters.status)) {
          if (filters.status.length > 0) {
            query = query.in('status', filters.status);
          }
        } else {
          query = query.eq('status', filters.status);
        }
      }
      if (filters.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      // Pagination
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);
      query = query.order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      // Default notification settings
      const defaultNotificationSettings: NotificationSettings = {
        email: true,
        push: false,
        sms: false,
        inApp: true,
        system: true,
        deadline: true,
        deadlineReminders: true,
        statusUpdates: true,
        weeklyReports: false
      };

      // Transform data to match FullUserData interface
      const transformedUsers: FullUserData[] = (data || []).map((item: any) => {
        const userRole = item.user_roles;
        
        return {
          id: item.id,
          email: item.email,
          full_name: item.full_name || '',
          fullName: item.full_name || '',
          name: item.full_name || '',
          role: userRole?.role || 'user',
          region_id: userRole?.region_id,
          sector_id: userRole?.sector_id,
          school_id: userRole?.school_id,
          regionId: userRole?.region_id,
          sectorId: userRole?.sector_id,
          schoolId: userRole?.school_id,
          phone: item.phone || '',
          position: item.position || '',
          language: item.language || 'az',
          avatar: item.avatar || '',
          avatar_url: item.avatar || '',
          status: item.status || 'active',
          last_login: item.last_login,
          last_sign_in_at: item.last_login,
          created_at: item.created_at,
          updated_at: item.updated_at,
          preferences: {},
          notificationSettings: defaultNotificationSettings,
          notification_settings: defaultNotificationSettings,
          entityName: undefined
        };
      });

      setUsers(transformedUsers);
      setTotalCount(count || 0);

    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [user, userRole, regionId, sectorId]);

  const refreshUsers = useCallback(() => {
    return fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    totalCount,
    fetchUsers,
    refreshUsers
  };
};

export default useUserFetch;
