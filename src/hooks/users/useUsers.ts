
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/user';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUserData, setSelectedUserData] = useState<User>({} as User);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          phone,
          position,
          avatar,
          language,
          status,
          last_login,
          created_at,
          updated_at
        `);

      if (error) throw error;

      // Əgər data array deyilsə, boş array qaytar
      if (!Array.isArray(data)) {
        setUsers([]);
        return;
      }

      // İstifadəçi rollarını əldə et
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // İstifadəçilərə rolları əlavə et
      const usersWithRoles = data.map(user => {
        const userRole = rolesData.find(role => role.user_id === user.id);
        return {
          ...user,
          role: userRole?.role || 'user',
          region_id: userRole?.region_id,
          sector_id: userRole?.sector_id,
          school_id: userRole?.school_id,
          regionId: userRole?.region_id,
          sectorId: userRole?.sector_id,
          schoolId: userRole?.school_id,
          email: user.email || ''
        } as User;
      });

      setUsers(usersWithRoles);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserById = useCallback(async (userId: string) => {
    if (!userId) return null;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          phone,
          position,
          avatar,
          language,
          status,
          last_login,
          created_at,
          updated_at
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;

      // İstifadəçi rolunu əldə et
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (roleError && roleError.code !== 'PGRST116') throw roleError;

      const user: User = {
        ...data,
        role: roleData?.role || 'user',
        region_id: roleData?.region_id,
        sector_id: roleData?.sector_id,
        school_id: roleData?.school_id,
        regionId: roleData?.region_id,
        sectorId: roleData?.sector_id,
        schoolId: roleData?.school_id,
        email: data.email || ''
      };

      setSelectedUserData(user);
      return user;
    } catch (error: any) {
      console.error('Error fetching user by ID:', error);
      setError(error.message);
      return null;
    }
  }, []);

  const selectUser = useCallback(async (userId: string) => {
    setSelectedUserId(userId);
    await getUserById(userId);
  }, [getUserById]);

  return {
    users,
    loading,
    error,
    selectedUserId,
    selectedUserData,
    setSelectedUserId,
    fetchUsers,
    getUserById,
    selectUser
  };
};
