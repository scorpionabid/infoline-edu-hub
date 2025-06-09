
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData, UserRole } from '@/types/user';
import { toast } from 'sonner';

type ValidUserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin';

export const useUserOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createUser = async (userData: Partial<FullUserData>) => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate role
      const validRoles: ValidUserRole[] = ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin'];
      const userRole = userData.role as ValidUserRole;
      
      if (!validRoles.includes(userRole)) {
        throw new Error('Invalid user role');
      }

      // Create user profile - remove id from insert
      const profileData = {
        full_name: userData.full_name || userData.fullName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        position: userData.position || '',
        language: userData.language || 'az',
        status: userData.status || 'active'
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) throw error;

      // Create user role with proper type casting
      const roleData = {
        user_id: data.id,
        role: userRole as ValidUserRole,
        region_id: userData.region_id || userData.regionId || null,
        sector_id: userData.sector_id || userData.sectorId || null,
        school_id: userData.school_id || userData.schoolId || null
      };

      const { error: roleError } = await supabase
        .from('user_roles')
        .insert(roleData);

      if (roleError) throw roleError;

      toast.success('User created successfully');
      return data;
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err as Error);
      toast.error('Failed to create user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId: string, userData: Partial<FullUserData>) => {
    setLoading(true);
    setError(null);
    
    try {
      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: userData.full_name || userData.fullName,
          email: userData.email,
          phone: userData.phone,
          position: userData.position,
          language: userData.language,
          status: userData.status
        })
        .eq('id', userId);

      if (error) throw error;

      // Update role if provided
      if (userData.role) {
        const validRoles: ValidUserRole[] = ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin'];
        const userRole = userData.role as ValidUserRole;
        
        if (validRoles.includes(userRole)) {
          const { error: roleError } = await supabase
            .from('user_roles')
            .update({
              role: userRole,
              region_id: userData.region_id || userData.regionId,
              sector_id: userData.sector_id || userData.sectorId,
              school_id: userData.school_id || userData.schoolId
            })
            .eq('user_id', userId);

          if (roleError) throw roleError;
        }
      }

      toast.success('User updated successfully');
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err as Error);
      toast.error('Failed to update user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Delete user role first
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (roleError) throw roleError;

      // Delete profile
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast.success('User deleted successfully');
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err as Error);
      toast.error('Failed to delete user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createUser,
    updateUser,
    deleteUser
  };
};

export default useUserOperations;
