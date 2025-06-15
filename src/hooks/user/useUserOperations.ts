
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/user';
import { toast } from 'sonner';
import { mapUserDataProperties } from '@/utils/buildFixes';

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

      const mappedData = mapUserDataProperties(userData);

      // Create auth user first via auth.admin
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email || '',
        password: Math.random().toString(36).slice(-8), // Generate random password
        email_confirm: true,
        user_metadata: {
          full_name: mappedData.full_name,
          role: userRole,
          region_id: mappedData.region_id || null,
          sector_id: mappedData.sector_id || null,
          school_id: mappedData.school_id || null
        }
      });

      if (authError) throw authError;
      if (!authUser.user) throw new Error('Failed to create auth user');

      // The trigger should automatically create the profile and user_role
      // Let's verify and update if needed
      const profileData = {
        id: authUser.user.id,
        full_name: mappedData.full_name,
        email: userData.email || '',
        phone: userData.phone || '',
        position: userData.position || '',
        language: userData.language || 'az',
        status: userData.status || 'active'
      };

      // Upsert the profile to ensure it exists with correct data
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData);

      if (profileError) throw profileError;

      toast.success('User created successfully');
      return authUser.user;
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
      const mappedData = mapUserDataProperties(userData);
      
      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: mappedData.full_name,
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
              region_id: mappedData.region_id,
              sector_id: mappedData.sector_id,
              school_id: mappedData.school_id
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
