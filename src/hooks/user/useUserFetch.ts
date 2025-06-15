import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserData, UserFilter, NotificationSettings } from '@/types/user';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { usePermissions } from '@/hooks/auth/usePermissions';

type ValidUserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin';

export const useUserFetch = () => {
  const [users, setUsers] = useState<UserData[]>([]);
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
        query = query.eq('user_roles.role', 'schooladmin');
      }

      // Apply filters
      if (filters.role && Array.isArray(filters.role) && filters.role.length > 0) {
        const validRoles = filters.role.filter((role): role is ValidUserRole => 
          ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin'].includes(role as ValidUserRole)
        );
        if (validRoles.length > 0) {
          query = query.in('user_roles.role', validRoles);
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
      if (filters.status && Array.isArray(filters.status) && filters.status.length > 0) {
        query = query.in('status', filters.status);
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
        sms: false,
        inApp: true,
        system: true,
        deadlineReminders: true,
        email_notifications: true,
        sms_notifications: false,
        push_notifications: false,
        notification_frequency: 'daily'
      };

      const processedUsers: UserData[] = data?.map((profile: any) => ({
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        name: profile.full_name,
        role: profile.user_roles.role,
        region_id: profile.user_roles.region_id,
        regionId: profile.user_roles.region_id,
        sector_id: profile.user_roles.sector_id,
        sectorId: profile.user_roles.sector_id,
        school_id: profile.user_roles.school_id,
        schoolId: profile.user_roles.school_id,
        phone: profile.phone,
        position: profile.position,
        language: profile.language || 'az',
        avatar: profile.avatar,
        status: profile.status || 'active',
        last_login: profile.last_login,
        lastLogin: profile.last_login,
        created_at: profile.created_at,
        createdAt: profile.created_at,
        updated_at: profile.updated_at,
        updatedAt: profile.updated_at,
        entity_name: profile.entity_name,
        entityName: profile.entity_name
      })) || [];

      setUsers(processedUsers);
      setTotalCount(count || 0);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user, userRole, regionId, sectorId]);

  return {
    users,
    loading,
    error,
    totalCount,
    fetchUsers
  };
};
